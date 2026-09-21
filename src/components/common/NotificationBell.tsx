"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Bell, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Trash2, 
  BookOpen, 
  Building2, 
  GraduationCap, 
  Mail, 
  CheckCheck,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  // Detail Modal State
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    if (!user?.email || unreadCount === 0) return;
    try {
      setIsMarking(true);
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setIsMarking(false);
    }
  };

  const handleOpenDetail = async (notif: NotificationItem) => {
    setSelectedNotif(notif);
    setDetailOpen(true);
    setIsOpen(false);

    // Auto-mark as read if unread
    if (!notif.read && user?.email) {
      try {
        await fetch("/api/notifications/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, id: notif.id, read: true }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error("Error marking notification read:", err);
      }
    }
  };

  const handleToggleReadStatus = async (notif: NotificationItem) => {
    const nextReadState = !notif.read;
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, id: notif.id, read: nextReadState }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: nextReadState } : n))
      );
      setUnreadCount((c) => (nextReadState ? Math.max(0, c - 1) : c + 1));
      if (selectedNotif?.id === notif.id) {
        setSelectedNotif({ ...selectedNotif, read: nextReadState });
      }
      toast.success(nextReadState ? "Marked as read" : "Marked as unread");
    } catch (err) {
      console.error("Error toggling read status:", err);
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${encodeURIComponent(notifId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notifId));
        setDetailOpen(false);
        setSelectedNotif(null);
        toast.success("Notification deleted");
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formatFullDateTime = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = parseISO(isoString);
      return format(date, "EEEE, d MMMM yyyy 'at' h:mm a");
    } catch {
      return new Date(isoString).toLocaleString();
    }
  };

  const getNotificationCategory = (type: string) => {
    switch (type) {
      case "LOGBOOK_SUBMITTED":
      case "LOGBOOK_APPROVED":
      case "LOGBOOK_PENDING":
      case "LOGBOOK_DEADLINES":
        return "Logbook Verification";
      case "PLACEMENT_APPROVED":
      case "PLACEMENT_ACTIVE":
      case "PLACEMENT_PENDING":
      case "ALLOCATION":
        return "Attachment & Supervision";
      case "ASSESSMENT_COMPLETED":
        return "Academic Appraisal";
      case "MESSAGE":
        return "Direct Consultation";
      default:
        return "Institutional Notice";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "PLACEMENT_APPROVED":
      case "PLACEMENT_ACTIVE":
        return <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />;
      case "LOGBOOK_APPROVED":
        return <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />;
      case "LOGBOOK_SUBMITTED":
      case "LOGBOOK_PENDING":
      case "PLACEMENT_PENDING":
      case "LOGBOOK_DEADLINES":
        return <Clock className="w-4 h-4 text-amber-500 shrink-0" />;
      case "ALLOCATION":
        return <GraduationCap className="w-4 h-4 text-[#003366] dark:text-blue-400 shrink-0" />;
      case "ALERT":
        return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
      case "MESSAGE":
        return <Mail className="w-4 h-4 text-purple-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 rounded-full hover:bg-muted text-foreground transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff8c00] text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-84 sm:w-96 p-0 shadow-xl rounded-xl border-border bg-popover overflow-hidden" align="end">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-[#ff8c00]/15 text-[#ff8c00] font-semibold border-none">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isMarking}
                className="text-[11px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-border/40 max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center px-4 space-y-1.5">
                <Sparkles className="w-7 h-7 mx-auto text-muted-foreground/40" />
                <p className="text-xs font-semibold text-foreground">All caught up</p>
                <p className="text-[11px] text-muted-foreground">You have no new institutional notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleOpenDetail(n)}
                  className={`p-3.5 hover:bg-muted/40 transition-colors cursor-pointer flex items-start gap-3 text-left group ${
                    !n.read ? "bg-[#003366]/[0.03] dark:bg-blue-500/[0.05]" : "opacity-85"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate group-hover:text-primary transition-colors ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                        View details <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                      <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wider font-semibold">
                        {getNotificationCategory(n.type)}
                      </span>
                    </div>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#ff8c00] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer - Navigate to full inbox */}
          <div className="p-2.5 border-t border-border/50 text-center bg-muted/25">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                router.push("/notifications");
              }}
              className="w-full text-xs text-primary font-semibold hover:bg-primary/10 h-8 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View All in Notifications Inbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* The Forge / Old Mutual Style Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-border/70 shadow-2xl">
          {/* Top Brand Accent Stripe (Old Mutual Green Accent) */}
          <div className="h-1.5 bg-gradient-to-r from-[#00875a] via-[#003366] to-[#00875a] w-full" />

          {selectedNotif && (
            <div className="p-6 space-y-5">
              {/* Header with Eyebrow and Status */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#00875a] dark:text-emerald-400">
                    {getNotificationCategory(selectedNotif.type)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5",
                      selectedNotif.read
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-[#ff8c00]/10 text-[#ff8c00] border-[#ff8c00]/30"
                    )}
                  >
                    {selectedNotif.read ? "Read" : "Unread"}
                  </Badge>
                </div>
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(selectedNotif.type)}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-foreground tracking-tight leading-snug">
                      {selectedNotif.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      {formatFullDateTime(selectedNotif.createdAt)}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Full Detailed Message Container */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedNotif.message}
              </div>

              {/* The Forge Style "What moves you forward" Card */}
              <div className="p-3.5 rounded-xl border border-border/50 bg-background/80 space-y-2 text-xs">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00875a] dark:text-emerald-400" />
                  Institutional Action Context
                </p>
                <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00875a] shrink-0 mt-1" />
                    <span>This notice has been logged to your permanent University of Zimbabwe record.</span>
                  </li>
                  {selectedNotif.link && (
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00875a] shrink-0 mt-1" />
                      <span>Direct response or verification required at destination workflow.</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Footer Actions */}
              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleReadStatus(selectedNotif)}
                    className="text-xs h-8 rounded-lg cursor-pointer flex-1 sm:flex-none"
                  >
                    {selectedNotif.read ? "Mark as unread" : "Mark as read"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNotification(selectedNotif.id)}
                    className="text-xs h-8 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer px-2.5"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailOpen(false)}
                    className="text-xs h-8 rounded-lg cursor-pointer flex-1 sm:flex-none"
                  >
                    Close
                  </Button>
                  {selectedNotif.link && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setDetailOpen(false);
                        router.push(selectedNotif.link!);
                      }}
                      className="bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-semibold h-8 px-4 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-none shadow-xs"
                    >
                      <span>Open Related Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
