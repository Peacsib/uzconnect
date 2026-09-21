"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Bell, 
  Search, 
  ShieldCheck, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  Mail, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Loader2,
  Check,
  Filter,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<NotificationRecord | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, unread: 0, logbooks: 0, placements: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "logbooks" | "placements">("all");

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        const notifs = data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(data.unreadCount || 0);
        if (data.stats) setStats(data.stats);
        if (notifs.length > 0 && !selectedNotif) {
          setSelectedNotif(notifs[0]);
        }
      }
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
    toast.success("Notifications synchronized");
  };

  const handleMarkAllRead = async () => {
    if (!user?.email || unreadCount === 0) return;
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      setStats((s) => ({ ...s, unread: 0 }));
      if (selectedNotif) setSelectedNotif({ ...selectedNotif, read: true });
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Error marking all read");
    }
  };

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
        setUnreadCount((c) => Math.max(0, c - 1));
        setStats((s) => ({ ...s, unread: Math.max(0, s.unread - 1) }));
      } catch (err) {
        console.error("Error updating read status:", err);
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
      setUnreadCount((c) => (nextRead ? Math.max(0, c - 1) : c + 1));
      setStats((s) => ({ ...s, unread: nextRead ? Math.max(0, s.unread - 1) : s.unread + 1 }));
      if (selectedNotif?.id === notif.id) {
        setSelectedNotif({ ...selectedNotif, read: nextRead });
      }
      toast.success(nextRead ? "Marked as read" : "Marked as unread");
    } catch {
      toast.error("Failed to toggle read status");
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
        toast.success("Notification removed");
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab === "unread" && n.read) return false;
      if (activeTab === "logbooks") {
        if (!["LOGBOOK_SUBMITTED", "LOGBOOK_APPROVED", "LOGBOOK_PENDING", "LOGBOOK_DEADLINES", "ASSESSMENT_COMPLETED"].includes(n.type)) {
          return false;
        }
      }
      if (activeTab === "placements") {
        if (!["PLACEMENT_APPROVED", "PLACEMENT_ACTIVE", "PLACEMENT_PENDING", "ALLOCATION"].includes(n.type)) {
          return false;
        }
      }
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, activeTab, search]);

  const getCategoryName = (type: string) => {
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
        return "Institutional Record";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "PLACEMENT_APPROVED":
      case "PLACEMENT_ACTIVE":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "LOGBOOK_APPROVED":
        return <CheckCheck className="w-4 h-4 text-emerald-600" />;
      case "LOGBOOK_SUBMITTED":
      case "LOGBOOK_PENDING":
      case "PLACEMENT_PENDING":
      case "LOGBOOK_DEADLINES":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "ALLOCATION":
        return <GraduationCap className="w-4 h-4 text-[#003366] dark:text-blue-400" />;
      case "ALERT":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "MESSAGE":
        return <Mail className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Greeting (The Forge & Old Mutual Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00875a] dark:text-emerald-400">
            Institutional Audit & Notifications
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Welcome, {user?.name || "Member"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your centralized institutional notifications, tripartite logbook reviews, and academic milestones
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs h-8.5 rounded-lg cursor-pointer gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs h-8.5 rounded-lg cursor-pointer gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 4 The Forge Style Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Historical Notices</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Logged records</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#003366]/10 text-[#003366] dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Action Required</p>
              <p className="text-2xl font-bold text-[#ff8c00] mt-1">{stats.unread}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Unread alerts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ff8c00]/10 text-[#ff8c00] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Logbook Reviews</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.logbooks}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Weekly submissions</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Supervision & Viva</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats.placements}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Attachment milestones</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className={cn("text-xs h-8 rounded-full px-3.5 cursor-pointer font-medium", activeTab === "all" && "bg-[#003366] text-white hover:bg-[#002244]")}
          >
            All Notices ({notifications.length})
          </Button>
          <Button
            variant={activeTab === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("unread")}
            className={cn("text-xs h-8 rounded-full px-3.5 cursor-pointer font-medium", activeTab === "unread" && "bg-[#ff8c00] text-white hover:bg-[#e07b00]")}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={activeTab === "logbooks" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("logbooks")}
            className={cn("text-xs h-8 rounded-full px-3.5 cursor-pointer font-medium", activeTab === "logbooks" && "bg-emerald-700 text-white")}
          >
            Logbooks ({stats.logbooks})
          </Button>
          <Button
            variant={activeTab === "placements" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("placements")}
            className={cn("text-xs h-8 rounded-full px-3.5 cursor-pointer font-medium", activeTab === "placements" && "bg-[#003366] text-white")}
          >
            Placements ({stats.placements})
          </Button>
        </div>

        {/* Search Bar (Old Mutual Portal Pill Styling) */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8.5 text-xs h-8.5 rounded-full border-border/70 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Master-Detail Inbox View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#003366] dark:text-[#ffa726]" />
          <p className="text-xs text-muted-foreground font-medium">Loading notifications ledger...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-12 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h3 className="font-semibold text-foreground text-sm">No Notifications Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search ? "No records matched your search filter." : "You have no active notifications under this category."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-5 gap-6 items-start">
          {/* Left Column: Notification Feed (2 cols) */}
          <div className="md:col-span-2 space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredList.map((n) => {
              const isSelected = selectedNotif?.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => handleSelectNotif(n)}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 relative",
                    isSelected
                      ? "border-[#00875a] bg-[#00875a]/[0.04] shadow-xs"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/30",
                    !n.read && "border-l-4 border-l-[#ff8c00]"
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="shrink-0">{getIcon(n.type)}</div>
                      <p className={cn("text-xs font-semibold truncate", !n.read ? "text-foreground" : "text-muted-foreground")}>
                        {n.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pl-6">
                    {n.message}
                  </p>
                  <div className="flex items-center justify-between pl-6 pt-0.5">
                    <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wider font-semibold">
                      {getCategoryName(n.type)}
                    </span>
                    {!n.read && (
                      <span className="text-[10px] text-[#ff8c00] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff8c00]" />
                        Unread
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Full Detailed Viewer Pane (3 cols) */}
          <div className="md:col-span-3">
            {selectedNotif ? (
              <Card className="border-border/70 shadow-sm rounded-2xl overflow-hidden sticky top-20">
                {/* Top Accent Stripe */}
                <div className="h-1.5 bg-gradient-to-r from-[#00875a] via-[#003366] to-[#00875a] w-full" />

                <CardHeader className="pb-4 border-b border-border/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00875a] dark:text-emerald-400">
                      {getCategoryName(selectedNotif.type)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-2.5 py-0.5",
                        selectedNotif.read
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : "bg-[#ff8c00]/10 text-[#ff8c00] border-[#ff8c00]/30"
                      )}
                    >
                      {selectedNotif.read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(selectedNotif.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground leading-snug">
                        {selectedNotif.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">
                        {formatFullDateTime(selectedNotif.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Full Message Container */}
                  <div className="p-4.5 rounded-xl bg-muted/40 border border-border/60 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedNotif.message}
                  </div>

                  {/* Context Card (The Forge "What moves you forward" Pattern) */}
                  <div className="p-4 rounded-xl border border-border/50 bg-background space-y-2 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00875a] dark:text-emerald-400" />
                      What moves you forward
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Derived from your current institutional workflow state
                    </p>
                    <ul className="space-y-2 text-muted-foreground text-[11px] pt-1">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00875a] shrink-0 mt-1.5" />
                        <span>Actionable record synchronized with your university account profile.</span>
                      </li>
                      {selectedNotif.link && (
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00875a] shrink-0 mt-1.5" />
                          <span>Direct confirmation or grading response available at target module.</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRead(selectedNotif)}
                        className="text-xs h-8.5 rounded-lg cursor-pointer flex-1 sm:flex-none"
                      >
                        {selectedNotif.read ? "Mark as unread" : "Mark as read"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(selectedNotif.id)}
                        className="text-xs h-8.5 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer px-3"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {selectedNotif.link && (
                      <Button
                        size="sm"
                        onClick={() => router.push(selectedNotif.link!)}
                        className="w-full sm:w-auto bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-semibold h-8.5 px-5 rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        <span>Open Related Page</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/60 p-12 text-center text-muted-foreground text-xs">
                Select a notification to view its full details.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
