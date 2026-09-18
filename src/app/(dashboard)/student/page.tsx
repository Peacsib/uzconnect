"use client";

import { useState } from "react";
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
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Building2,
  GraduationCap,
  Send,
  MessageSquare,
  Award,
  ChevronRight,
  Mail,
  ShieldCheck,
  AlertCircle,
  FileDown,
  Info,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePlacements, useSubmissions, useAssessments, useLogbookEntries, usePlacementSubmissions } from "@/hooks/useApi";
import { useStudentProfile } from "@/hooks/useStudentProfile";

export default function StudentOverview() {
  const { user } = useAuth();
  const router = useRouter();

  // Live profile from API / DB
  const { profile, isLoading: profileLoading } = useStudentProfile();

  // Operational state
  const { data: placements, isLoading: placementsLoading } = usePlacements();
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions();
  const { data: assessments, isLoading: assessmentsLoading } = useAssessments();
  const { data: logbookEntries, isLoading: logbookLoading } = useLogbookEntries();
  const { data: placementSubs } = usePlacementSubmissions();

  const [deliverablesTab, setDeliverablesTab] = useState<"all" | "upcoming" | "completed">("all");

  const isLoading = profileLoading || placementsLoading || submissionsLoading || assessmentsLoading || logbookLoading;

  // Filter data for current student
  const studentId = user?.id || profile?.userId || "";
  const mySubs = submissions?.filter((s) => s.student_id === studentId || s.studentId === studentId) || [];
  const myPlacement = placements?.find((p) => p.student_id === studentId || p.studentId === studentId) || profile?.activePlacement;
  const myAssessments = assessments?.filter((a) => a.student_id === studentId || a.studentId === studentId) || [];
  const avgScore = myAssessments.length > 0 ? Math.round(myAssessments.reduce((sum: number, a: any) => sum + (a.overall_score || a.overallScore || 0), 0) / myAssessments.length) : 0;
  const myLogbook = logbookEntries?.filter((e) => e.student_id === studentId || e.studentId === studentId) || [];
  const myPlacementSubmission = placementSubs?.find((ps) => ps.student_id === studentId || ps.student_id === user?.id) || profile?.latestSubmission;

  // Academic identity
  const regNumber = profile?.regNumber || user?.regNumber || (user?.email?.includes("@") ? user.email.split("@")[0].toUpperCase() : "R2421428");
  const studentName = profile?.name || user?.name || "Peace Sibanda";
  const programmeName = profile?.programme?.name || "BSc Honours Business Management Systems Design and Applications";
  const programmeCode = profile?.programme?.code || "HBMSDA";
  const facultyName = profile?.programme?.faculty || "Faculty of Business Management Sciences and Economics";
  const departmentName = profile?.programme?.department || "Department of Business Studies";

  // Attachment Lifecycle Stage (1 to 4)
  let currentStage = 1;
  let stageLabel = "Placement Registration Required";
  let statusBadgeVariant = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";

  if (myPlacement && (myPlacement.status === "ACTIVE" || myPlacement.status === "active")) {
    currentStage = 3;
    stageLabel = "Active Attachment";
    statusBadgeVariant = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
  } else if (myPlacementSubmission) {
    currentStage = 2;
    stageLabel = "Pending Coordinator Review";
    statusBadgeVariant = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
  }

  const lifecycleStages = [
    { id: 1, label: "Placement Offer", desc: "Company registration", status: currentStage > 1 ? "completed" : currentStage === 1 ? "current" : "upcoming" },
    { id: 2, label: "Faculty Verification", desc: "Coordinator approval", status: currentStage > 2 ? "completed" : currentStage === 2 ? "current" : "upcoming" },
    { id: 3, label: "Industrial Attachment", desc: "30-week active training", status: currentStage > 3 ? "completed" : currentStage === 3 ? "current" : "upcoming" },
    { id: 4, label: "Academic Assessment", desc: "Faculty visits & grading", status: currentStage === 4 ? "current" : "upcoming" },
  ];

  // Standard curriculum deliverables
  const standardDeliverables = [
    {
      id: "del_1",
      title: "Employer Placement Confirmation Letter",
      type: "Administrative Document",
      dueDate: "30 September 2026",
      status: myPlacementSubmission ? "Submitted" : "Pending",
      statusColor: myPlacementSubmission ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20",
      action: () => router.push("/student/submit-placement"),
      actionLabel: myPlacementSubmission ? "View Details" : "Submit",
    },
    {
      id: "del_2",
      title: "First Month Induction & Workplace Progress Report",
      type: "Academic Report",
      dueDate: "31 October 2026",
      status: "Upcoming",
      statusColor: "bg-muted text-muted-foreground border-border",
      action: () => router.push("/student/submissions"),
      actionLabel: "View Requirement",
    },
    {
      id: "del_3",
      title: "Mid-Term Industrial Assessment & Visiting Lecturer Evaluation",
      type: "Faculty Assessment",
      dueDate: "15 January 2027",
      status: "Upcoming",
      statusColor: "bg-muted text-muted-foreground border-border",
      action: () => router.push("/student/feedback"),
      actionLabel: "Rubric",
    },
    {
      id: "del_4",
      title: "Final 30-Week Logbook Dossier & Internship Dissertation",
      type: "Final Dissertation",
      dueDate: "30 April 2027",
      status: "Upcoming",
      statusColor: "bg-muted text-muted-foreground border-border",
      action: () => router.push("/student/submissions"),
      actionLabel: "Guidelines",
    },
  ];

  const filteredDeliverables = standardDeliverables.filter((d) => {
    if (deliverablesTab === "upcoming") return d.status === "Upcoming" || d.status === "Pending";
    if (deliverablesTab === "completed") return d.status === "Submitted" || d.status === "Completed";
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#003366] dark:text-[#ffa726]" />
        <p className="text-xs text-muted-foreground font-medium">Loading academic records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Institutional Context & Header */}
      <div className="border-b border-border/60 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Work Related Learning</span>
            <span>/</span>
            <span className="text-foreground">Student Portal</span>
            <span>/</span>
            <span className="font-mono text-[#003366] dark:text-[#ffa726] font-bold">{regNumber}</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            {studentName}
          </h1>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{programmeName}</span>
            <span className="font-mono px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold text-[11px]">
              {programmeCode}
            </span>
            <span className="text-border">•</span>
            <span>{departmentName}</span>
            <span className="text-border">•</span>
            <span>Academic Session 2026/2027</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => router.push("/student/submit-placement")}
            className="h-9 px-4 bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Submit Placement Offer
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/student/logbook")}
            className="h-9 px-3.5 text-xs rounded-lg border-border font-medium cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            Digital Logbook
          </Button>
        </div>
      </div>

      {/* 2. Integrated Attachment Lifecycle & Action Module */}
      <Card className="border-border/70 shadow-xs overflow-hidden">
        <div className="p-5 lg:p-6 space-y-5">
          {/* Header Row: Current Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Attachment Progress Status
              </p>
              <p className="text-base font-bold text-foreground mt-0.5">
                Stage {currentStage} of 4: {stageLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusBadgeVariant}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {currentStage === 1 ? "Action Required" : currentStage === 2 ? "In Review" : "Active"}
              </span>
            </div>
          </div>

          {/* Clean Stepper Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {lifecycleStages.map((stage) => {
              const isCurrent = stage.status === "current";
              const isDone = stage.status === "completed";

              return (
                <div
                  key={stage.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isCurrent
                      ? "bg-primary/5 border-primary/40 shadow-2xs"
                      : isDone
                      ? "bg-muted/30 border-border/60"
                      : "bg-card border-border/40 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-muted-foreground">
                      0{stage.id}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <p className={`text-xs font-semibold ${isCurrent ? "text-primary font-bold" : "text-foreground"}`}>
                    {stage.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stage.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Contextual Action Notification Banner */}
          {!myPlacement && (
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-foreground">
                    {myPlacementSubmission
                      ? "Placement details submitted for verification"
                      : "Registration of host employer required"}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {myPlacementSubmission
                      ? `Your placement with ${myPlacementSubmission.company_name || myPlacementSubmission.companyName} is under review by Coordinator Jameson Sibanda.`
                      : "Submit your official placement offer and assigned industry supervisor to activate your 30-week digital logbook."}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => router.push(myPlacementSubmission ? "/student/placement" : "/student/submit-placement")}
                className="h-8 px-3.5 text-xs bg-[#003366] hover:bg-[#002244] text-white shrink-0 cursor-pointer"
              >
                {myPlacementSubmission ? "Review Submission" : "Submit Placement Details"}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 3. Refined KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Attachment Status
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-foreground tracking-tight">
                {myPlacement ? "Active Attachment" : myPlacementSubmission ? "In Verification" : "Not Registered"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${myPlacement ? "bg-emerald-500" : myPlacementSubmission ? "bg-blue-500" : "bg-amber-500"}`} />
              {myPlacement ? (myPlacement.company_name || "Host Company") : myPlacementSubmission ? "Coordinator review" : "Placement required"}
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Logbook Entries
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-foreground tracking-tight">
                {myLogbook.length} <span className="text-xs font-normal text-muted-foreground">/ 30 Weeks</span>
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {Math.round((myLogbook.length / 30) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className="bg-[#003366] dark:bg-[#ffa726] h-1 rounded-full"
                style={{ width: `${Math.min(100, Math.round((myLogbook.length / 30) * 100))}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Deliverables
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-foreground tracking-tight">
                {mySubs.length} <span className="text-xs font-normal text-muted-foreground">Submitted</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Next: Placement Letter
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Academic Standing
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-foreground tracking-tight">
                {avgScore > 0 ? `${avgScore}%` : "Good Standing"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Year 3 Industrial Attachment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. High-Signal Dual-Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Academic Deliverables & Regulations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deliverables Table */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold tracking-tight">
                  Academic Deliverables & Milestones
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Mandatory curriculum submissions for WRL course accreditation
                </CardDescription>
              </div>

              <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setDeliverablesTab("all")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    deliverablesTab === "all" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All (4)
                </button>
                <button
                  type="button"
                  onClick={() => setDeliverablesTab("upcoming")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    deliverablesTab === "upcoming" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => setDeliverablesTab("completed")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    deliverablesTab === "completed" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Completed
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {filteredDeliverables.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/15 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-medium hidden sm:inline">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <CalendarDays className="w-3 h-3" />
                        Due Date: <span className="text-foreground font-medium">{item.dueDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${item.statusColor}`}>
                        {item.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={item.action}
                        className="h-7 text-xs px-2.5 rounded border-border cursor-pointer"
                      >
                        {item.actionLabel}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attachment Regulations & Guidelines */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="p-5 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#003366] dark:text-[#ffa726]" />
                University Attachment Regulations & Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs text-muted-foreground space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Duration Requirement</p>
                  <p className="leading-relaxed text-[11px]">
                    Minimum 30 continuous weeks of full-time supervised industrial placement within an accredited host organization.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Weekly Logbook Sign-Off</p>
                  <p className="leading-relaxed text-[11px]">
                    Entries must be compiled weekly and approved by your workplace supervisor every Friday.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Visiting Academic Assessment</p>
                  <p className="leading-relaxed text-[11px]">
                    A designated academic lecturer conducts on-site assessment visits during the mid-term window.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Final Dossier & Defense</p>
                  <p className="leading-relaxed text-[11px]">
                    Submissions of final technical reports and logbook records must be submitted prior to accreditation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3): Coordinator Supervision & University Resources */}
        <div className="space-y-6">
          {/* Department Coordinator Card */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="p-4 border-b border-border/50">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Academic Supervision
              </p>
              <CardTitle className="text-sm font-bold mt-0.5">Departmental Coordinator</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  JS
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">Jameson Sibanda</p>
                  <p className="text-[11px] text-muted-foreground truncate">WRL Coordinator • Business Studies</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-muted-foreground truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">peacesibx@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Commerce Block, UZ Campus</span>
                </div>
              </div>

              <Button
                onClick={() => router.push("/student/messages")}
                className="w-full h-8 text-xs bg-[#003366] hover:bg-[#002244] text-white rounded-lg cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Contact Coordinator
              </Button>
            </CardContent>
          </Card>

          {/* University Documents & Resources */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="p-4 border-b border-border/50">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Official Documents
              </p>
              <CardTitle className="text-sm font-bold mt-0.5">University Resources</CardTitle>
            </CardHeader>
            <CardContent className="p-3 divide-y divide-border/40 text-xs">
              <button
                type="button"
                onClick={() => router.push("/student/deadlines")}
                className="w-full p-2.5 flex items-center justify-between text-left hover:bg-muted/30 rounded transition-colors cursor-pointer"
              >
                <span className="font-medium text-foreground text-[11px]">WRL Handbook & Guidelines 2026</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => router.push("/student/logbook")}
                className="w-full p-2.5 flex items-center justify-between text-left hover:bg-muted/30 rounded transition-colors cursor-pointer"
              >
                <span className="font-medium text-foreground text-[11px]">Digital Logbook Template & Rubrics</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => router.push("/student/submit-placement")}
                className="w-full p-2.5 flex items-center justify-between text-left hover:bg-muted/30 rounded transition-colors cursor-pointer"
              >
                <span className="font-medium text-foreground text-[11px]">Employer Placement Letter Format</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
