"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusColor } from "@/utils/formatters";
import {
  CalendarDays,
  FileText,
  Clock,
  Loader2,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Building2,
  GraduationCap,
  Sparkles,
  Send,
  MessageSquare,
  Award,
  ChevronRight,
  HelpCircle,
  Mail,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePlacements, useSubmissions, useAssessments, useLogbookEntries, usePlacementSubmissions } from "@/hooks/useApi";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { differenceInDays, parseISO } from "date-fns";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function StudentOverview() {
  const { user } = useAuth();
  const router = useRouter();

  // Fetch live student profile from database
  const { profile, isLoading: profileLoading } = useStudentProfile();

  // Fetch mock/api operational data
  const { data: placements, isLoading: placementsLoading } = usePlacements();
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions();
  const { data: assessments, isLoading: assessmentsLoading } = useAssessments();
  const { data: logbookEntries, isLoading: logbookLoading } = useLogbookEntries();
  const { data: placementSubs } = usePlacementSubmissions();

  const isLoading = profileLoading || placementsLoading || submissionsLoading || assessmentsLoading || logbookLoading;

  // Filter data for current student
  const studentId = user?.id || profile?.userId || "";
  const mySubs = submissions?.filter((s) => s.student_id === studentId || s.studentId === studentId) || [];
  const myPlacement = placements?.find((p) => p.student_id === studentId || p.studentId === studentId) || profile?.activePlacement;
  const myAssessments = assessments?.filter((a) => a.student_id === studentId || a.studentId === studentId) || [];
  const myLogbook = logbookEntries?.filter((e) => e.student_id === studentId || e.studentId === studentId) || [];
  const myPlacementSubmission = placementSubs?.find((ps) => ps.student_id === studentId || ps.student_id === user?.id) || profile?.latestSubmission;

  // Derive registration and academic info
  const regNumber = profile?.regNumber || user?.regNumber || (user?.email?.includes("@") ? user.email.split("@")[0].toUpperCase() : "R2421428");
  const programmeName = profile?.programme?.name || "BSc Honours Business Management Systems Design and Applications";
  const programmeCode = profile?.programme?.code || "HBMSDA";
  const facultyName = profile?.programme?.faculty || "Faculty of Business Management Sciences and Economics";
  const departmentName = profile?.programme?.department || "Business Studies";
  const studentName = profile?.name || user?.name || "Peace Sibanda";
  const firstName = studentName.split(" ")[0];

  // Calculate statistics
  const pendingSubs = mySubs.filter((s) => s.status === "pending").length;
  const avgScore =
    myAssessments.length > 0
      ? Math.round(myAssessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / myAssessments.length)
      : 0;

  // Next deadline
  const nextDeadline = mySubs
    .filter((s) => s.status === "pending")
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))[0];

  // Logbook upcoming deadlines
  const upcomingLogbookDeadlines = myLogbook
    .filter(
      (e) =>
        e.due_date &&
        new Date(e.due_date) >= new Date() &&
        new Date(e.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
        (e.status === "draft" || e.status === "rejected")
    )
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  // Determine WRL Lifecycle Stage (1 to 4)
  let wrlStage = 1;
  let stageLabel = "Placement Registration";
  if (myPlacement && (myPlacement.status === "ACTIVE" || myPlacement.status === "active")) {
    wrlStage = 3;
    stageLabel = "Active Attachment";
  } else if (myPlacementSubmission) {
    wrlStage = 2;
    stageLabel = "Pending Approval";
  }

  const wrlSteps = [
    { number: 1, title: "Placement Offer", desc: "Submit company details", isDone: wrlStage > 1, isCurrent: wrlStage === 1 },
    { number: 2, title: "Faculty Approval", desc: "Coordinator review", isDone: wrlStage > 2, isCurrent: wrlStage === 2 },
    { number: 3, title: "Industrial Attachment", desc: "30-Week Logbooks", isDone: wrlStage > 3, isCurrent: wrlStage === 3 },
    { number: 4, title: "Assessment & Grading", desc: "Reports & Evaluation", isDone: false, isCurrent: wrlStage === 4 },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          Loading student academic portal...
        </p>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Academic Identity & Header Ribbon */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#003366] text-white tracking-wide shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STUDENT PORTAL
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {regNumber}
            </span>
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              • 2026/2027 Academic Year
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Welcome back, {firstName} <span className="inline-block">👋</span>
          </h1>

          <div className="text-xs lg:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-foreground/90">{programmeName}</span>
            <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-muted font-bold text-[#003366] dark:text-[#ffa726]">
              [{programmeCode}]
            </span>
            <span className="text-muted-foreground/60 hidden sm:inline">•</span>
            <span className="hidden sm:inline">{departmentName}</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => router.push("/student/submit-placement")}
            className="h-10 px-4 bg-gradient-to-r from-[#ff8c00] to-[#ffa726] hover:from-[#e67e00] hover:to-[#ff8c00] text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Placement
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/student/logbook")}
            className="h-10 px-3.5 text-xs rounded-xl border-border/80 hover:bg-accent/10 font-medium cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            Digital Logbook
          </Button>
        </div>
      </motion.div>

      {/* 2. WRL Attachment Lifecycle Stepper */}
      <motion.div variants={item}>
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#ff8c00]" />
                WRL Attachment Progress Roadmap
              </span>
              <Badge variant="outline" className="text-[11px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5">
                Stage {wrlStage} of 4: {stageLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 lg:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {wrlSteps.map((step) => {
                return (
                  <div
                    key={step.number}
                    className={`p-3.5 rounded-xl border transition-all ${
                      step.isCurrent
                        ? "bg-gradient-to-br from-[#003366]/10 to-amber-500/5 border-[#003366] dark:border-[#ff8c00] shadow-xs"
                        : step.isDone
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-muted/10 border-border/40 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                          step.isCurrent
                            ? "bg-[#003366] text-white dark:bg-[#ff8c00] dark:text-gray-900"
                            : step.isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.isDone ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                      </span>
                      {step.isCurrent && (
                        <span className="text-[10px] font-bold text-[#003366] dark:text-[#ff8c00] uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-foreground">{step.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3. High-Impact Status / Onboarding Hero Banner */}
      {!myPlacement ? (
        myPlacementSubmission ? (
          /* Placement Submitted - Under Review Banner */
          <motion.div variants={item}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#002147] via-[#003366] to-[#001a33] text-white p-6 shadow-xl border border-white/10">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                    Verification in Progress
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                    Placement Submitted for Coordinator Review
                  </h2>
                  <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                    Your attachment details for <strong>{myPlacementSubmission.company_name || myPlacementSubmission.companyName}</strong> have been submitted to Department Coordinator <strong>Jameson Sibanda</strong>. You will receive an alert once verified.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={() => router.push("/student/placement")}
                    className="h-11 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs rounded-xl transition-all"
                  >
                    View Submission Details
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Action Required: Submit Placement Offer Banner */
          <motion.div variants={item}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#002147] via-[#003366] to-[#001a33] text-white p-6 shadow-xl border border-white/15">
              <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-gradient-to-br from-[#ff8c00]/25 to-transparent blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff8c00]/20 border border-[#ff8c00]/30 text-[#ffa726] text-xs font-bold uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    Step 1: Industrial Attachment Registration
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                    Activate Your Work Related Learning (WRL)
                  </h2>
                  <p className="text-xs md:text-sm text-white/85 leading-relaxed">
                    Welcome to the University of Zimbabwe Industrial Attachment portal. To start your digital logbook, receive mentor approvals, and schedule academic visits, please submit your company offer and industry supervisor details.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Button
                    onClick={() => router.push("/student/submit-placement")}
                    className="h-11 px-5 bg-gradient-to-r from-[#ff8c00] to-[#ffa726] hover:from-[#e67e00] hover:to-[#ff8c00] text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Submit Placement Offer
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/student/deadlines")}
                    className="h-11 px-4 bg-white/10 hover:bg-white/15 text-white border-white/20 text-xs rounded-xl font-medium cursor-pointer"
                  >
                    View Guidelines & Dates
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )
      ) : null}

      {/* 4. Stat / KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Placement Status */}
        <motion.div variants={item}>
          <Card className="border-border/60 hover:border-[#ff8c00]/40 hover:shadow-md transition-all duration-200">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Placement</p>
                  <p className="text-xl font-bold text-foreground mt-1.5 truncate">
                    {myPlacement ? "Active Attachment" : myPlacementSubmission ? "Under Review" : "Placement Needed"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        myPlacement ? "bg-emerald-500" : myPlacementSubmission ? "bg-blue-500 animate-pulse" : "bg-amber-500 animate-pulse"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {myPlacement ? (myPlacement.company_name || "Assigned") : myPlacementSubmission ? "Coordinator review" : "Action required"}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Briefcase className="w-5 h-5 text-[#ff8c00]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Digital Logbook */}
        <motion.div variants={item}>
          <Card className="border-border/60 hover:border-[#ff8c00]/40 hover:shadow-md transition-all duration-200">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Logbook</p>
                  <p className="text-xl font-bold text-foreground mt-1.5">
                    {myLogbook.length} / 30 <span className="text-xs font-normal text-muted-foreground">Weeks</span>
                  </p>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className="bg-gradient-to-r from-[#003366] to-[#ff8c00] h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((myLogbook.length / 30) * 100))}%` }}
                    />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Pending Submissions */}
        <motion.div variants={item}>
          <Card className="border-border/60 hover:border-[#ff8c00]/40 hover:shadow-md transition-all duration-200">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Submissions</p>
                  <p className="text-xl font-bold text-foreground mt-1.5">{pendingSubs}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mySubs.length === 0 ? "No reports pending" : `${mySubs.length} total assigned`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Average Score */}
        <motion.div variants={item}>
          <Card className="border-border/60 hover:border-[#ff8c00]/40 hover:shadow-md transition-all duration-200">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Assessment</p>
                  <p className="text-xl font-bold text-foreground mt-1.5">
                    {avgScore > 0 ? `${avgScore}%` : "Pending"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {myAssessments.length > 0 ? `${myAssessments.length} assessment${myAssessments.length > 1 ? "s" : ""}` : "Final WRL grade"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 5. Quick Actions Bar */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => router.push("/student/submit-placement")}
            className="p-3.5 rounded-xl border border-border/70 hover:border-[#ff8c00]/50 bg-card hover:bg-muted/30 transition-all text-left group shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ff8c00]/10 flex items-center justify-center text-[#ff8c00] mb-2 group-hover:scale-105 transition-transform">
              <Send className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-foreground">Submit Placement</p>
            <p className="text-[11px] text-muted-foreground">Register employer offer</p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/student/logbook")}
            className="p-3.5 rounded-xl border border-border/70 hover:border-blue-500/50 bg-card hover:bg-muted/30 transition-all text-left group shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-foreground">Weekly Logbook</p>
            <p className="text-[11px] text-muted-foreground">Log tasks & reflections</p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/student/deadlines")}
            className="p-3.5 rounded-xl border border-border/70 hover:border-purple-500/50 bg-card hover:bg-muted/30 transition-all text-left group shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-foreground">Key Deadlines</p>
            <p className="text-[11px] text-muted-foreground">View academic calendar</p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/student/messages")}
            className="p-3.5 rounded-xl border border-border/70 hover:border-emerald-500/50 bg-card hover:bg-muted/30 transition-all text-left group shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-foreground">Advisor Messages</p>
            <p className="text-[11px] text-muted-foreground">Contact coordinator</p>
          </button>
        </div>
      </motion.div>

      {/* 6. Dual-Column Content Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Submissions & Milestones */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="border-b border-border/40 pb-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Recent Submissions & Milestones</CardTitle>
                  <CardDescription className="text-xs">
                    Academic reports, logbooks, and attachment deliverables
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/student/submissions")}
                  className="text-xs text-[#ff8c00] hover:text-[#e67e00] hover:bg-[#ff8c00]/10"
                >
                  View All
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {mySubs.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No reports due yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
                    Once your placement is active, you will receive scheduled deliverables such as your <strong>Monthly Progress Reports</strong> and <strong>Final WRL Dissertation</strong>.
                  </p>
                  <Button
                    onClick={() => router.push("/student/submit-placement")}
                    variant="outline"
                    className="mt-4 text-xs h-9 rounded-xl border-border/80"
                  >
                    <Briefcase className="w-3.5 h-3.5 mr-1.5 text-[#ff8c00]" />
                    Check Placement Status
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {mySubs.slice(0, 4).map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-xs font-bold text-foreground truncate">{sub.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Due {formatDate(sub.due_date || "")}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-xs font-semibold shrink-0 ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right 1 Column: Guidelines & Coordinator Support */}
        <motion.div variants={item} className="space-y-6">
          {/* Departmental Coordinator Support Card */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#ff8c00]" />
                Department Coordinator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  JS
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground">Jameson Sibanda</p>
                  <p className="text-[11px] text-muted-foreground truncate">WRL Coordinator • Business Studies</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">peacesibx@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">UZ Main Campus, Commerce Block</span>
                </div>
              </div>

              <Button
                onClick={() => router.push("/student/messages")}
                className="w-full h-9 text-xs bg-[#003366] hover:bg-[#002244] text-white rounded-xl shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Send Coordinator Message
              </Button>
            </CardContent>
          </Card>

          {/* Quick Attachment Checklist */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Attachment Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-[11px]">
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${myPlacementSubmission ? "text-emerald-500" : "text-muted-foreground/50"}`} />
                <div>
                  <p className="font-semibold text-foreground">Submit Company Placement</p>
                  <p className="text-muted-foreground">Provide employer offer letter</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px]">
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${myPlacement ? "text-emerald-500" : "text-muted-foreground/50"}`} />
                <div>
                  <p className="font-semibold text-foreground">Coordinator Verification</p>
                  <p className="text-muted-foreground">Approved by department</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Weekly Logbook Sign-off</p>
                  <p className="text-muted-foreground">Signed weekly by supervisor</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Mid-Term Academic Visit</p>
                  <p className="text-muted-foreground">Evaluation by lecturer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
