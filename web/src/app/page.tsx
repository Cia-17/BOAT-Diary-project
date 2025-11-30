"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          router.push("/dashboard");
        } else {
          router.push("/landing");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // If there's an error (e.g., missing env vars), redirect to landing
        router.push("/landing");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">{isLoading ? "Loading..." : "Redirecting..."}</p>
    </div>
  );
}
