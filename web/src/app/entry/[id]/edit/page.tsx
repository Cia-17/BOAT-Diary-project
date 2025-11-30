"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon, Mic, Video, X, Calendar } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getEntryById, updateEntry, getMoods, type Mood, type Entry } from "@/lib/supabase/entries";
import { createClient } from "@/lib/supabase/client";
import { VoiceRecorder } from "@/components/entry/voice-recorder";
import { compressMedia } from "@/lib/media-compression";

function EditEntryForm({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [entryDate, setEntryDate] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
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

      try {
        const entryData = await getEntryById(parseInt(entryId));
        if (!entryData) {
          router.push("/dashboard");
          return;
        }

        setContent(entryData.entry_text);
        setSelectedMood(entryData.mood_id);
        setEntryDate(entryData.entry_date);
        setEntryTime(entryData.entry_time);
        setExistingMedia(entryData.media_files || []);

        const moodsData = await getMoods();
        setMoods(moodsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [entryId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => {
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(`${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        return true;
      });
      setMediaFiles([...mediaFiles, ...validFiles]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (mediaId: number) => {
    setExistingMedia(existingMedia.filter((m) => m.media_id !== mediaId));
  };

  const convertFileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) {
          reject(new Error("Failed to read file"));
          return;
        }
        // Extract base64 string (remove data:type;base64, prefix)
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        if (!base64) {
          reject(new Error("Failed to extract base64 data"));
          return;
        }
        console.log(`Converted ${file instanceof File ? file.name : "blob"} to base64, length: ${base64.length}`);
        resolve(base64);
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error("Failed to read file: " + error));
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Edit form submitted", { content: content.trim(), selectedMood, user: !!user, entryId });
    
    if (!content.trim()) {
      alert("Please enter some text for your entry");
      return;
    }
    
    if (!selectedMood) {
      alert("Please select a mood");
      return;
    }
    
    if (!user) {
      alert("You must be logged in to update entries");
      router.push("/auth/login");
      return;
    }

    console.log("Validation passed, starting update...");
    setIsSaving(true);
    try {
      const newMediaData = await Promise.all(
        mediaFiles.map(async (file) => {
          try {
            // Compress media before converting to base64
            const compressedBlob = await compressMedia(file);
            const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type || file.type });
            const base64 = await convertFileToBase64(compressedFile);
            const category =
              file.type.startsWith("image/")
                ? "image"
                : file.type.startsWith("audio/")
                  ? "audio"
                  : "video";

            // Validate base64 string
            if (!base64 || base64.length === 0) {
              throw new Error(`Failed to convert ${file.name} to base64`);
            }

            console.log(`Successfully converted ${file.name} to base64 (${base64.length} chars)`);

            return {
              file_name: file.name,
              file_type: compressedFile.type,
              media_category: category as "image" | "audio" | "video",
              base64_data: base64, // Pure base64 string without data: prefix
            };
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            return null;
          }
        })
      );
      
      const validNewMediaData = newMediaData.filter((m) => m !== null) as any[];

      if (voiceBlob) {
        try {
          const voiceBase64 = await convertFileToBase64(voiceBlob);
          if (voiceBase64 && voiceBase64.length > 0) {
            console.log(`Successfully converted voice note to base64 (${voiceBase64.length} chars)`);
            validNewMediaData.push({
              file_name: "voice-note.webm",
              file_type: "audio/webm",
              media_category: "audio" as const,
              base64_data: voiceBase64,
              // Note: file_path will be generated in entries.ts
            });
          } else {
            console.warn("Voice note base64 conversion returned empty string");
          }
        } catch (error) {
          console.error("Error processing voice note:", error);
          alert("Warning: Voice note could not be processed and was skipped.");
        }
      }

      const allMedia = [
        ...existingMedia.map((m) => ({
          file_name: m.file_name,
          file_type: m.file_type,
          media_category: m.media_category,
          file_path: (m as any).file_path || `entries/${entryId}/${m.file_name}`, // Preserve existing file_path or generate one
          base64_data: m.base64_data, // Existing media already has base64
        })),
        ...validNewMediaData,
      ];

      console.log(`Updating entry ${entryId} with ${allMedia.length} total media files`);

      // Prepare update data
      const updateData: any = {
        mood_id: selectedMood,
        entry_text: content,
        entry_date: entryDate,
        entry_time: entryTime,
      };

      // Always include media_files array (even if empty) to handle deletion
      updateData.media_files = allMedia;

      console.log("Submitting update data:", {
        ...updateData,
        media_files_count: allMedia.length,
      });

      const result = await updateEntry(parseInt(entryId), updateData);

      if (result) {
        console.log("Entry updated successfully:", result.entry_id);
        if (allMedia.length > 0) {
          console.log(`Entry updated with ${allMedia.length} media file(s)`);
        }
        alert("Entry updated successfully! ✨");
        router.push(`/entry/${entryId}`);
      } else {
        throw new Error("Failed to update entry - no result returned");
      }
    } catch (error: any) {
      console.error("Failed to update entry:", error);
      const errorMessage = error?.message || error?.toString() || "Unknown error occurred";
      console.error("Full error details:", error);
      alert(`Failed to update entry: ${errorMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Header title="Edit Entry" showBack />
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <p className="text-gray-500">Loading entry...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Edit Entry" showBack />
      <form onSubmit={handleSubmit} className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        {/* Date and Time */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">Date</Label>
              <Input
                id="date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="mt-2 border-gray-200 focus:border-[#F4D35E]"
                required
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-sm font-medium text-gray-700">Time</Label>
              <Input
                id="time"
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="mt-2 border-gray-200 focus:border-[#F4D35E]"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Mood Selector */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">How are you feeling? 😊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {moods.map((mood) => {
                const isSelected = selectedMood === mood.mood_id;
                return (
                  <button
                    key={mood.mood_id}
                    type="button"
                    onClick={() => setSelectedMood(mood.mood_id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all transform hover:scale-105 ${
                      isSelected
                        ? "border-gray-800 shadow-md"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? mood.mood_color || "#F4D35E"
                        : "white",
                    }}
                  >
                    <span className="text-lg">{mood.mood_emoji}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {mood.mood_name}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Write your entry ✍️</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] text-base resize-none border-gray-200 focus:border-[#F4D35E]"
              required
            />
          </CardContent>
        </Card>

        {/* Voice Recording - Optional */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Mic className="h-5 w-5 text-gray-600" />
              Voice Note <span className="text-sm font-normal text-gray-500">(Optional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceRecorder
              onRecordingComplete={(blob) => setVoiceBlob(blob)}
              onRemove={() => setVoiceBlob(null)}
            />
          </CardContent>
        </Card>

        {/* Media Upload - Optional */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Add Media 📸 <span className="text-sm font-normal text-gray-500">(Optional)</span></CardTitle>
            <p className="text-sm text-gray-500 mt-1">You can upload images, audio, or video - choose any type you want</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#F4D35E] bg-gray-50"
                  asChild
                >
                  <span className="flex flex-col items-center justify-center gap-2 py-3">
                    <ImageIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">Photo</span>
                  </span>
                </Button>
              </label>
              <label className="flex-1">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#F4D35E] bg-gray-50"
                  asChild
                >
                  <span className="flex flex-col items-center justify-center gap-2 py-3">
                    <Mic className="h-5 w-5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">Audio</span>
                  </span>
                </Button>
              </label>
              <label className="flex-1">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#F4D35E] bg-gray-50"
                  asChild
                >
                  <span className="flex flex-col items-center justify-center gap-2 py-3">
                    <Video className="h-5 w-5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">Video</span>
                  </span>
                </Button>
              </label>
            </div>

            {/* Existing Media */}
            {existingMedia.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Existing Media:</p>
                {existingMedia.map((media) => (
                  <div
                    key={media.media_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1 font-medium">
                      {media.file_name} ({media.media_category})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExistingMedia(media.media_id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* New Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">New Media:</p>
                {mediaFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1 font-medium">
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMedia(index)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-gray-200"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-[#F4D35E] to-[#F4A261] text-gray-900 hover:from-[#F4D35E]/90 hover:to-[#F4A261]/90 font-semibold shadow-md"
            disabled={!content.trim() || !selectedMood || isSaving}
          >
            {isSaving ? "Updating..." : "Update Entry ✨"}
          </Button>
        </div>
      </form>
    </MainLayout>
  );
}

export default function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [entryId, setEntryId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = params instanceof Promise ? await params : params;
      setEntryId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  if (!entryId) {
    return (
      <MainLayout>
        <Header title="Edit Entry" showBack />
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <Suspense
      fallback={
        <MainLayout>
          <Header title="Edit Entry" showBack />
          <div className="px-4 py-6 max-w-2xl mx-auto">
            <p className="text-gray-500">Loading...</p>
          </div>
        </MainLayout>
      }
    >
      <EditEntryForm entryId={entryId} />
    </Suspense>
  );
}

