"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { 
  Eye, 
  Calendar, 
  FileDown, 
  Search, 
  Loader2, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Building2, 
  UserCheck, 
  RefreshCw,
  AlertCircle,
  GraduationCap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import LogbookDownloadButton from "@/components/pdf/LogbookDownloadButton";

export default function LogbookOverview() {
  const { user } = useAuth();
  
  const [data, setData] = useState<{ students: any[]; entries: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const email = user?.email || "";
      const res = await fetch(`/api/lecturer/logbook${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (selectedStudent) {
          const updated = json.students.find((s: any) => s.studentId === selectedStudent.studentId);
          if (updated) setSelectedStudent(updated);
        }
      } else {
        toast.error(json.error || "Failed to load logbooks");
      }
    } catch {
      toast.error("Network error loading logbook entries");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, selectedStudent?.studentId]);

  useEffect(() => {
    fetchData();
  }, [user?.email]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success("Logbook records synchronized");
  };

  const students = data?.students || [];

  const filteredStudents = students.filter((s: any) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.regNumber.toLowerCase().includes(q) ||
      s.companyName.toLowerCase().includes(q)
    );
  });

  const handleOpenReview = (entry: any, student: any) => {
    setSelectedEntry({ ...entry, studentName: student.name, studentReg: student.regNumber });
    setReviewComment(entry.lecturerComment || "");
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async (approved: boolean) => {
    if (!selectedEntry) return;

    try {
      setIsSubmittingReview(true);
      const res = await fetch("/api/lecturer/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: selectedEntry.id,
          comment: reviewComment,
          approved,
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(approved ? "Week approved with official academic sign-off!" : "Academic feedback saved.");
        setReviewDialogOpen(false);
        // Refresh local data
        await fetchData();
      } else {
        toast.error(json.error || "Failed to submit review");
      }
    } catch {
      toast.error("Network error submitting review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#003366] dark:text-[#ff8c00]" />
        <p className="text-xs text-muted-foreground font-medium">Loading student logbook entries...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-[#003366] dark:text-[#ff8c00]" />
            Academic Logbook Review & Governance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review student weekly tasks, inspect workplace supervisor remarks, and provide university academic sign-offs.
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
        </div>
      </div>

      {students.length === 0 ? (
        <Card className="border-border/60 shadow-xs">
          <CardContent className="pt-12 pb-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-base font-semibold text-foreground">No students assigned to your supervision</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Once the Departmental Coordinator allocates students to you, their weekly logbook submissions will appear here for review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Student Roster */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, reg number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>

            <div className="space-y-2.5">
              {filteredStudents.map((s: any) => {
                const isSelected = selectedStudent?.studentId === s.studentId;
                return (
                  <Card
                    key={s.studentId}
                    onClick={() => setSelectedStudent(s)}
                    className={`border cursor-pointer transition-all hover:shadow-xs ${
                      isSelected
                        ? "border-[#003366] dark:border-[#ff8c00] bg-muted/40 shadow-xs"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-foreground">{s.name}</div>
                          <div className="text-[11px] font-mono text-[#003366] dark:text-blue-400 mt-0.5">
                            {s.regNumber} • {s.programmeCode}
                          </div>
                        </div>
                        {s.pendingReviewCount > 0 ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold">
                            {s.pendingReviewCount} Pending Review
                          </Badge>
                        ) : s.submittedCount > 0 ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold">
                            All Reviewed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px]">
                            No Submissions
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium text-foreground truncate">{s.companyName}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        <span>Total Entries: <strong>{s.totalEntries}</strong></span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Approved: <strong>{s.approvedCount}</strong>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Entries of Selected Student */}
          <div className="lg:col-span-7">
            {selectedStudent ? (
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="border-b border-border/40 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-foreground">
                          {selectedStudent.name}
                        </CardTitle>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {selectedStudent.regNumber}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Attachment at <strong>{selectedStudent.companyName}</strong> • Mentor: {selectedStudent.supervisorName}
                      </CardDescription>
                    </div>

                    {selectedStudent.entries.length > 0 && (
                      <LogbookDownloadButton
                        studentName={selectedStudent.name || ""}
                        regNumber={selectedStudent.regNumber || ""}
                        faculty="Faculty of Science and Technology"
                        department="Department of Computer Science"
                        programme={selectedStudent.programmeName || selectedStudent.programmeCode || "BSc Computer Science Honours"}
                        hostInstitution={selectedStudent.companyName || "Host Organization"}
                        supervisorName={selectedStudent.supervisorName || "Workplace Supervisor"}
                        lecturerName={user?.name || "Academic Supervisor"}
                        entries={selectedStudent.entries.map((e: any) => ({
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
                        buttonText="Download Marked PDF"
                        size="sm"
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {selectedStudent.entries.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/40" />
                      <p className="text-sm font-semibold text-foreground">No logbook entries logged yet</p>
                      <p className="text-xs text-muted-foreground">
                        The student has not created or submitted any weekly logbook entries yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudent.entries.map((entry: any) => {
                        const isSubmitted = entry.status === "SUBMITTED" || entry.status === "APPROVED";
                        const isLecturerApproved = entry.lecturerApproved;
                        const isSupervisorApproved = entry.supervisorApproved;

                        return (
                          <div
                            key={entry.id}
                            className="p-4 rounded-xl border border-border/60 bg-muted/15 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">
                                  Week {entry.week}
                                </span>
                                {entry.weekEndingDate && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Ending: {format(parseISO(entry.weekEndingDate), "PP")}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {isSupervisorApproved ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                                    <UserCheck className="w-3 h-3 mr-1" /> Mentor Signed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                    Mentor Pending
                                  </Badge>
                                )}

                                {isLecturerApproved ? (
                                  <Badge className="bg-emerald-600 text-white text-[10px]">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Academic Approved
                                  </Badge>
                                ) : isSubmitted ? (
                                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                                    <Clock className="w-3 h-3 mr-1" /> Pending Lecturer Sign-off
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px]">Draft</Badge>
                                )}
                              </div>
                            </div>

                            {/* Logbook Tasks Content */}
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="font-semibold text-foreground block">Key Objectives:</span>
                                <p className="text-muted-foreground mt-0.5">{entry.objectives || "Not specified."}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground block">Tasks Completed:</span>
                                <p className="text-muted-foreground mt-0.5">{entry.actualTasks || "Not specified."}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground block">Student Reflection & Skill Acquisition:</span>
                                <p className="text-muted-foreground mt-0.5">{entry.reflection || "Not specified."}</p>
                              </div>
                            </div>

                            {/* Comments Section */}
                            {(entry.supervisorComment || entry.lecturerComment) && (
                              <div className="p-3 rounded-lg bg-background/80 border border-border/50 text-xs space-y-1.5">
                                {entry.supervisorComment && (
                                  <div className="text-muted-foreground">
                                    <span className="font-semibold text-foreground">Workplace Mentor Feedback: </span>
                                    <span>"{entry.supervisorComment}"</span>
                                  </div>
                                )}
                                {entry.lecturerComment && (
                                  <div className="text-muted-foreground">
                                    <span className="font-semibold text-[#003366] dark:text-[#ff8c00]">Your Academic Comment: </span>
                                    <span>"{entry.lecturerComment}"</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <Button
                                size="sm"
                                variant={isLecturerApproved ? "outline" : "default"}
                                onClick={() => handleOpenReview(entry, selectedStudent)}
                                className={`text-xs h-8 ${
                                  isLecturerApproved
                                    ? ""
                                    : "bg-[#003366] hover:bg-[#002244] dark:bg-[#ff8c00] dark:hover:bg-[#e07b00] text-white"
                                }`}
                              >
                                {isLecturerApproved ? "Update Review" : "Review & Sign Off"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/60 shadow-xs">
                <CardContent className="py-20 text-center space-y-2">
                  <UserCheck className="w-10 h-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm font-semibold text-foreground">Select a student candidate</p>
                  <p className="text-xs text-muted-foreground">
                    Choose an intern from the roster on the left to inspect their weekly logbook submissions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Lecturer Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border/80">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#003366] dark:text-[#ff8c00]" />
              Academic Logbook Sign-off: Week {selectedEntry?.week}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Candidate: <strong>{selectedEntry?.studentName}</strong> ({selectedEntry?.studentReg})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Academic Feedback & Instructions</Label>
              <Textarea
                placeholder="Provide constructive academic evaluation or corrective guidance on these weekly tasks..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubmitReview(false)}
              disabled={isSubmittingReview}
              className="text-xs h-9"
            >
              Save Feedback Only
            </Button>
            <Button
              size="sm"
              onClick={() => handleSubmitReview(true)}
              disabled={isSubmittingReview}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 shadow-xs"
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Signing Off...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Approve & Sign Off
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
