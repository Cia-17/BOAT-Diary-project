"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { getEntries, type Entry } from "@/lib/supabase/entries";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function InsightsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emotionData, setEmotionData] = useState<any[]>([]);

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

        // Calculate emotion statistics
        const moodCounts: Record<string, number> = {};
        entriesData.forEach((entry) => {
          if (entry.mood?.mood_name) {
            moodCounts[entry.mood.mood_name] =
              (moodCounts[entry.mood.mood_name] || 0) + 1;
          }
        });

        const total = entriesData.length || 1;
        const emotionStats = [
          {
            emotion: "Happy",
            percentage: Math.round(
              ((moodCounts["Happy"] || 0) / total) * 100
            ),
            color: "#F4D35E",
          },
          {
            emotion: "Sad",
            percentage: Math.round(((moodCounts["Sad"] || 0) / total) * 100),
            color: "#8B4513",
          },
          {
            emotion: "Calm",
            percentage: Math.round(((moodCounts["Calm"] || 0) / total) * 100),
            color: "#B7E4C7",
          },
          {
            emotion: "Anxious",
            percentage: Math.round(
              ((moodCounts["Anxious"] || 0) / total) * 100
            ),
            color: "#9370DB",
          },
        ].filter((e) => e.percentage > 0);

        setEmotionData(emotionStats);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  return (
    <MainLayout>
      <Header title="Insights" showBack />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Emotions Section */}
        {emotionData.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Emotions
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Here are four core emotions for your journal
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={emotionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="emotion" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
                    {emotionData.map((entry, index) => (
                      <Bar.Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-[#F4D35E] to-[#F4A261] border-0">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700 mb-1">Total Entries</p>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? "..." : entries.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#B7E4C7] to-[#F7C6CE] border-0">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700 mb-1">Most Common Mood</p>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : emotionData.length > 0
                    ? emotionData[0]?.emotion || "N/A"
                    : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

