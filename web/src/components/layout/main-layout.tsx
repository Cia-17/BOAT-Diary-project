import { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

interface MainLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function MainLayout({ children, showBottomNav = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen pb-20" style={{ background: "transparent" }}>
      <div className="backdrop-blur-sm bg-white/80 min-h-screen">
        {children}
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

