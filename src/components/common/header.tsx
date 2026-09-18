"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { NetworkStatus } from "@/components/common/NetworkStatus";
import { NotificationBell } from "@/components/common/NotificationBell";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

// Cloudinary CDN URL for optimized UZ crest
const UZ_CREST = "/uz-crest.png";

interface Props {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
          <Menu className="w-5 h-5" />
        </Button>
        <img src={UZ_CREST} alt="UZ" className="w-8 h-8" />
        <span className="font-bold text-foreground hidden sm:block">WRL Connect</span>
      </div>
      <div className="flex items-center gap-2">
        <NetworkStatus />
        <ThemeToggle />
        <NotificationBell />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            {user?.name?.charAt(0)}
          </div>
          <span className="text-sm font-medium hidden md:block">{user?.name}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
