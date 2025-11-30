"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getEntryById, deleteEntry, type Entry } from "@/lib/supabase/entries";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

export default function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [entryId, setEntryId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = params instanceof Promise ? await params : params;
      setEntryId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!entryId || isNaN(parseInt(entryId))) return;

    const loadEntry = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        const entryData = await getEntryById(parseInt(entryId));
        if (!entryData) {
          router.push("/dashboard");
          return;
        }
        setEntry(entryData);
      } catch (error) {
        console.error("Failed to load entry:", error);
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadEntry();
  }, [entryId, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    setIsDeleting(true);
    try {
      if (entryId) {
        await deleteEntry(parseInt(entryId));
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert("Failed to delete entry. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Header title="Entry" showBack />
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <p className="text-gray-500">Loading entry...</p>
        </div>
      </MainLayout>
    );
  }

  if (!entry) {
    return (
      <MainLayout>
        <Header title="Entry" showBack />
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <p className="text-gray-500">Entry not found</p>
        </div>
      </MainLayout>
    );
  }

  const imageMedia = entry.media_files?.find(
    (m) => m.media_category === "image"
  );
  const audioMedia = entry.media_files?.find(
    (m) => m.media_category === "audio"
  );

  // Parse entry text for bullet points
  const textLines = entry.entry_text.split("\n");
  const hasBullets = textLines.some((line) => line.trim().startsWith("-") || line.trim().startsWith("•"));

  return (
    <MainLayout>
      <Header title={entry.mood?.mood_name || "Entry"} showBack />
      <div className="px-4 py-6 max-w-2xl mx-auto pb-24">
        {/* Date */}
        <p className="text-sm text-gray-600 mb-4">
          {format(new Date(entry.entry_date), "MMMM d, yyyy")}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
            {entry.mood?.mood_name || "Personal"}
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
            Personal
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
            Reflection
          </span>
        </div>

        {/* Image */}
        {imageMedia && (
          <div className="relative w-full h-64 mb-6 rounded-2xl overflow-hidden">
            <Image
              src={`data:${imageMedia.file_type};base64,${imageMedia.base64_data}`}
              alt="Entry image"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Audio Player */}
        {audioMedia && (
          <div className="mb-6 bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <button className="w-12 h-12 bg-[#F4D35E] rounded-full flex items-center justify-center hover:bg-[#F4D35E]/90 transition-colors">
                <Play className="h-6 w-6 text-gray-900 ml-1" />
              </button>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F4D35E] w-1/3"></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">00:32</p>
              </div>
            </div>
          </div>
        )}

        {/* Entry Text */}
        <div className="mb-8">
          {hasBullets ? (
            <div className="space-y-3 text-gray-700 leading-relaxed">
              {textLines.map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith("-") || trimmedLine.startsWith("•")) {
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-[#F4A261] mt-1">•</span>
                      <p>{trimmedLine.substring(1).trim()}</p>
                    </div>
                  );
                }
                if (trimmedLine) {
                  return <p key={index}>{trimmedLine}</p>;
                }
                return null;
              })}
            </div>
          ) : (
            <p 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: entry.entry_text.split('\n').map(line => 
                  line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                ).join('<br>')
              }}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => entryId && router.push(`/entry/${entryId}/edit`)}
            className="h-10 w-10"
          >
            <Pencil className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
