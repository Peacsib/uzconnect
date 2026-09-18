"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { CalendarDays, FileText, TrendingUp, Clock, Loader2, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePlacements, useSubmissions, useAssessments, useLogbookEntries } from "@/hooks/useApi";
import { differenceInDays, parseISO } from "date-fns";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function StudentOverview() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Fetch data from API
  const { data: placements, isLoading: placementsLoading } = usePlacements();
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions();
  const { data: assessments, isLoading: assessmentsLoading } = useAssessments();
  const { data: logbookEntries, isLoading: logbookLoading } = useLogbookEntries();

  const isLoading = placementsLoading || submissionsLoading || assessmentsLoading || logbookLoading;

  // Filter data for current student
  const studentId = user?.id || "";
  const mySubs = submissions?.filter((s) => s.student_id === studentId) || [];
  const myPlacement = placements?.find((p) => p.student_id === studentId);
  const myAssessments = assessments?.filter((a) => a.student_id === studentId) || [];
  const myLogbook = logbookEntries?.filter((e) => e.student_id === studentId) || [];
  
  // Calculate stats
  const pending = mySubs.filter((s) => s.status === "pending").length;
  const avgScore = myAssessments.length > 0
    ? Math.round(myAssessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / myAssessments.length)
    : 0;
  const nextDeadline = mySubs
    .filter((s) => s.status === "pending")
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))[0];

  // Logbook statistics
  const upcomingLogbookDeadlines = myLogbook.filter((e) => 
    e.due_date && 
    new Date(e.due_date) >= new Date() &&
    new Date(e.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    (e.status === 'draft' || e.status === 'rejected')
  ).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  const stats = [
    { 
      label: "Next Deadline", 
      value: nextDeadline ? formatDate(nextDeadline.due_date || "") : "None", 
      icon: CalendarDays, 
      sub: nextDeadline?.title || "No pending submissions"
    },
    { label: "Pending", value: pending, icon: FileText, sub: "submissions" },
    { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, sub: "assessments" },
    { 
      label: "Placement", 
      value: myPlacement?.status || "N/A", 
      icon: Clock, 
      sub: myPlacement ? "Active placement" : "No placement"
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your placement overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} variants={item}>
            <Card className="border-border/50 hover:border-[#ff8c00]/30 hover:shadow-lg transition-all duration-200">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{s.value}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1 truncate">{s.sub}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff8c00]/10 to-[#ffa726]/10 flex items-center justify-center border border-[#ff8c00]/20 shrink-0">
                    <s.icon className="w-5 h-5 text-[#ff8c00]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Logbook Deadlines Widget */}
      {upcomingLogbookDeadlines.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                Upcoming Logbook Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {upcomingLogbookDeadlines.slice(0, 3).map((entry) => {
                  const daysUntil = differenceInDays(parseISO(entry.due_date!), new Date());
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium">Week {entry.week_number}</p>
                          <p className="text-xs text-muted-foreground">
                            Due {formatDate(entry.due_date!)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={daysUntil <= 1 ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                        {daysUntil === 0 ? "Due today" : daysUntil === 1 ? "Due tomorrow" : `${daysUntil} days`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <Button 
                onClick={() => router.push('/student/logbook')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                View Logbook
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {myPlacement && (
          <motion.div variants={item}>
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="border-b">
                <CardTitle className="text-base font-bold">My Placement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Status</span>
                  <Badge variant="outline" className={`${getStatusColor(myPlacement.status)} font-semibold`}>
                    {myPlacement.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Duration</span>
                  <span className="font-semibold text-foreground text-xs">
                    {formatDate(myPlacement.start_date || "")} – {formatDate(myPlacement.end_date || "")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Started</span>
                  <span className="text-xs text-muted-foreground">{formatDate(myPlacement.created_at || myPlacement.start_date || "")}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={item}>
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="border-b">
              <CardTitle className="text-base font-bold">Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {mySubs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No submissions yet</p>
              ) : (
                <div className="space-y-4">
                  {mySubs.slice(0, 4).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-sm pb-3 border-b last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{sub.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Due {formatDate(sub.due_date || "")}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs font-semibold ${getStatusColor(sub.status)} ml-3`}>
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
