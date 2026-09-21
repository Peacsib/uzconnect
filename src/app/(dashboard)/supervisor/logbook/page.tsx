"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Eye, CheckCircle, XCircle, FileDown, Search, Loader2, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { getStatusColor } from "@/utils/formatters";
import { usePlacements, useLogbookEntries, useApproveLogbookEntry, useRejectLogbookEntry, useStudents } from "@/hooks/useApi";
import { toast } from "sonner";
import LogbookDownloadButton from "@/components/pdf/LogbookDownloadButton";

export default function LogbookReview() {
  const { user } = useAuth();
  
  // Fetch data
  const { data: placements, isLoading: placementsLoading } = usePlacements();
  const { data: logbookEntries, isLoading: entriesLoading } = useLogbookEntries();
  const { data: studentsData, isLoading: studentsLoading } = useStudents();
  const approveEntry = useApproveLogbookEntry();
  const rejectEntry = useRejectLogbookEntry();
  
  // State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = placementsLoading || entriesLoading || studentsLoading;

  // Filter placements supervised by current user
  const myPlacements = placements?.filter((p) => p.supervisor_id === user?.id) || [];
  const studentIds = myPlacements.map((p) => p.student_id);
  
  // Get students with pending logbook counts
  const studentsArr = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.data || [];
  const students = studentsArr.filter((s: any) => studentIds.includes(s.id)) || [];
  
  // Filter logbook entries for supervised students
  const supervisedEntries = logbookEntries?.filter((e) => studentIds.includes(e.student_id)) || [];
  
  // Calculate pending counts per student
  const studentSummary = students.map((student: any) => {
    const entries = supervisedEntries.filter((e) => e.student_id === student.id);
    const pendingCount = entries.filter((e) => 
      e.status === 'submitted' || e.status === 'pending_supervisor'
    ).length;
    const approvedCount = entries.filter((e) => e.supervisor_approved).length;
    const totalCount = entries.length;
    
    return {
      ...student,
      pendingCount,
      approvedCount,
      totalCount,
      entries,
    };
  }).filter((s: any) => 
    searchQuery === "" || 
    s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user?.reg_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  if (myPlacements.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Logbook Review</h1>
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-lg font-medium">No students assigned</p>
            <p className="text-sm text-muted-foreground">You don't have any students assigned to you yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    setSelectedEntry(null);
  };

  const handleViewEntry = (entry: any) => {
    setSelectedEntry(entry);
    setViewDialogOpen(true);
  };

  const handleApproveClick = (entry: any) => {
    setSelectedEntry(entry);
    setComment("");
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (entry: any) => {
    setSelectedEntry(entry);
    setComment("");
    setRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedEntry) return;
    
    try {
      await approveEntry.mutateAsync({ id: selectedEntry.id, comment: comment.trim() || undefined });
      setApproveDialogOpen(false);
      setComment("");
      setSelectedEntry(null);
      if (selectedStudent) {
        // Refresh student data
        const updatedStudent = studentSummary.find((s: any) => s.id === selectedStudent.id);
        if (updatedStudent) setSelectedStudent(updatedStudent);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = async () => {
    if (!selectedEntry) return;
    
    if (!comment.trim()) {
      toast.error("Comment is required when rejecting an entry");
      return;
    }
    
    try {
      await rejectEntry.mutateAsync({ id: selectedEntry.id, comment: comment.trim() });
      setRejectDialogOpen(false);
      setComment("");
      setSelectedEntry(null);
      if (selectedStudent) {
        // Refresh student data
        const updatedStudent = studentSummary.find((s: any) => s.id === selectedStudent.id);
        if (updatedStudent) setSelectedStudent(updatedStudent);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Logbook Review</h1>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      {/* Students List */}
      {!selectedStudent && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>My Students ({studentSummary.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Reg Number</TableHead>
                      <TableHead className="text-center">Total Entries</TableHead>
                      <TableHead className="text-center">Pending Review</TableHead>
                      <TableHead className="text-center">Approved</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentSummary.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.user?.name || "N/A"}</TableCell>
                        <TableCell className="font-mono text-sm">{student.user?.reg_number || "N/A"}</TableCell>
                        <TableCell className="text-center">{student.totalCount}</TableCell>
                        <TableCell className="text-center">
                          {student.pendingCount > 0 ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              {student.pendingCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 font-medium">{student.approvedCount}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(student)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Logbook
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {studentSummary.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student Logbook Details */}
      {selectedStudent && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4">
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
              ← Back to Students
            </Button>
          </div>

          <Card className="mb-4">
            <CardContent className="pt-4 pb-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div><span className="text-muted-foreground">Student:</span> <span className="font-medium">{selectedStudent.user?.name}</span></div>
                <div><span className="text-muted-foreground">Reg No:</span> <span className="font-medium font-mono">{selectedStudent.user?.reg_number}</span></div>
                <div><span className="text-muted-foreground">Total Entries:</span> <span className="font-medium">{selectedStudent.totalCount}</span></div>
                <div><span className="text-muted-foreground">Pending:</span> <span className="font-medium text-yellow-600">{selectedStudent.pendingCount}</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Logbook Entries</h2>
            {selectedStudent.entries.length > 0 && (
              <LogbookDownloadButton
                studentName={selectedStudent.user?.name || ""}
                regNumber={selectedStudent.user?.reg_number || ""}
                faculty="Faculty of Science and Technology"
                department="Department of Computer Science"
                programme="BSc Computer Science Honours"
                hostInstitution={
                  myPlacements.find((p) => p.student_id === selectedStudent.id)?.company_name ||
                  (user as any)?.company_name ||
                  "Host Organization"
                }
                supervisorName={user?.name || "Workplace Supervisor"}
                lecturerName="Academic Supervisor"
                entries={selectedStudent.entries.map((e: any) => ({
                  week: e.week,
                  weekEndingDate: e.week_ending_date || e.weekEndingDate || "",
                  objectives: e.objectives || "",
                  actualTasks: e.actual_tasks || e.actualTasks || "",
                  reflection: e.reflection || "",
                  status: e.status || "draft",
                  supervisorComment: e.supervisor_comment || e.supervisorComment,
                  supervisorApproved: e.supervisor_approved ?? e.supervisorApproved,
                  lecturerApproved: e.lecturer_approved ?? e.lecturerApproved,
                }))}
                buttonText="Export Marked PDF"
                size="sm"
              />
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Logbook Entries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70px]">Week</TableHead>
                      <TableHead className="w-[110px]">Week Ending</TableHead>
                      <TableHead>Objectives</TableHead>
                      <TableHead>Actual Tasks</TableHead>
                      <TableHead>Reflection</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[200px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStudent.entries.sort((a: any, b: any) => a.week - b.week).map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium text-center">{entry.week}</TableCell>
                        <TableCell className="text-sm">{format(parseISO(entry.week_ending_date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-sm max-w-[200px]"><p className="line-clamp-2">{entry.objectives}</p></TableCell>
                        <TableCell className="text-sm max-w-[200px]"><p className="line-clamp-2">{entry.actual_tasks}</p></TableCell>
                        <TableCell className="text-sm max-w-[200px]"><p className="line-clamp-2">{entry.reflection}</p></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEntry(entry)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(entry.status === 'submitted' || entry.status === 'pending_supervisor') && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproveClick(entry)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRejectClick(entry)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedStudent.entries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No entries yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* View Entry Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Logbook Entry - Week {selectedEntry?.week}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Week Ending Date</Label>
                <p className="font-medium">{format(parseISO(selectedEntry.week_ending_date), "PPP")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Objectives for the week / To-do list</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedEntry.objectives}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Actual completed tasks / outcomes</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedEntry.actual_tasks}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Introspection and reflective comments</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedEntry.reflection}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" className={getStatusColor(selectedEntry.status)}>
                    {selectedEntry.status}
                  </Badge>
                </div>
              </div>
              {selectedEntry.supervisor_comment && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Supervisor Comment
                  </Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedEntry.supervisor_comment}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Logbook Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to approve Week {selectedEntry?.week} logbook entry.
            </p>
            <div>
              <Label>Comment (Optional)</Label>
              <Textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment for the student (optional)..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleApprove}
              disabled={approveEntry.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approveEntry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Logbook Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to reject Week {selectedEntry?.week} logbook entry.
            </p>
            <div>
              <Label>Comment (Required) *</Label>
              <Textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain why this entry is being rejected..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                A comment is required when rejecting an entry.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleReject}
              disabled={rejectEntry.isPending || !comment.trim()}
              variant="destructive"
            >
              {rejectEntry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
