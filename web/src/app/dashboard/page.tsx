"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { UserHeader } from "@/components/dashboard/user-header";
import { DateSelector } from "@/components/dashboard/date-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuoteCard } from "@/components/quote/quote-card";
import { fetchRandomQuote, type Quote } from "@/lib/quotes";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getEntries, getMoods, createEntry, deleteEntry, type Entry, type Mood } from "@/lib/supabase/entries";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function Dashboard() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [quickEntryText, setQuickEntryText] = useState("");
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [showQuickEntry, setShowQuickEntry] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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
        const entriesData = await getEntries(10);
        setRecentEntries(entriesData);
        
        const moodsData = await getMoods();
        setMoods(moodsData);
        
        const randomQuote = await fetchRandomQuote();
        setQuote(randomQuote);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleQuickEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEntryText.trim() || !selectedMood) return;

    setIsSaving(true);
    try {
      const now = new Date();
      const entryDate = now.toISOString().split("T")[0];
      const entryTime = now.toTimeString().split(" ")[0].substring(0, 5);

      await createEntry({
        mood_id: selectedMood,
        entry_text: quickEntryText,
        entry_date: entryDate,
        entry_time: entryTime,
      });

      setQuickEntryText("");
      setSelectedMood(null);
      setShowQuickEntry(false);
      
      // Reload entries
      const entriesData = await getEntries(10);
      setRecentEntries(entriesData);
      
      alert("Entry saved successfully! ✨");
    } catch (error) {
      console.error("Failed to save entry:", error);
      alert("Failed to save entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await deleteEntry(entryId);
      const entriesData = await getEntries(10);
      setRecentEntries(entriesData);
      alert("Entry deleted successfully");
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert("Failed to delete entry. Please try again.");
    }
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-2xl mx-auto pb-24">
        {/* User Header */}
        <UserHeader />

        {/* Motivational Quote */}
        {quote && (
          <div className="mb-6">
            <QuoteCard text={quote.text} author={quote.author} />
          </div>
        )}

        {/* Date Selector */}
        <div className="mb-6">
          <DateSelector
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* Today's Mood Selector */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800">
              How are you feeling today? 😊
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading moods...</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
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
                      <span className="text-xl">{mood.mood_emoji}</span>
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

        {/* Quick Entry Form */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-br from-[#FFF7D1] to-[#FFE7EF]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Quick Journal Entry
              </CardTitle>
              {!showQuickEntry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickEntry(true)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              )}
            </div>
          </CardHeader>
          {showQuickEntry && (
            <CardContent>
              <form onSubmit={handleQuickEntry} className="space-y-4">
                <Textarea
                  placeholder="What's on your mind today? Share your thoughts..."
                  value={quickEntryText}
                  onChange={(e) => setQuickEntryText(e.target.value)}
                  className="min-h-[120px] text-base resize-none border-gray-200 focus:border-[#F4D35E]"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowQuickEntry(false);
                      setQuickEntryText("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#F4D35E] text-gray-900 hover:bg-[#F4D35E]/90 font-medium"
                    disabled={!quickEntryText.trim() || !selectedMood || isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Create New Entry Button */}
        <div className="mb-6">
          <Link href="/entry/new">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-[#F4D35E] to-[#F4A261] text-gray-900 hover:from-[#F4D35E]/90 hover:to-[#F4A261]/90 font-semibold py-6 shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Full Entry with Media
            </Button>
          </Link>
        </div>

        {/* Recent Entries */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Recent Entries</h2>
            <Link href="/journal" className="text-sm text-[#F4A261] hover:text-[#F4A261]/80 font-medium">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading entries...</p>
            </div>
          ) : recentEntries.length === 0 ? (
            <Card className="border-0 shadow-sm bg-gray-50">
              <CardContent className="pt-6 text-center py-8">
                <p className="text-gray-500 mb-4">No entries yet. Start journaling! ✨</p>
                <Link href="/entry/new">
                  <Button className="bg-[#F4D35E] text-gray-900 hover:bg-[#F4D35E]/90">
                    Create Your First Entry
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry) => {
                const entryPreview =
                  entry.entry_text.length > 100
                    ? entry.entry_text.substring(0, 100) + "..."
                    : entry.entry_text;
                const imageMedia = entry.media_files?.find(
                  (m) => m.media_category === "image"
                );

                return (
                  <Card
                    key={entry.entry_id}
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white"
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-4">
                        {imageMedia && (
                          <div className="flex-shrink-0">
                            <Image
                              src={`data:${imageMedia.file_type};base64,${imageMedia.base64_data}`}
                              alt="Entry"
                              width={60}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500 font-medium">
                              {format(new Date(entry.entry_date), "MMM d, yyyy")}
                            </span>
                            {entry.mood && (
                              <span
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={{
                                  backgroundColor: entry.mood.mood_color + "30",
                                  color: entry.mood.mood_color,
                                }}
                              >
                                {entry.mood.mood_emoji} {entry.mood.mood_name}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {entryPreview}
                          </p>
                          <div className="flex items-center gap-2">
                            <Link href={`/entry/${entry.entry_id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-gray-600 hover:text-gray-800"
                              >
                                View
                              </Button>
                            </Link>
                            <Link href={`/entry/${entry.entry_id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-gray-600 hover:text-gray-800"
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.entry_id)}
                              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
