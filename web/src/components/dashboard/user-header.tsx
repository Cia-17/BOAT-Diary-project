"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);
        // Get user metadata or email
        const name =
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          currentUser.email?.split("@")[0] ||
          "User";
        setUserName(name);
      }
    };

    loadUser();
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hi, {userName}</h1>
      </div>
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#F4D35E] to-[#F4A261] flex items-center justify-center shadow-md">
        {user?.user_metadata?.avatar_url ? (
          <Image
            src={user.user_metadata.avatar_url}
            alt={userName}
            width={48}
            height={48}
            className="object-cover"
          />
        ) : (
          <span className="text-gray-900 font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

