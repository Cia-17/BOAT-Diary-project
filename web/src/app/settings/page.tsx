"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, User, Lock, BarChart3, BookOpen, Image as ImageIcon, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { getEntries } from "@/lib/supabase/entries";
import { compressImage } from "@/lib/media-compression";
import Image from "next/image";
import { ThemeSelector } from "@/components/theme/theme-selector";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [entryCount, setEntryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);
      setUserName(
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        currentUser.email?.split("@")[0] ||
        "User"
      );
      setUserEmail(currentUser.email || "");
      setProfileImage(currentUser.user_metadata?.avatar_url || null);

      try {
        const entries = await getEntries(1000);
        setEntryCount(entries.length);
      } catch (error) {
        console.error("Failed to load entry count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsUploadingImage(true);
    try {
      // Compress image
      const compressedBlob = await compressImage(file, 400, 400, 0.8);
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedBlob);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const dataUrl = `data:${compressedBlob.type};base64,${base64}`;
        
        // Update user metadata with avatar
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          data: {
            avatar_url: dataUrl,
          },
        });

        if (error) {
          alert(error.message);
          return;
        }

        setProfileImage(dataUrl);
        alert("Profile photo updated successfully! ✨");
      };
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload profile photo. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          name: userName,
          full_name: userName,
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Profile updated successfully! ✨");
    } catch (error) {
      console.error("Update profile error:", error);
      alert("An error occurred while updating profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Password changed successfully! ✨");
      setShowChangePassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      alert("An error occurred while changing password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        alert(error.message);
        return;
      }
      
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout.");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Header title="Settings" showBack />
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Settings" showBack />
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-4 pb-24">
        {/* Profile Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <User className="h-5 w-5 text-gray-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F4D35E] to-[#F4A261] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-gray-200"
                  disabled={isUploadingImage}
                  asChild
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {isUploadingImage ? "Uploading..." : "Change Photo"}
                  </span>
                </Button>
              </label>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mt-2 border-gray-200 focus:border-[#F4D35E]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  value={userEmail}
                  disabled
                  className="mt-2 bg-gray-50 border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#F4D35E] text-gray-900 hover:bg-[#F4D35E]/90 font-medium"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Theme Selector */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <Palette className="h-5 w-5 text-gray-600" />
              Journal Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeSelector />
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#FFF7D1] to-[#FFE7EF]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              Your Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#F4A261]" />
                  <span className="text-sm font-medium text-gray-700">Total Entries</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{entryCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <Lock className="h-5 w-5 text-gray-600" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showChangePassword ? (
              <Button
                variant="outline"
                className="w-full border-gray-200"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </Button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-2 border-gray-200 focus:border-[#F4D35E]"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 border-gray-200 focus:border-[#F4D35E]"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-200"
                    onClick={() => {
                      setShowChangePassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#F4D35E] text-gray-900 hover:bg-[#F4D35E]/90 font-medium"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              className="w-full font-medium"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
