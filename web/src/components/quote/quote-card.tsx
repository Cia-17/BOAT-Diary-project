"use client";

import { Card, CardContent } from "@/components/ui/card";

interface QuoteCardProps {
  text: string;
  author: string;
  className?: string;
}

export function QuoteCard({ text, author, className }: QuoteCardProps) {
  return (
    <Card className={`bg-gradient-to-r from-[#FFF7D1] to-[#FFE7EF] border-0 ${className || ""}`}>
      <CardContent className="pt-6">
        <p className="text-base font-medium text-gray-800 italic">
          "{text}"
        </p>
        <p className="text-sm text-gray-600 mt-2">— {author}</p>
        <p className="text-xs text-gray-500 mt-3">
          Quotes provided by{" "}
          <a
            href="https://zenquotes.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700"
          >
            ZenQuotes API
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

