"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getNavItems } from "@/components/common/Sidebar";

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const items = getNavItems(user.role, user.id).slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t lg:hidden z-30 safe-area-bottom">
      <div className="flex items-center justify-around py-1">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <Link key={item.to} href={item.to} className="flex flex-col items-center gap-0.5 py-1.5 px-2">
              <item.icon className={`w-5 h-5 ${active ? "text-accent" : "text-muted-foreground"}`} />
              <span className={`text-[10px] ${active ? "text-accent font-medium" : "text-muted-foreground"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
