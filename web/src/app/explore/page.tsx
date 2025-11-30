"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const explorePrompts = [
  {
    id: 1,
    title: "Gratitude Practice",
    description: "Write about three things you're grateful for today",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&q=80",
    color: "bg-[#FFF7D1]",
  },
  {
    id: 2,
    title: "Morning Reflection",
    description: "Start your day with intention and clarity",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&q=80",
    color: "bg-[#FFE7EF]",
  },
  {
    id: 3,
    title: "Evening Review",
    description: "Reflect on your day and what you learned",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop&q=80",
    color: "bg-[#B7E4C7]",
  },
  {
    id: 4,
    title: "Goal Setting",
    description: "Define your goals and track your progress",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80",
    color: "bg-[#E7D5FF]",
  },
];

export default function ExplorePage() {
  return (
    <MainLayout>
      <Header title="Explore" showBack />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search prompts, themes..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-2 gap-4">
          {explorePrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className={`${prompt.color} border-0 cursor-pointer hover:shadow-lg transition-shadow`}
            >
              <CardContent className="p-0">
                <div className="relative h-32">
                  <Image
                    src={prompt.image}
                    alt={prompt.title}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {prompt.title}
                  </h3>
                  <p className="text-sm text-gray-700">{prompt.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

