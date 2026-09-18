"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, AlertTriangle, TrendingUp, Loader2, BookOpen, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePlacements, useSubmissions, useLogbookEntries } from "@/hooks/useApi";

export default function LecturerOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const lecturerId = user?.id || "";
  const { data: placements, isLoading: placementsLoading } = usePlacements();
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions();
  const { data: logbookEntries, isLoading: logbookLoading } = useLogbookEntries();

  if (placementsLoading || submissionsLoading || logbookLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const myPlacements = placements?.filter((p) => p.lecturer_id === lecturerId) || [];
  const totalStudents = myPlacements.length;
  const allStudentIds = myPlacements.map((p) => p.student_id);
  const pendingAssessments = submissions?.filter((s) => allStudentIds.includes(s.student_id) && s.status === "submitted").length || 0;
  const overdue = submissions?.filter((s) => allStudentIds.includes(s.student_id) && s.status === "pending" && (s.due_date ? new Date(s.due_date) < new Date() : false)).length || 0;
  const allSubs = submissions?.filter((s) => allStudentIds.includes(s.student_id)) || [];
  const complianceRate = Math.round((allSubs.filter((s) => ["submitted", "graded"].includes(s.status)).length / Math.max(allSubs.length, 1)) * 100);

  // Logbook statistics
  const myLogbookEntries = logbookEntries?.filter((e) => allStudentIds.includes(e.student_id)) || [];
  const pendingLecturerReview = myLogbookEntries.filter((e) => e.status === 'pending_lecturer').length;
  const overdueLogbooks = myLogbookEntries.filter((e) => 
    e.due_date && 
    new Date(e.due_date) < new Date() && 
    (e.status === 'draft' || e.status === 'rejected')
  ).length;

  const stats = [
    { label: "Students on Placement", value: totalStudents, icon: Users },
    { label: "Compliance Rate", value: `${complianceRate}%`, icon: TrendingUp },
    { label: "Pending Assessments", value: pendingAssessments, icon: FileText },
    { label: "Overdue Submissions", value: overdue, icon: AlertTriangle },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Lecturer Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of student placements and assessments</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-border/50 hover:border-[#ff8c00]/30 hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-6 pb-5 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff8c00]/10 to-[#ffa726]/10 border border-[#ff8c00]/20 mb-3">
                <s.icon className="w-6 h-6 text-[#ff8c00]" />
              </div>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-2">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logbook Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending Lecturer Review Widget */}
        {pendingLecturerReview > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <BookOpen className="w-5 h-5" />
                  Pending Logbook Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-bold text-blue-600">{pendingLecturerReview}</span> logbook {pendingLecturerReview === 1 ? 'entry' : 'entries'} awaiting your final approval.
                </p>
                <Button 
                  onClick={() => router.push('/lecturer/logbook')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Review Logbooks
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Overdue Logbooks Widget */}
        {overdueLogbooks > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Clock className="w-5 h-5" />
                  Overdue Logbook Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-bold text-red-600">{overdueLogbooks}</span> logbook {overdueLogbooks === 1 ? 'entry is' : 'entries are'} overdue and need attention.
                </p>
                <Button 
                  onClick={() => router.push('/lecturer/logbook')}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  View Overdue Entries
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
