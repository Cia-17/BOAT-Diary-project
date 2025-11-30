"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/entry/new", icon: Plus, label: "Add", isLarge: true },
  { href: "/journal", icon: FileText, label: "Journey" },
  { href: "/settings", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === "/dashboard" && pathname === "/");
          const Icon = item.icon;

          if (item.isLarge) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 bg-[#F4D35E] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <Icon className="h-7 w-7 text-gray-900" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors",
                isActive
                  ? "bg-[#F4D35E] text-black"
                  : "text-[#C7C7C7] hover:text-gray-600"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

