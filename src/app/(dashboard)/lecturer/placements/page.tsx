"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { 
  Search, 
  FileDown, 
  FileSpreadsheet, 
  Loader2, 
  Calendar as CalendarIcon, 
  Clock, 
  Building2, 
  User, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

interface PlacementRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  regNumber: string;
  programmeCode: string;
  programmeName: string;
  companyId: string;
  companyName: string;
  companyAddress?: string;
  companyCity?: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  startDate: string;
  endDate: string;
  status: string;
  totalLogbooks: number;
  approvedLogbooks: number;
  pendingReviewLogbooks: number;
  deadlines: Array<{ id: string; week: number; dueDate: string }>;
}

export default function PlacementsManagement() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementRecord | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [isSavingDeadlines, setIsSavingDeadlines] = useState(false);
  
  // Deadline state - 12 weeks
  const [weekDeadlines, setWeekDeadlines] = useState<Array<{ week: number; due_date: Date | undefined }>>([]);

  const fetchPlacements = useCallback(async () => {
    try {
      setIsLoading(true);
      const email = user?.email || "";
      const res = await fetch(`/api/lecturer/placements${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.placements)) {
        setPlacements(json.placements);
      } else {
        toast.error(json.error || "Failed to load placement records");
      }
    } catch {
      toast.error("Network error connecting to placements API");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPlacements();
    setIsRefreshing(false);
    toast.success("Placements synchronized with university registry");
  };

  useEffect(() => {
    if (deadlineDialogOpen && selectedPlacement) {
      // Initialize with 12 weeks
      const weeks = Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        due_date: undefined as Date | undefined,
      }));
      
      // Populate with existing deadlines
      if (selectedPlacement.deadlines && selectedPlacement.deadlines.length > 0) {
        selectedPlacement.deadlines.forEach((dl: any) => {
          const weekIndex = weeks.findIndex((w) => w.week === dl.week);
          if (weekIndex !== -1 && dl.dueDate) {
            weeks[weekIndex].due_date = new Date(dl.dueDate);
          }
        });
      }
      
      setWeekDeadlines(weeks);
    }
  }, [deadlineDialogOpen, selectedPlacement]);

  const filtered = useMemo(() => {
    return placements.filter((pl) => {
      const q = debouncedSearch.toLowerCase();
      return (
        !q ||
        pl.studentName.toLowerCase().includes(q) ||
        pl.regNumber.toLowerCase().includes(q) ||
        pl.companyName.toLowerCase().includes(q) ||
        pl.supervisorName.toLowerCase().includes(q) ||
        pl.programmeName.toLowerCase().includes(q)
      );
    });
  }, [placements, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCols = ["Student Name", "Reg Number", "Host Employer", "Supervisor", "Start Date", "End Date", "Status"];
  const getExportRows = () =>
    filtered.map((pl) => [
      pl.studentName,
      pl.regNumber,
      pl.companyName,
      pl.supervisorName,
      formatDate(pl.startDate || ""),
      formatDate(pl.endDate || ""),
      pl.status,
    ]);

  const handleSetDeadlines = (placement: PlacementRecord) => {
    setSelectedPlacement(placement);
    setDeadlineDialogOpen(true);
  };

  const handleSaveDeadlines = async () => {
    if (!selectedPlacement) return;
    
    const deadlinesToSave = weekDeadlines
      .filter((w) => w.due_date)
      .map((w) => ({
        week: w.week,
        dueDate: format(w.due_date!, "yyyy-MM-dd"),
      }));
    
    if (deadlinesToSave.length === 0) {
      toast.error("Please set at least one submission deadline");
      return;
    }
    
    try {
      setIsSavingDeadlines(true);
      const res = await fetch("/api/lecturer/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placementId: selectedPlacement.id,
          deadlines: deadlinesToSave,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Logbook deadlines updated and synced with student calendar!");
        setDeadlineDialogOpen(false);
        fetchPlacements();
      } else {
        toast.error(json.error || "Failed to update deadlines");
      }
    } catch {
      toast.error("Network error while saving deadlines");
    } finally {
      setIsSavingDeadlines(false);
    }
  };

  const handleBulkSetDeadlines = (startDate: Date, intervalDays: number) => {
    const newDeadlines = weekDeadlines.map((w, index) => {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + index * intervalDays);
      return {
        ...w,
        due_date: dueDate,
      };
    });
    setWeekDeadlines(newDeadlines);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Supervised Placements</h1>
            <Badge variant="outline" className="bg-[#003366]/10 text-[#003366] dark:text-blue-400 border-[#003366]/20 text-xs font-semibold">
              {placements.length} {placements.length === 1 ? "Active Student" : "Active Students"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time industrial attachment records, tripartite supervision rosters, and submission schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="text-xs h-8 rounded-lg cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isRefreshing && "animate-spin")} />
            Sync Roster
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToPDF("Supervised_Placements_Report", exportCols, getExportRows())}
            className="text-xs h-8 rounded-lg cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel("Supervised_Placements", exportCols, getExportRows())}
            className="text-xs h-8 rounded-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Excel
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student, reg number, or employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#003366] dark:text-[#ffa726]" />
          <p className="text-xs text-muted-foreground font-medium">Loading placement registry...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center space-y-3">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-foreground text-sm">No Supervised Placements Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {search ? "No records matched your search query." : "No students have been assigned to your supervision roster yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/40">
                    <TableHead className="text-xs font-semibold">Student</TableHead>
                    <TableHead className="text-xs font-semibold">Host Employer</TableHead>
                    <TableHead className="text-xs font-semibold">Workplace Supervisor</TableHead>
                    <TableHead className="text-xs font-semibold">Attachment Period</TableHead>
                    <TableHead className="text-xs font-semibold">Logbook Progress</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((pl) => (
                    <TableRow key={pl.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{pl.studentName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{pl.regNumber}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">{pl.programmeName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          {pl.companyName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{pl.companyCity || "Harare"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-foreground">{pl.supervisorName}</div>
                        <div className="text-[11px] text-muted-foreground">{pl.supervisorEmail}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(pl.startDate)} – {formatDate(pl.endDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/5 text-primary text-[10px] px-2 py-0.5">
                            {pl.approvedLogbooks} approved / {pl.totalLogbooks} logs
                          </Badge>
                          {pl.pendingReviewLogbooks > 0 && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] px-1.5 py-0.5">
                              {pl.pendingReviewLogbooks} pending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(getStatusColor(pl.status), "text-[11px] px-2 py-0.5")}>
                          {pl.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/lecturer/logbook")}
                            className="h-7.5 text-xs px-2.5 rounded-md cursor-pointer gap-1"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                            Logbooks
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDeadlines(pl)}
                            className="h-7.5 text-xs px-2.5 rounded-md cursor-pointer gap-1"
                          >
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            Deadlines
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <p>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} placements
              </p>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-7.5 text-xs">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7.5 text-xs">
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Set Deadlines Dialog */}
      <Dialog open={deadlineDialogOpen} onOpenChange={setDeadlineDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Configure Submission Deadlines</DialogTitle>
            <DialogDescription className="text-xs">
              Establish weekly logbook milestone deadlines for {selectedPlacement?.studentName} ({selectedPlacement?.regNumber})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="bg-muted/40 p-3 rounded-lg border border-border/50 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">{selectedPlacement?.studentName}</span>
                <span className="text-muted-foreground"> • {selectedPlacement?.companyName}</span>
              </div>
              <span className="text-muted-foreground">
                Period: {selectedPlacement && formatDate(selectedPlacement.startDate)} – {selectedPlacement && formatDate(selectedPlacement.endDate)}
              </span>
            </div>

            {/* Bulk Set Option */}
            <div className="border border-border/60 rounded-lg p-3.5 space-y-2 bg-muted/20">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Quick Set Recurring Schedule
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Automatically populate 12 weekly deadlines every 7 days beginning from a designated date
              </p>
              <div className="flex gap-2 items-center pt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs justify-start font-normal">
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      Pick schedule start date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      onSelect={(date) => date && handleBulkSetDeadlines(date, 7)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkSetDeadlines(new Date(), 7)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Set Weekly from Today
                </Button>
              </div>
            </div>

            {/* Individual Week Deadlines */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Weekly Milestone Due Dates</Label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1 border border-border/40 rounded-lg">
                {weekDeadlines.map((week, index) => (
                  <div key={week.week} className="flex items-center gap-2 border border-border/50 rounded-md p-2 bg-card">
                    <span className="text-xs font-semibold w-14 shrink-0">Week {week.week}</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 justify-start text-left font-normal text-xs h-7.5",
                            !week.due_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-1.5 h-3 w-3" />
                          {week.due_date ? format(week.due_date, "dd MMM yyyy") : "Set due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={week.due_date}
                          onSelect={(date) => {
                            const newDeadlines = [...weekDeadlines];
                            newDeadlines[index].due_date = date;
                            setWeekDeadlines(newDeadlines);
                          }}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {week.due_date && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newDeadlines = [...weekDeadlines];
                          newDeadlines[index].due_date = undefined;
                          setWeekDeadlines(newDeadlines);
                        }}
                        className="h-7 px-1.5 text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeadlineDialogOpen(false)} className="text-xs h-8">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveDeadlines}
              disabled={isSavingDeadlines}
              className="bg-primary text-primary-foreground text-xs h-8"
            >
              {isSavingDeadlines ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving Deadlines...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Save Deadlines
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
