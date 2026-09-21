"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { 
  Bell, 
  Search, 
  Check, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  FileDown, 
  FileSpreadsheet, 
  Maximize2, 
  MoreVertical, 
  Clock, 
  CheckCheck, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  GraduationCap, 
  Mail, 
  BookOpen, 
  Building2,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";

interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

function NotificationsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<NotificationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters matching Old Mutual / Workday layout
  const [viewFilter, setViewFilter] = useState<"all" | "unread" | "logbooks" | "placements">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const targetId = searchParams?.get("id");

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        const list: NotificationRecord[] = data.notifications || [];
        setNotifications(list);

        // If URL has targetId, find and select it
        if (targetId) {
          const match = list.find((n) => n.id === targetId);
          if (match) {
            setSelectedNotif(match);
            return;
          }
        }

        // Default to first item if none selected
        if (list.length > 0 && !selectedNotif) {
          setSelectedNotif(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, targetId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle auto-select when targetId query param arrives
  useEffect(() => {
    if (targetId && notifications.length > 0) {
      const match = notifications.find((n) => n.id === targetId);
      if (match) {
        setSelectedNotif(match);
      }
    }
  }, [targetId, notifications]);

  const handleSelectNotif = async (notif: NotificationRecord) => {
    setSelectedNotif(notif);
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
      } catch (err) {
        console.error("Error marking read:", err);
      }
    }
  };

  const handleToggleRead = async (notif: NotificationRecord) => {
    const nextRead = !notif.read;
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, id: notif.id, read: nextRead }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: nextRead } : n))
      );
      if (selectedNotif?.id === notif.id) {
        setSelectedNotif({ ...selectedNotif, read: nextRead });
      }
      toast.success(nextRead ? "Marked as read" : "Marked as unread");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        const nextList = notifications.filter((n) => n.id !== id);
        setNotifications(nextList);
        setSelectedNotif(nextList[0] || null);
        toast.success("Notification deleted");
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.email) return;
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      if (selectedNotif) setSelectedNotif({ ...selectedNotif, read: true });
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Error marking all read");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...notifications];

    // Filter
    if (viewFilter === "unread") {
      result = result.filter((n) => !n.read);
    } else if (viewFilter === "logbooks") {
      result = result.filter((n) =>
        ["LOGBOOK_SUBMITTED", "LOGBOOK_APPROVED", "LOGBOOK_PENDING", "LOGBOOK_DEADLINES", "ASSESSMENT_COMPLETED"].includes(n.type)
      );
    } else if (viewFilter === "placements") {
      result = result.filter((n) =>
        ["PLACEMENT_APPROVED", "PLACEMENT_ACTIVE", "PLACEMENT_PENDING", "ALLOCATION"].includes(n.type)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }

    // Sort
    if (sortOrder === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [notifications, viewFilter, sortOrder, searchQuery]);

  const formatShortTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 1) return `${diffDays}d`;
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours >= 1) return `${diffHours}h`;
    const diffMin = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `${diffMin}m`;
  };

  const formatDaysAgoText = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffHours === 0) return "Today (just now)";
      return `Today (${diffHours} hour${diffHours > 1 ? "s" : ""} ago)`;
    }
    return `${diffDays} day(s) ago`;
  };

  const getActionLabel = (notif: NotificationRecord) => {
    const t = notif.type;
    if (t.includes("LOGBOOK")) return "View Logbook";
    if (t.includes("PLACEMENT") || t.includes("ALLOCATION")) return "View Placement";
    if (t.includes("ASSESSMENT")) return "View Assessment";
    if (t.includes("MESSAGE")) return "Open Messages";
    return "View Details";
  };

  return (
    <div className="bg-background min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Search Bar (Old Mutual Style) */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notification subject or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9.5 text-xs h-9 rounded-full border-border/80 bg-card focus-visible:ring-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="text-xs h-8.5 rounded-lg gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* Main Two-Pane Split Layout (Direct Workday / Old Mutual Pattern) */}
      <div className="flex-1 grid md:grid-cols-12 gap-0 border border-border/60 rounded-xl bg-card overflow-hidden mt-4 shadow-xs">
        {/* Left Column: Notifications Feed (4 of 12 cols) */}
        <div className="md:col-span-4 border-r border-border/60 flex flex-col bg-card">
          {/* Left Header */}
          <div className="p-4 border-b border-border/60 space-y-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Notifications</h1>

            {/* Filter Pills / Dropdowns */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-2">
                {/* Viewing Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 text-xs font-medium hover:bg-muted/50 transition-colors cursor-pointer bg-card">
                      <span>Viewing: {viewFilter === "all" ? "All" : viewFilter === "unread" ? "Unread" : viewFilter === "logbooks" ? "Logbooks" : "Placements"}</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="text-xs">
                    <DropdownMenuItem onClick={() => setViewFilter("all")}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewFilter("unread")}>Unread Only</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewFilter("logbooks")}>Logbook Verification</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewFilter("placements")}>Placements & Supervision</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Order Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer">
                      <span>Sort By: {sortOrder === "newest" ? "Newest" : "Oldest"}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="text-xs">
                    <DropdownMenuItem onClick={() => setSortOrder("newest")}>Newest First</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Oldest First</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Three Dots Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem onClick={handleMarkAllRead}>
                    <Check className="w-3.5 h-3.5 mr-2" /> Mark all as read
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewFilter("unread")}>
                    Show unread only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-[11px] text-muted-foreground font-medium">From Last 30 Days</p>
          </div>

          {/* Left Notification List Items */}
          <div className="divide-y divide-border/40 overflow-y-auto max-h-[calc(100vh-16rem)]">
            {isLoading && notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#003366]" />
                Loading notifications...
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground px-4">
                No notifications to display under current filter.
              </div>
            ) : (
              filteredAndSorted.map((n) => {
                const isSelected = selectedNotif?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNotif(n)}
                    className={cn(
                      "p-4 transition-colors cursor-pointer text-left relative flex items-start gap-3",
                      isSelected
                        ? "bg-[#003366]/[0.05] dark:bg-blue-900/20"
                        : "hover:bg-muted/40",
                      !n.read && "font-medium"
                    )}
                  >
                    {/* Active Left Vertical Blue Bar Indicator (From User Screenshot) */}
                    {isSelected && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#003366] rounded-r-full" />
                    )}

                    {/* Unread Indicator Circle */}
                    <div className="mt-1 shrink-0">
                      {!n.read ? (
                        <div className="w-2 h-2 rounded-full bg-[#003366] ring-2 ring-[#003366]/20" />
                      ) : (
                        <div className="w-2 h-2 rounded-full border border-border/80" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-xs leading-snug line-clamp-2", isSelected ? "text-[#003366] dark:text-blue-400 font-bold" : !n.read ? "text-foreground font-bold" : "text-muted-foreground font-medium")}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono shrink-0">
                          {formatShortTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Detailed Notification Document (8 of 12 cols) */}
        <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between min-h-[500px] bg-card overflow-y-auto">
          {selectedNotif ? (
            <div className="space-y-6">
              {/* Document Header & Utility Icons */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border/60">
                <div className="space-y-1.5 flex-1">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    {selectedNotif.title}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    {formatDaysAgoText(selectedNotif.createdAt)} • {format(new Date(selectedNotif.createdAt), "dd MMM yyyy, h:mm a")}
                  </p>
                </div>

                {/* Utility Export and Action Icons (Right Corner) */}
                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => exportToExcel("Notification_Export", ["Title", "Date", "Message"], [[selectedNotif.title, selectedNotif.createdAt, selectedNotif.message]])}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Export to Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => exportToPDF("Official_Institutional_Notice", ["Subject", "Date", "Content"], [[selectedNotif.title, selectedNotif.createdAt, selectedNotif.message]])}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Export to PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleRead(selectedNotif)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={selectedNotif.read ? "Mark as unread" : "Mark as read"}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(selectedNotif.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Full Detailed Message Letter Body (Exact Workday / Old Mutual Pattern) */}
              <div className="space-y-4 text-xs md:text-sm text-foreground/90 leading-relaxed max-w-2xl">
                <p className="font-semibold text-foreground">
                  Good Day {user?.name || "Member"}
                </p>

                <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed text-sm">
                  {selectedNotif.message}
                </p>

                <div className="pt-2 text-muted-foreground text-xs space-y-1">
                  <p>Please review your dashboard record if any verification or input is required.</p>
                  <p>If you require institutional assistance, consult your University Academic Supervisor or Department Coordinator.</p>
                </div>

                <div className="pt-4 text-xs text-foreground/80">
                  <p>Kind Regards,</p>
                  <p className="font-semibold text-foreground mt-0.5">Work Related Learning Directorate</p>
                  <p className="text-muted-foreground text-[11px]">University of Zimbabwe</p>
                </div>
              </div>

              {/* Action Pill Button (Exact Blue Pill Button from Screenshot in OG Royal Navy) */}
              {selectedNotif.link && (
                <div className="pt-6">
                  <Button
                    onClick={() => router.push(selectedNotif.link!)}
                    className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold h-9 px-6 rounded-full shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>{getActionLabel(selectedNotif)}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2">
              <Bell className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No notification selected</p>
              <p className="text-xs max-w-xs">Select a notification from the list on the left to read its full official notice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96 gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-[#003366]" />
        Loading notifications...
      </div>
    }>
      <NotificationsContent />
    </Suspense>
  );
}
