"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Plus, 
  FileDown, 
  Calendar as CalendarIcon, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  Building2,
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import LogbookDownloadButton from "@/components/pdf/LogbookDownloadButton";

export default function Logbook() {
  const { user } = useAuth();
  
  const [data, setData] = useState<{ placement: any; entries: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewCommentDialog, setViewCommentDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  
  // Form State
  const [weekNumber, setWeekNumber] = useState(1);
  const [weekEndDate, setWeekEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [objectives, setObjectives] = useState("");
  const [actualTasks, setActualTasks] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const email = user?.email || "";
      const res = await fetch(`/api/student/logbook${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        // default next week number
        if (json.entries && json.entries.length > 0) {
          const maxWeek = Math.max(...json.entries.map((e: any) => e.week));
          setWeekNumber(maxWeek + 1);
        }
      } else {
        toast.error(json.error || "Failed to load logbook");
      }
    } catch {
      toast.error("Network error loading logbook entries");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success("Logbook synchronized with academic roster");
  };

  const handleOpenNewEntry = () => {
    const existingWeeks = data?.entries?.map((e: any) => e.week) || [];
    let nextW = 1;
    while (existingWeeks.includes(nextW)) nextW++;
    setWeekNumber(nextW);
    setWeekEndDate(new Date().toISOString().split("T")[0]);
    setObjectives("");
    setActualTasks("");
    setReflection("");
    setDialogOpen(true);
  };

  const handleSaveEntry = async (status: "DRAFT" | "SUBMITTED") => {
    if (!objectives || !actualTasks) {
      toast.error("Please fill in key objectives and actual tasks completed.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/student/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placementId: data?.placement?.id,
          email: user?.email,
          week: weekNumber,
          weekEndingDate: weekEndDate,
          objectives,
          actualTasks,
          reflection,
          status,
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(status === "SUBMITTED" ? `Week ${weekNumber} logbook submitted to mentors!` : `Week ${weekNumber} draft saved.`);
        setDialogOpen(false);
        await fetchData();
      } else {
        toast.error(json.error || "Failed to save logbook entry");
      }
    } catch {
      toast.error("Network error saving logbook entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewComments = (entry: any) => {
    setSelectedEntry(entry);
    setViewCommentDialog(true);
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#003366] dark:text-[#ff8c00]" />
        <p className="text-xs text-muted-foreground font-medium">Loading your weekly logbook...</p>
      </div>
    );
  }

  const entries = data?.entries || [];
  const placement = data?.placement;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-[#003366] dark:text-[#ff8c00]" />
            Industrial Work Logbook
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Weekly task documentation, reflection entries, and official tripartite sign-offs.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {entries.length > 0 && (
            <LogbookDownloadButton
              studentName={placement?.studentName || user?.name || "Student"}
              regNumber={placement?.regNumber || (user as any)?.regNumber || (user as any)?.reg_number || ""}
              faculty={placement?.faculty || "Faculty of Science and Technology"}
              department={placement?.department || "Department of Computer Science"}
              programme={placement?.programme || "BSc Computer Science Honours"}
              hostInstitution={placement?.companyName || "Host Organization"}
              supervisorName={placement?.supervisorName || "Workplace Supervisor"}
              lecturerName={placement?.lecturerName || "Academic Supervisor"}
              entries={entries.map((e: any) => ({
                week: e.week,
                weekEndingDate: e.weekEndingDate || e.week_ending_date || "",
                objectives: e.objectives || "",
                actualTasks: e.actualTasks || e.actual_tasks || "",
                reflection: e.reflection || "",
                status: e.status || "draft",
                supervisorComment: e.supervisorComment || e.supervisor_comment,
                supervisorApproved: e.supervisorApproved ?? e.supervisor_approved,
                lecturerApproved: e.lecturerApproved ?? e.lecturer_approved,
              }))}
              buttonText="Download Marked Logbook (PDF)"
            />
          )}
          <Button
            size="sm"
            onClick={handleOpenNewEntry}
            disabled={!placement}
            className="bg-[#003366] hover:bg-[#002244] dark:bg-[#ff8c00] dark:hover:bg-[#e07b00] text-white text-xs h-9 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Week Entry
          </Button>
        </div>
      </div>

      {/* Tripartite Attachment Status Banner */}
      {placement ? (
        <Card className="border-border/60 shadow-xs bg-muted/20">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#003366]/10 dark:bg-blue-500/10 flex items-center justify-center text-[#003366] dark:text-blue-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{placement.companyName}</div>
                  <div className="text-muted-foreground mt-0.5">Accredited Industrial Attachment Organization</div>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Workplace Mentor</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {placement.supervisorName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">University Assessor</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {placement.lecturerName || "Assigned by Department"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 shadow-xs">
          <CardContent className="py-8 text-center text-xs text-muted-foreground">
            You do not currently have an active accredited placement. Please submit your placement details for Coordinator verification.
          </CardContent>
        </Card>
      )}

      {/* Logbook Entries Table */}
      <Card className="border-border/60 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#003366] dark:text-[#ff8c00]" />
              Weekly Attachment Records
            </CardTitle>
            <span className="text-xs text-muted-foreground font-mono">
              {entries.length} {entries.length === 1 ? "Week Logged" : "Weeks Logged"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">No weekly logbook entries recorded</p>
                <p className="text-xs text-muted-foreground">Click "New Week Entry" above to log your first week on attachment.</p>
              </div>
              <Button size="sm" onClick={handleOpenNewEntry} disabled={!placement} className="text-xs mt-2">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Log Week 1
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[100px] font-semibold text-xs">Period</TableHead>
                    <TableHead className="font-semibold text-xs">Summary of Tasks & Objectives</TableHead>
                    <TableHead className="font-semibold text-xs">Mentor Sign-off</TableHead>
                    <TableHead className="font-semibold text-xs">Academic Approval</TableHead>
                    <TableHead className="text-right font-semibold text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry: any) => {
                    const hasComments = Boolean(entry.supervisorComment || entry.lecturerComment);

                    return (
                      <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-bold text-sm text-foreground">Week {entry.week}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {entry.weekEndingDate ? format(parseISO(entry.weekEndingDate), "PP") : "Active"}
                          </div>
                        </TableCell>

                        <TableCell className="max-w-md">
                          <div className="text-xs font-semibold text-foreground line-clamp-1">
                            {entry.objectives}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {entry.actualTasks}
                          </div>
                        </TableCell>

                        <TableCell>
                          {entry.supervisorApproved ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                            </Badge>
                          ) : entry.status === "SUBMITTED" ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                              <Clock className="w-3 h-3 mr-1" /> Submitted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">Draft</Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          {entry.lecturerApproved ? (
                            <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                            </Badge>
                          ) : entry.status === "SUBMITTED" ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                              <Clock className="w-3 h-3 mr-1" /> Under Review
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">Draft</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewComments(entry)}
                            className="h-8 text-xs gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {hasComments ? "View Feedback" : "View Entry"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Logbook Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-card border-border/80">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#003366] dark:text-[#ff8c00]" />
              Record Logbook: Week {weekNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Document your weekly learning objectives, technical duties performed, and reflective self-evaluation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Week Number</Label>
                <Input
                  type="number"
                  min={1}
                  max={36}
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(Number(e.target.value))}
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Week Ending Date</Label>
                <Input
                  type="date"
                  value={weekEndDate}
                  onChange={(e) => setWeekEndDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Weekly Objectives *</Label>
              <Textarea
                placeholder="What technical and professional goals were planned for this week?"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Actual Tasks & Projects Completed *</Label>
              <Textarea
                placeholder="Detail the technical tasks, code authored, tickets closed, systems maintained..."
                value={actualTasks}
                onChange={(e) => setActualTasks(e.target.value)}
                rows={3}
                className="text-xs resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Student Reflection & Competency Acquisition</Label>
              <Textarea
                placeholder="What challenges did you resolve? What industry skills did you sharpen?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveEntry("DRAFT")}
              disabled={isSubmitting}
              className="text-xs h-9"
            >
              Save as Draft
            </Button>
            <Button
              size="sm"
              onClick={() => handleSaveEntry("SUBMITTED")}
              disabled={isSubmitting}
              className="bg-[#003366] hover:bg-[#002244] dark:bg-[#ff8c00] dark:hover:bg-[#e07b00] text-white text-xs h-9 shadow-xs font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Submit for Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Comments / Entry Details Dialog */}
      <Dialog open={viewCommentDialog} onOpenChange={setViewCommentDialog}>
        <DialogContent className="max-w-md bg-card border-border/80">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#003366] dark:text-[#ff8c00]" />
              Week {selectedEntry?.week} Logbook Details & Feedback
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official tripartite review notes from your workplace mentor and university academic assessor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1.5">
              <span className="font-semibold text-foreground block">Key Tasks Logged:</span>
              <p className="text-muted-foreground leading-relaxed">{selectedEntry?.actualTasks || "No tasks recorded."}</p>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-border/60 bg-muted/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Workplace Mentor Sign-off
                  </span>
                  {selectedEntry?.supervisorApproved ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px]">Approved</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Pending</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-[11px] pt-1">
                  {selectedEntry?.supervisorComment ? `"${selectedEntry.supervisorComment}"` : "No feedback comment added yet."}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-muted/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Academic Lecturer Sign-off
                  </span>
                  {selectedEntry?.lecturerApproved ? (
                    <Badge className="bg-emerald-600 text-white text-[10px]">Approved</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Under Review</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-[11px] pt-1">
                  {selectedEntry?.lecturerComment ? `"${selectedEntry.lecturerComment}"` : "No academic feedback added yet."}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewCommentDialog(false)} className="text-xs h-9">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
