"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

interface DateSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    setWeekDates(dates);
  }, [selectedDate]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {weekDates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const dayName = format(date, "EEE");
        const dayNumber = format(date, "d");

        return (
          <button
            key={date.toISOString()}
            onClick={() => onDateSelect(date)}
            className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-xl transition-all ${
              isSelected
                ? "bg-[#F4D35E] text-gray-900"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="text-xs font-medium">{dayName}</span>
            <span className={`text-lg font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
              {dayNumber}
            </span>
          </button>
        );
      })}
    </div>
  );
}

