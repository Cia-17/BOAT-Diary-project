"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface PromptCardProps {
  title: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
  color: string;
  href?: string;
  tags?: string[];
  roundedCorner?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function PromptCard({
  title,
  description,
  image,
  icon,
  color,
  href,
  tags,
  roundedCorner,
}: PromptCardProps) {
  const roundedClass =
    roundedCorner === "top-right"
      ? "rounded-tl-2xl"
      : roundedCorner === "top-left"
        ? "rounded-tr-2xl"
        : roundedCorner === "bottom-right"
          ? "rounded-bl-2xl"
          : roundedCorner === "bottom-left"
            ? "rounded-br-2xl"
            : "";

  const content = (
    <Card
      className={`${color} border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full ${roundedClass}`}
    >
      <CardContent className="p-4 h-full flex flex-col">
        {image && (
          <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
        {icon && <div className="mb-2">{icon}</div>}
        <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-700 mb-3 flex-1">{description}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-white/50 rounded-full text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

