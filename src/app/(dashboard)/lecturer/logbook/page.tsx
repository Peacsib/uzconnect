"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Eye, Calendar, FileDown, Search, Loader2, MessageSquare, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { getStatusColor } from "@/utils/formatters";
import { usePlacements, useLogbookEntries, useUpdateLogbookDeadline, useStudents } from "@/hooks/useApi";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MarkedLogbookPDF from "@/components/pdf/MarkedLogbookPDF";

export default function LogbookOverview() {
  const { user } = useAuth();
  
  // Fetch data
  const { data: placements, isLoading: placementsLoading } = usePlacements();
  const { data: logbookEntries, isLoading: entriesLoading } = useLogbookEntries();
  const { data: studentsData, isLoading: studentsLoading } = useStudents();
  const updateDeadline = useUpdateLogbookDeadline();
  
  // State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = placementsLoading || entriesLoading || studentsLoading;

  // Filter placements assigned to current lecturer
  const myPlacements = placements?.filter((p) => p.lecturer_id === user?.id) || [];
  const studentIds = myPlacements.map((p) => p.student_id);
  
  // Get students
  const studentsArr = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.data || [];
  const students = studentsArr.filter((s: any) => studentIds.includes(s.id)) || [];
  
  // Filter logbook entries for assigned students
  const assignedEntries = logbookEntries?.filter((e) => studentIds.includes(e.student_id)) || [];
  
  // Calculate statistics per student
  const studentSummary = students.map((student: any) => {
    const entries = assignedEntries.filter((e) => e.student_id === student.id);
    const pendingLecturerCount = entries.filter((e) => e.status === 'pending_lecturer').length;
    const approvedCount = entries.filter((e) => e.status === 'approved').length;
    const overdueCount = entries.filter((e) => 
      e.due_date && 
      new Date(e.due_date) < new Date() && 
      (e.status === 'draft' || e.status === 'rejected')
    ).length;
    const totalCount = entries.length;
    
    return {
      ...student,
      pendingLecturerCount,
      approvedCount,
      overdueCount,
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
        <h1 className="text-2xl font-bold">Logbook Overview</h1>
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

  const handleExtensionClick = (entry: any) => {
    setSelectedEntry(entry);
    setNewDueDate(entry.due_date ? new Date(entry.due_date) : undefined);
    setExtensionDialogOpen(true);
  };

  const handleGrantExtension = async () => {
    if (!selectedEntry || !newDueDate) {
      toast.error("Please select a new due date");
      return;
    }
    
    try {
      await updateDeadline.mutateAsync({ 
        id: selectedEntry.id, 
        dueDate: format(newDueDate, "yyyy-MM-dd") 
      });
      setExtensionDialogOpen(false);
      setNewDueDate(undefined);
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
        <h1 className="text-2xl font-bold">Logbook Overview</h1>
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
                      <TableHead className="text-center">Overdue</TableHead>
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
                          {student.pendingLecturerCount > 0 ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {student.pendingLecturerCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.overdueCount > 0 ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              {student.overdueCount}
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
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
                <div><span className="text-muted-foreground">Student:</span> <span className="font-medium">{selectedStudent.user?.name}</span></div>
                <div><span className="text-muted-foreground">Reg No:</span> <span className="font-medium font-mono">{selectedStudent.user?.reg_number}</span></div>
                <div><span className="text-muted-foreground">Total:</span> <span className="font-medium">{selectedStudent.totalCount}</span></div>
                <div><span className="text-muted-foreground">Pending:</span> <span className="font-medium text-blue-600">{selectedStudent.pendingLecturerCount}</span></div>
                <div><span className="text-muted-foreground">Overdue:</span> <span className="font-medium text-red-600">{selectedStudent.overdueCount}</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Logbook Entries (Read-Only)</h2>
            {selectedStudent.entries.length > 0 && (
              <PDFDownloadLink
                document={
                  <MarkedLogbookPDF
                    studentName={selectedStudent.user?.name || ""}
                    regNumber={selectedStudent.user?.reg_number || ""}
                    faculty="Science"
                    department="Computer Science"
                    programme="BSc Computer Science"
                    hostInstitution="Placement Company"
                    supervisorName="Supervisor"
                    lecturerName={user?.name || "Lecturer"}
                    entries={selectedStudent.entries.map((e: any) => ({
                      week: e.week,
                      weekEndingDate: e.week_ending_date,
                      objectives: e.objectives,
                      actualTasks: e.actual_tasks,
                      reflection: e.reflection,
                      status: e.status,
                      supervisorComment: e.supervisor_comment,
                      supervisorApproved: e.supervisor_approved,
                      lecturerApproved: e.lecturer_approved,
                    }))}
                  />
                }
                fileName={`Marked_Logbook_${selectedStudent.user?.name?.replace(/\s+/g, "_")}.pdf`}
              >
                {({ loading }) => (
                  <Button variant="outline" size="sm" disabled={loading}>
                    <FileDown className="w-4 h-4 mr-1" />
                    {loading ? "Generating..." : "Export Marked PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Logbook Entries (Read-Only)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70px]">Week</TableHead>
                      <TableHead className="w-[110px]">Week Ending</TableHead>
                      <TableHead className="w-[110px]">Due Date</TableHead>
                      <TableHead>Objectives</TableHead>
                      <TableHead>Actual Tasks</TableHead>
                      <TableHead>Reflection</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[180px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStudent.entries.sort((a: any, b: any) => a.week - b.week).map((entry: any) => {
                      const isOverdue = entry.due_date && 
                        new Date(entry.due_date) < new Date() && 
                        (entry.status === 'draft' || entry.status === 'rejected');
                      
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium text-center">{entry.week}</TableCell>
                          <TableCell className="text-sm">{format(parseISO(entry.week_ending_date), "dd MMM yyyy")}</TableCell>
                          <TableCell className="text-sm">
                            {entry.due_date ? (
                              <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                                {format(parseISO(entry.due_date), "dd MMM yyyy")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
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
                              {entry.due_date && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleExtensionClick(entry)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Extend deadline"
                                >
                                  <Clock className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {selectedStudent.entries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Week Ending Date</Label>
                  <p className="font-medium">{format(parseISO(selectedEntry.week_ending_date), "PPP")}</p>
                </div>
                {selectedEntry.due_date && (
                  <div>
                    <Label className="text-muted-foreground">Due Date</Label>
                    <p className="font-medium">{format(parseISO(selectedEntry.due_date), "PPP")}</p>
                  </div>
                )}
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

      {/* Extension Dialog */}
      <Dialog open={extensionDialogOpen} onOpenChange={setExtensionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Extend Deadline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Extend the deadline for Week {selectedEntry?.week} logbook entry.
            </p>
            {selectedEntry?.due_date && (
              <div className="bg-muted/50 p-3 rounded-md">
                <Label className="text-muted-foreground">Current Due Date</Label>
                <p className="font-medium">{format(parseISO(selectedEntry.due_date), "PPP")}</p>
              </div>
            )}
            <div>
              <Label>New Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !newDueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newDueDate ? format(newDueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent 
                    mode="single" 
                    selected={newDueDate} 
                    onSelect={setNewDueDate}
                    disabled={(date) => date < new Date()}
                     
                    className="p-3 pointer-events-auto" 
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtensionDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleGrantExtension}
              disabled={updateDeadline.isPending || !newDueDate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateDeadline.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extending...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Grant Extension
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
