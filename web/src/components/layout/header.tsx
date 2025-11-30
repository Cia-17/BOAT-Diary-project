"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-4 flex-1">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
      <h1 className="text-xl font-semibold flex-1 text-center">{title}</h1>
      <div className="flex-1" /> {/* Spacer for centering */}
    </header>
  );
}

