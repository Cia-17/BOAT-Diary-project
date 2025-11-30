"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import Image from "next/image";

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

const highlightedDates = [
  { date: 5, color: "bg-[#F4A261]" },
  { date: 12, color: "bg-[#F4D35E]" },
  { date: 18, color: "bg-[#B7E4C7]" },
  { date: 22, color: "bg-[#F7C6CE]" },
  { date: 28, color: "bg-[#F4D35E]" },
];

const recentEvents = [
  {
    id: 1,
    date: "Nov 15",
    title: "Great day at the park",
    avatar: "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    date: "Nov 14",
    title: "Reflecting on growth",
    avatar: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop",
  },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize dates only on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  }, []);

  // Don't render calendar until mounted to avoid hydration mismatch
  if (!mounted || !currentDate || !selectedDate) {
    return (
      <MainLayout>
        <Header title="Calendar" showBack />
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-500">Loading calendar...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month to determine offset
  const firstDayOfWeek = monthStart.getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert Sunday (0) to 6, Monday (1) to 0

  const previousMonth = () => {
    if (currentDate) {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const nextMonth = () => {
    if (currentDate) {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const isHighlighted = (day: number) => {
    return highlightedDates.some((hd) => hd.date === day);
  };

  const getHighlightColor = (day: number) => {
    const highlight = highlightedDates.find((hd) => hd.date === day);
    return highlight?.color || "";
  };

  const isSelected = (day: Date) => {
    return selectedDate ? isSameDay(day, selectedDate) : false;
  };

  return (
    <MainLayout>
      <Header title="Calendar" showBack />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Calendar Section */}
        <div className="mb-8">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-sm font-medium text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: adjustedFirstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {daysInMonth.map((day) => {
              const dayNumber = day.getDate();
              const highlighted = isHighlighted(dayNumber);
              const selected = isSelected(day);
              const highlightColor = getHighlightColor(dayNumber);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                    selected
                      ? "bg-[#F7C6CE] border-2 border-black font-bold"
                      : highlighted
                        ? `${highlightColor} text-black`
                        : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Section */}
        <div>
          <h2 className="text-lg font-bold mb-4">Recent</h2>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-gradient-to-r from-[#FFE7EF] to-[#FFF7D1] border-0"
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <p className="text-xs text-[#8A8A8A] mb-1">{event.date}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base">{event.title}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Image
                        src={event.avatar}
                        alt={event.title}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

