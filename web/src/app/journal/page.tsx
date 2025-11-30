"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, ChevronDown, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getEntries, getMoods, type Entry, type Mood } from "@/lib/supabase/entries";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";

type SortOption = "date-desc" | "date-asc" | "mood-asc" | "mood-desc";

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

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
        const entriesData = await getEntries(1000);
        setEntries(entriesData);
        
        const moodsData = await getMoods();
        setMoods(moodsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  useEffect(() => {
    let filtered = [...entries];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((entry) =>
        entry.entry_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Mood filter
    if (selectedMood) {
      filtered = filtered.filter((entry) => entry.mood_id === selectedMood);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(
        (entry) => entry.entry_date >= startDate
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (entry) => entry.entry_date <= endDate
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.entry_date + "T" + b.entry_time).getTime() -
                 new Date(a.entry_date + "T" + a.entry_time).getTime();
        case "date-asc":
          return new Date(a.entry_date + "T" + a.entry_time).getTime() -
                 new Date(b.entry_date + "T" + b.entry_time).getTime();
        case "mood-asc":
          return (a.mood?.mood_name || "").localeCompare(b.mood?.mood_name || "");
        case "mood-desc":
          return (b.mood?.mood_name || "").localeCompare(a.mood?.mood_name || "");
        default:
          return 0;
      }
    });

    setFilteredEntries(filtered);
    setCurrentPage(1);
  }, [entries, searchQuery, selectedMood, startDate, endDate, sortBy]);

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMood(null);
    setStartDate("");
    setEndDate("");
    setSortBy("date-desc");
  };

  return (
    <MainLayout>
      <Header title="My Journal" showBack />
      <div className="px-4 py-6 max-w-2xl mx-auto pb-24">
        {/* Search and Filter Header */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown
                className={`h-4 w-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
            {(searchQuery || selectedMood || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Mood</Label>
                  <select
                    value={selectedMood || ""}
                    onChange={(e) =>
                      setSelectedMood(e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All moods</option>
                    {moods.map((mood) => (
                      <option key={mood.mood_id} value={mood.mood_id}>
                        {mood.mood_emoji} {mood.mood_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Sort By</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="mood-asc">Mood (A-Z)</option>
                    <option value="mood-desc">Mood (Z-A)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Entries Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {paginatedEntries.length} of {filteredEntries.length} entries
        </div>

        {/* Entries List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading entries...</p>
          </div>
        ) : paginatedEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No entries found</p>
            <Link href="/entry/new">
              <Button className="bg-[#F4D35E] text-gray-900 hover:bg-[#F4D35E]/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Entry
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedEntries.map((entry) => {
              const entryPreview =
                entry.entry_text.length > 80
                  ? entry.entry_text.substring(0, 80) + "..."
                  : entry.entry_text;
              const imageMedia = entry.media_files?.find(
                (m) => m.media_category === "image"
              );

              return (
                <Link key={entry.entry_id} href={`/entry/${entry.entry_id}`}>
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white">
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">
                              {format(
                                new Date(entry.entry_date),
                                "MMM d, yyyy"
                              )}
                            </span>
                            {entry.mood && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: entry.mood.mood_color + "40",
                                  color: entry.mood.mood_color,
                                }}
                              >
                                {entry.mood.mood_emoji} {entry.mood.mood_name}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {entryPreview}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Create Button */}
        <div className="mt-8">
          <Link href="/entry/new">
            <Button
              size="lg"
              className="w-full bg-[#F4D35E] text-gray-900 hover:bg-[#F4D35E]/90 text-lg py-6"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create a New Journal Entry
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
