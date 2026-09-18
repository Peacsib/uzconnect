"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, FileDown, Lock, CalendarIcon, Loader2, AlertTriangle, MessageSquare, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { getStatusColor } from "@/utils/formatters";
import { PDFDownloadLink } from "@react-pdf/renderer";
import LogbookPDF from "@/components/pdf/LogbookPDF";
import { usePlacements, useLogbookEntries, useCreateLogbookEntry, useSubmitLogbookEntry } from "@/hooks/useApi";

export default function Logbook() {
  const { user } = useAuth();
  
  // Fetch data from API
  const { data: placements, isLoading: placementsLoading } = usePlacements();
  const { data: logbookEntries, isLoading: entriesLoading } = useLogbookEntries();
  const createEntry = useCreateLogbookEntry();
  const submitEntry = useSubmitLogbookEntry();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewCommentDialog, setViewCommentDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [weekEndDate, setWeekEndDate] = useState<Date>();
  const [objectives, setObjectives] = useState("");
  const [actualTasks, setActualTasks] = useState("");
  const [reflection, setReflection] = useState("");

  const isLoading = placementsLoading || entriesLoading;
  
  // Filter data for current student
  const myPlacement = placements?.find((p) => p.student_id === user?.id);
  const entries = logbookEntries?.filter((e) => e.student_id === user?.id).sort((a, b) => a.week - b.week) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  if (!myPlacement || myPlacement.status !== "active") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Logbook</h1>
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-medium">Logbook not available</p>
            <p className="text-sm text-muted-foreground">Your placement must be confirmed by your supervisor before you can access the logbook.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!weekEndDate || !objectives.trim() || !actualTasks.trim() || !reflection.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await createEntry.mutateAsync({
        week: entries.length + 1,
        week_ending_date: format(weekEndDate, "yyyy-MM-dd"),
        objectives: objectives.trim(),
        actual_tasks: actualTasks.trim(),
        reflection: reflection.trim(),
      });
      
      setDialogOpen(false);
      setObjectives("");
      setActualTasks("");
      setReflection("");
      setWeekEndDate(undefined);
    } catch (error) {
      // Error toast is handled by the hook
      console.error("Failed to create logbook entry:", error);
    }
  };

  const handleSubmitForApproval = async (entryId: string, dueDate?: string) => {
    // Check if deadline has passed
    if (dueDate) {
      const deadline = new Date(dueDate);
      const now = new Date();
      if (now > deadline) {
        toast.error("Deadline has passed. Please contact your lecturer for an extension.");
        return;
      }
    }

    try {
      await submitEntry.mutateAsync(entryId);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleViewComment = (entry: any) => {
    setSelectedEntry(entry);
    setViewCommentDialog(true);
  };

  const getDeadlineWarning = (dueDate?: string, status?: string) => {
    if (!dueDate || status === 'approved' || status === 'pending_supervisor' || status === 'pending_lecturer') {
      return null;
    }

    const deadline = new Date(dueDate);
    const now = new Date();
    const daysUntil = differenceInDays(deadline, now);

    if (daysUntil < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>Overdue by {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''}</span>
        </div>
      );
    } else if (daysUntil <= 2) {
      return (
        <div className="flex items-center gap-1 text-orange-600 text-xs">
          <Clock className="w-3 h-3" />
          <span>Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
        </div>
      );
    }

    return null;
  };

  const pdfFileName = `Logbook_${user?.name?.replace(/\s+/g, "_")}.pdf`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Logbook</h1>
        <div className="flex gap-2">
          <PDFDownloadLink
            document={
              <LogbookPDF
                studentName={user?.name || ""}
                regNumber={user?.reg_number || user?.email?.split("@")[0] || ""}
                faculty="Science"
                department="Computer Science"
                hostInstitution="Placement Company"
                supervisorName="Supervisor"
                entries={entries.map(e => ({
                  id: e.id,
                  studentId: e.student_id,
                  week: e.week,
                  weekEndingDate: e.week_ending_date || e.weekEndingDate || "",
                  objectives: e.objectives,
                  actualTasks: e.actual_tasks || e.actualTasks || "",
                  reflection: e.reflection,
                  status: e.status,
                  supervisorApproved: e.supervisor_approved,
                }))}
              />
            }
            fileName={pdfFileName}
          >
            {({ loading }) => (
              <Button variant="outline" size="sm" disabled={loading}>
                <FileDown className="w-4 h-4 mr-1" />{loading ? "Generating…" : "Export PDF"}
              </Button>
            )}
          </PDFDownloadLink>
          <Button onClick={() => setDialogOpen(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />New Entry
          </Button>
        </div>
      </div>

      {/* Header info matching UZ format */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div><span className="text-muted-foreground">Faculty:</span> <span className="font-medium">Science</span></div>
            <div><span className="text-muted-foreground">Department:</span> <span className="font-medium">Computer Science</span></div>
            <div><span className="text-muted-foreground">Student:</span> <span className="font-medium">{user?.name}</span></div>
            <div><span className="text-muted-foreground">Reg No:</span> <span className="font-medium font-mono">{user?.reg_number || user?.email?.split("@")[0]}</span></div>
            <div><span className="text-muted-foreground">Placement:</span> <span className="font-medium">{myPlacement.status}</span></div>
            <div><span className="text-muted-foreground">Entries:</span> <span className="font-medium">{entries.length}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Logbook table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">Week</TableHead>
                    <TableHead className="w-[110px]">Week Ending</TableHead>
                    <TableHead className="w-[110px]">Due Date</TableHead>
                    <TableHead>Objectives for the week / To-do list (As approved by supervisor)</TableHead>
                    <TableHead>Actual completed tasks / outcomes</TableHead>
                    <TableHead>Introspection and reflective comments</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const canSubmit = entry.status === 'draft' || entry.status === 'rejected';
                    const isOverdue = entry.due_date && new Date(entry.due_date) < new Date() && entry.status === 'draft';
                    const hasComment = entry.supervisor_comment;

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium text-center">{entry.week}</TableCell>
                        <TableCell className="text-sm">{format(parseISO(entry.week_ending_date || entry.weekEndingDate || new Date().toISOString()), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-sm">
                          {entry.due_date ? (
                            <div className="space-y-1">
                              <div className={isOverdue ? "text-red-600 font-medium" : ""}>
                                {format(parseISO(entry.due_date), "dd MMM yyyy")}
                              </div>
                              {getDeadlineWarning(entry.due_date, entry.status)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px]"><p className="line-clamp-3">{entry.objectives}</p></TableCell>
                        <TableCell className="text-sm max-w-[200px]"><p className="line-clamp-3">{entry.actual_tasks}</p></TableCell>
                        <TableCell className="text-sm max-w-[200px]"><p className="line-clamp-3">{entry.reflection}</p></TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className={`text-xs ${getStatusColor(entry.status)}`}>{entry.status}</Badge>
                            {hasComment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewComment(entry)}
                                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                View comment
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {canSubmit && (
                            <Button
                              size="sm"
                              onClick={() => handleSubmitForApproval(entry.id, entry.due_date)}
                              disabled={Boolean(submitEntry.isPending || isOverdue)}
                              className="w-full"
                            >
                              {submitEntry.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Submit"
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {entries.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No entries yet. Click "New Entry" to start.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <p className="text-xs text-muted-foreground italic">This document must be signed and stamped monthly, and maintained in both hardcopy and softcopy formats.</p>

      {/* New entry dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Logbook Entry — Week {entries.length + 1}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Week Ending Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !weekEndDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {weekEndDate ? format(weekEndDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={weekEndDate} onSelect={setWeekEndDate}  className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Objectives for the week / To-do list *</Label>
              <Textarea rows={3} value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder="What were your planned objectives (as approved by supervisor)?" />
            </div>
            <div>
              <Label>Actual completed tasks / outcomes *</Label>
              <Textarea rows={3} value={actualTasks} onChange={(e) => setActualTasks(e.target.value)} placeholder="What did you actually accomplish this week?" />
            </div>
            <div>
              <Label>Introspection and reflective comments *</Label>
              <Textarea rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Reflect on lessons learnt, variance between objectives and outcomes..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSubmit} 
                className="bg-primary text-primary-foreground"
                disabled={createEntry.isPending}
              >
                {createEntry.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Entry"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Comment Dialog */}
      <Dialog open={viewCommentDialog} onOpenChange={setViewCommentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supervisor Comment - Week {selectedEntry?.week}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-md">
                <Label className="text-muted-foreground flex items-center gap-1 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Comment
                </Label>
                <p className="text-sm whitespace-pre-wrap">{selectedEntry.supervisor_comment}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" className={getStatusColor(selectedEntry.status)}>
                    {selectedEntry.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setViewCommentDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
