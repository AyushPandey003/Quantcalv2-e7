"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getUserProfileAction } from "@/actions/profile";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  size?: number;
  className?: string;
  onClick?: () => void;
  showName?: boolean;
}

export function UserAvatar({ size = 36, className, onClick, showName = false }: UserAvatarProps) {
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [initials, setInitials] = useState("U");
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getUserProfileAction();
        if (mounted && res.success && res.data?.user) {
          setIsAuthed(true);
          const user = res.data.user as any;
          setImage(user.profileImage || null);
          const fn = user.firstName || ""; const ln = user.lastName || "";
          const display = [fn, ln].filter(Boolean).join(" ") || user.username || user.email || "User";
          setName(display);
          const init = (fn?.[0] || "") + (ln?.[0] || user.username?.[0] || "U");
          setInitials(init.toUpperCase());
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div
        className={cn("animate-pulse rounded-full bg-muted", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (!isAuthed) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex items-center gap-2 group", className)}
      aria-label="User profile"
    >
      <Avatar style={{ width: size, height: size }} className="border border-border">
        <AvatarImage src={image || undefined} alt={name || "User avatar"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {showName && name && (
        <span className="text-sm font-medium max-w-[120px] truncate group-hover:underline">{name}</span>
      )}
    </button>
  );
}
