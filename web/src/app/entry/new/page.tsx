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
import { useRouter, useSearchParams } from "next/navigation";
import { getMoods, createEntry, type Mood } from "@/lib/supabase/entries";
import { createClient } from "@/lib/supabase/client";
import { VoiceRecorder } from "@/components/entry/voice-recorder";
import { compressMedia } from "@/lib/media-compression";
import { validateFileType } from "@/lib/security/owasp-input-file-validation";
import { logFileUpload } from "@/lib/security/owasp-security-event-logger";

const promptTemplates: Record<string, { title: string; placeholder: string }> = {
  morning: {
    title: "Morning Reflection",
    placeholder: "I woke up to the soft light filtering through my window...",
  },
  evening: {
    title: "Evening Reflection",
    placeholder: "As the day comes to a close, I reflect on...",
  },
  gratitude: {
    title: "Pause & Reflect",
    placeholder: "What are you grateful for today?",
  },
  intentions: {
    title: "Set Intentions",
    placeholder: "How do you want to feel today?",
  },
  emotions: {
    title: "Emotional Check-in",
    placeholder: "How are you feeling right now?",
  },
  wins: {
    title: "Daily Wins",
    placeholder: "What went well today?",
  },
};

function NewEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryType = searchParams.get("type");
  const promptType = searchParams.get("prompt");
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const now = new Date();
  const [entryDate, setEntryDate] = useState(now.toISOString().split("T")[0]);
  const [entryTime, setEntryTime] = useState(now.toTimeString().split(" ")[0].substring(0, 5));

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
        const moodsData = await getMoods();
        setMoods(moodsData);

        if (promptType && promptTemplates[promptType]) {
          setTitle(promptTemplates[promptType].title);
        } else if (entryType && promptTemplates[entryType]) {
          setTitle(promptTemplates[entryType].title);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, entryType, promptType]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      const files = Array.from(e.target.files);
      console.log(`Processing ${files.length} file(s) for upload`);
      
      // Validate file types and sizes with magic byte validation
      const validationPromises = files.map(async (file) => {
        try {
          const maxSize = 10 * 1024 * 1024; // 10MB
          const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
          const validAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"];
          const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
          
          if (file.size > maxSize) {
            alert(`${file.name} is too large. Maximum size is 10MB.`);
            return null;
          }
          
          // Determine expected file type category
          let expectedType: 'image' | 'audio' | 'video' | null = null;
          if (file.type.startsWith("image/")) {
            if (!validImageTypes.includes(file.type)) {
              alert(`${file.name} is not a supported image format. Use JPG, PNG, GIF, or WEBP.`);
              return null;
            }
            expectedType = 'image';
          } else if (file.type.startsWith("audio/")) {
            if (!validAudioTypes.includes(file.type)) {
              alert(`${file.name} is not a supported audio format. Use MP3, WAV, or OGG.`);
              return null;
            }
            expectedType = 'audio';
          } else if (file.type.startsWith("video/")) {
            if (!validVideoTypes.includes(file.type)) {
              alert(`${file.name} is not a supported video format. Use MP4, WEBM, or OGG.`);
              return null;
            }
            expectedType = 'video';
          } else {
            alert(`${file.name} is not a supported file type.`);
            return null;
          }
          
          // OWASP A08: Magic byte validation (file signature checking)
          if (expectedType) {
            try {
              const typeValidation = await validateFileType(file, expectedType);
              if (!typeValidation.valid) {
                alert(`${file.name}: ${typeValidation.error || 'File type validation failed. File may be corrupted or malicious.'}`);
                return null;
              }
            } catch (validationError) {
              console.error(`Magic byte validation error for ${file.name}:`, validationError);
              alert(`${file.name}: File validation error. Please try a different file.`);
              return null;
            }
          }
          
          console.log(`File ${file.name} validated successfully`);
          return file;
        } catch (fileError) {
          console.error(`Error validating file ${file.name}:`, fileError);
          alert(`Error processing ${file.name}. Please try again.`);
          return null;
        }
      });
      
      const validatedFiles = await Promise.all(validationPromises);
      const validFiles = validatedFiles.filter((file): file is File => file !== null);
      
      if (validFiles.length > 0) {
        setMediaFiles((prev) => [...prev, ...validFiles]);
        console.log(`Successfully added ${validFiles.length} file(s) to media list`);
      } else {
        console.warn("No valid files were added after validation");
      }
    } catch (error) {
      console.error("Error in handleFileChange:", error);
      alert("An error occurred while processing files. Please try again.");
    } finally {
      // Reset the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
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
    e.stopPropagation();
    
    console.log("Form submitted", { 
      content: content.trim(), 
      contentLength: content.trim().length,
      selectedMood, 
      user: !!user,
      mediaFilesCount: mediaFiles.length,
      hasVoiceBlob: !!voiceBlob
    });
    
    // Validation
    if (!content.trim()) {
      alert("Please enter some text for your entry");
      return;
    }
    
    if (!selectedMood) {
      alert("Please select a mood");
      return;
    }
    
    if (!user) {
      alert("You must be logged in to save entries");
      router.push("/auth/login");
      return;
    }
    
    // Check if already saving to prevent double submission
    if (isSaving) {
      console.log("Already saving, ignoring duplicate submission");
      return;
    }

    console.log("Validation passed, starting save...");
    console.log("Media files to process:", mediaFiles.length);
    console.log("Voice blob present:", !!voiceBlob);
    
    setIsSaving(true);
    try {
      // Process media files with compression
      const mediaData = await Promise.all(
        mediaFiles.map(async (file, index) => {
          console.log(`Processing file ${index + 1}/${mediaFiles.length}: ${file.name} (${file.size} bytes, ${file.type})`);
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

            const mediaItem = {
              file_name: file.name,
              file_type: compressedFile.type,
              media_category: category as "image" | "audio" | "video",
              base64_data: base64, // Pure base64 string without data: prefix
            };
            
            console.log(`Media item prepared for ${file.name}:`, {
              file_name: mediaItem.file_name,
              file_type: mediaItem.file_type,
              media_category: mediaItem.media_category,
              base64_length: mediaItem.base64_data.length
            });
            
            return mediaItem;
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            // Continue with other files even if one fails
            return null;
          }
        })
      );
      
      // Filter out any null values from failed processing
      const validMediaData = mediaData.filter((m) => m !== null) as any[];

      // Add voice recording if present
      if (voiceBlob) {
        try {
          const voiceBase64 = await convertFileToBase64(voiceBlob);
          if (voiceBase64 && voiceBase64.length > 0) {
            console.log(`Successfully converted voice note to base64 (${voiceBase64.length} chars)`);
          validMediaData.push({
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

      console.log(`Creating entry with ${validMediaData.length} media files (media is optional)`);

      // Prepare entry data
      const entryData: any = {
        mood_id: selectedMood,
        entry_text: content,
        entry_date: entryDate,
        entry_time: entryTime,
      };

      // Only include media_files if there are any (completely optional - users can save without any media)
      if (validMediaData.length > 0) {
        entryData.media_files = validMediaData;
        console.log(`Including ${validMediaData.length} media file(s) with entry`);
      } else {
        console.log("No media files - entry will be saved without media (this is allowed)");
      }

      console.log("Submitting entry data:", {
        ...entryData,
        media_files_count: validMediaData.length,
      });

          const result = await createEntry(entryData);

          if (result) {
            console.log("Entry created successfully:", result.entry_id);
            if (validMediaData.length > 0) {
              console.log(`Entry saved with ${validMediaData.length} media file(s)`);
              // Log file uploads for security monitoring
              validMediaData.forEach((media) => {
                logFileUpload(user.id, media.file_name, 0, media.file_type, true);
              });
            }
            alert("Entry saved successfully! ✨");
            router.push("/dashboard");
          } else {
            throw new Error("Failed to create entry - no result returned");
          }
    } catch (error: any) {
      console.error("Failed to save entry:", error);
      const errorMessage = error?.message || error?.toString() || "Unknown error occurred";
      console.error("Full error details:", error);
      alert(`Failed to save entry: ${errorMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setIsSaving(false);
    }
  };

  const getPlaceholder = () => {
    if (promptType && promptTemplates[promptType]) {
      return promptTemplates[promptType].placeholder;
    }
    if (entryType && promptTemplates[entryType]) {
      return promptTemplates[entryType].placeholder;
    }
    return "Write your thoughts here...";
  };

  return (
    <MainLayout>
      <Header title={title || "New Entry"} showBack />
      <form 
        onSubmit={(e) => {
          console.log("Form onSubmit triggered");
          handleSubmit(e);
        }} 
        className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24"
        noValidate
      >
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
            {isLoading ? (
              <p className="text-gray-500">Loading moods...</p>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Write your entry ✍️</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={getPlaceholder()}
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

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="space-y-2">
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
            className="flex-1 bg-gradient-to-r from-[#F4D35E] to-[#F4A261] text-gray-900 hover:from-[#F4D35E]/90 hover:to-[#F4A261]/90 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!content.trim() || !selectedMood || isSaving}
            onClick={(e) => {
              // Ensure form submission is triggered
              if (!content.trim() || !selectedMood) {
                e.preventDefault();
                if (!content.trim()) {
                  alert("Please enter some text for your entry");
                } else if (!selectedMood) {
                  alert("Please select a mood");
                }
                return;
              }
              console.log("Save button clicked", { 
                hasContent: !!content.trim(), 
                hasMood: !!selectedMood, 
                isSaving 
              });
            }}
          >
            {isSaving ? "Saving..." : "Save Entry ✨"}
          </Button>
        </div>
      </form>
    </MainLayout>
  );
}

export default function NewEntryPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <Header title="New Entry" showBack />
          <div className="px-4 py-6 max-w-2xl mx-auto">
            <p className="text-gray-500">Loading...</p>
          </div>
        </MainLayout>
      }
    >
      <NewEntryForm />
    </Suspense>
  );
}
