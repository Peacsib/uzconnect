"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function NotificationBell() {
  const [notifications] = useState<any[]>([
    { id: "1", title: "Logbook approved", message: "Your Week 2 logbook has been approved", read: false, link: "/student/logbook" },
    { id: "2", title: "Deadline reminder", message: "Mid-term report due in 5 days", read: true, link: "/student/deadlines" },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#ff8c00] text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b font-semibold text-sm">Notifications</div>
        <div className="divide-y max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <Link key={n.id} href={n.link} className="block p-3 hover:bg-muted/50 transition">
              <p className="text-xs font-medium text-foreground">{n.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
