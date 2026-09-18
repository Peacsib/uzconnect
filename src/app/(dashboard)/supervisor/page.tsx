"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, AlertTriangle, Loader2, BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePlacements, useSubmissions, useLogbookEntries } from "@/hooks/useApi";

export default function SupervisorOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const supervisorId = user?.id || "";
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

  const myStudents = placements?.filter((p) => p.supervisor_id === supervisorId) || [];
  const studentIds = myStudents.map((p) => p.student_id);
  const pendingSubs = submissions?.filter((s) => studentIds.includes(s.student_id) && s.status === "submitted") || [];
  const overdueSubs = submissions?.filter((s) => studentIds.includes(s.student_id) && s.status === "pending" && (s.due_date ? new Date(s.due_date) < new Date() : false)) || [];
  
  // Logbook statistics
  const myLogbookEntries = logbookEntries?.filter((e) => studentIds.includes(e.student_id)) || [];
  const pendingLogbooks = myLogbookEntries.filter((e) => e.status === 'submitted' || e.status === 'pending_supervisor').length;

  const stats = [
    { label: "Active Students", value: myStudents.length, icon: Users, color: "text-primary" },
    { label: "Pending Reviews", value: pendingSubs.length, icon: FileText, color: "text-accent" },
    { label: "Pending Logbooks", value: pendingLogbooks, icon: BookOpen, color: "text-blue-600" },
    { label: "Overdue", value: overdueSubs.length, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Supervisor Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor your students' progress</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-border/50 hover:border-[#ff8c00]/30 hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-6 pb-5 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff8c00]/10 to-[#ffa726]/10 border border-[#ff8c00]/20 mb-3">
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-2">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logbook Review Widget */}
      {pendingLogbooks > 0 && (
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
                You have <span className="font-bold text-blue-600">{pendingLogbooks}</span> logbook {pendingLogbooks === 1 ? 'entry' : 'entries'} waiting for your review.
              </p>
              <Button 
                onClick={() => router.push('/supervisor/logbook')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Review Logbooks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
