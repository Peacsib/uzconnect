"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusColor } from "@/utils/formatters";
import {
  Building2,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  ExternalLink,
  GraduationCap,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlacements, usePlacementSubmissions } from "@/hooks/useApi";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { useRouter } from "next/navigation";

export default function MyPlacement() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: placements, isLoading: placementsLoading } = usePlacements();
  const { data: placementSubs, isLoading: subsLoading } = usePlacementSubmissions();
  const { profile, isLoading: profileLoading } = useStudentProfile();

  const isLoading = placementsLoading || subsLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#003366] dark:text-[#ffa726]" />
        <p className="text-xs text-muted-foreground font-medium">Loading placement records...</p>
      </div>
    );
  }

  const studentId = user?.id || profile?.userId || "";
  const placement = 
    placements?.find((p) => 
      p.student_id === studentId || 
      p.studentId === studentId || 
      p.student?.userId === studentId || 
      p.student?.id === studentId ||
      p.student?.regNumber === user?.regNumber
    ) || profile?.activePlacement;

  const submission = placementSubs?.find((ps) => 
    ps.student_id === studentId || 
    ps.student_id === user?.id ||
    ps.student?.userId === studentId
  ) || profile?.latestSubmission;

  // 1. If active placement exists
  if (placement) {
    const companyName = placement.company?.name || placement.company_name || placement.company_id || "Host Company";
    const companyAddress = placement.company?.address || "Harare, Zimbabwe";
    const companyCity = placement.company?.city || "Harare";
    const companyIndustry = placement.company?.industry || "Industrial Partner";

    const supervisorName = placement.supervisor?.user?.name || placement.supervisor_name || placement.supervisor?.name || "Assigned Industry Supervisor";
    const supervisorEmail = placement.supervisor?.user?.email || placement.supervisor_email || "supervisor@company.co.zw";
    const supervisorPhone = placement.supervisor?.user?.phone || "+263 77 000 0000";
    const supervisorRole = placement.supervisor?.position || "Workplace Mentor";

    const lecturerName = placement.lecturer?.user?.name || placement.lecturer_name || "Assigned Academic Lecturer";
    const lecturerEmail = placement.lecturer?.user?.email || placement.lecturer_email || "lecturer@uz.ac.zw";
    const lecturerDept = placement.lecturer?.department || profile?.programme?.department || "Computer Science";

    const startDate = placement.startDate || placement.start_date || "";
    const endDate = placement.endDate || placement.end_date || "";

    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">My Industrial Placement</h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-semibold py-0.5 px-2">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verified & Synchronized
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified host employer details, industry mentorship, and academic supervision contacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getStatusColor(placement.status || "ACTIVE")} text-xs px-3 py-1 font-semibold`}>
              {placement.status || "ACTIVE"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/student/logbook")}
              className="text-xs h-8 rounded-lg cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Open Logbook
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Supervision & Host Grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Company Card */}
          <Card className="border-border/60 shadow-xs hover:border-border transition-colors">
            <CardHeader className="flex-row items-center gap-3 border-b border-border/50 pb-3">
              <div className="w-9 h-9 rounded-lg bg-[#003366]/10 text-[#003366] dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold truncate">Host Employer</CardTitle>
                <CardDescription className="text-xs truncate">{companyIndustry}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              <p className="font-bold text-base text-foreground leading-snug">{companyName}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>
                  {formatDate(startDate)} – {formatDate(endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{companyAddress}, {companyCity}</span>
              </div>
              <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Accredited 30-Week WRL Partner</span>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Card */}
          <Card className="border-border/60 shadow-xs hover:border-border transition-colors">
            <CardHeader className="flex-row items-center gap-3 border-b border-border/50 pb-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold truncate">Industry Supervisor</CardTitle>
                <CardDescription className="text-xs truncate">{supervisorRole}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              <p className="font-bold text-base text-foreground leading-snug">{supervisorName}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <a href={`mailto:${supervisorEmail}`} className="hover:underline hover:text-foreground truncate">
                  {supervisorEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{supervisorPhone}</span>
              </div>
              <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Weekly Logbook Evaluator</span>
              </div>
            </CardContent>
          </Card>

          {/* Academic Lecturer Assessor Card */}
          <Card className="border-border/60 shadow-xs hover:border-border transition-colors border-l-2 border-l-[#003366] dark:border-l-blue-400">
            <CardHeader className="flex-row items-center gap-3 border-b border-border/50 pb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold truncate">Academic Assessor</CardTitle>
                <CardDescription className="text-xs truncate">University Faculty Supervisor</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              <div>
                <p className="font-bold text-base text-foreground leading-snug">{lecturerName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{lecturerDept}</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <a href={`mailto:${lecturerEmail}`} className="hover:underline hover:text-foreground truncate">
                  {lecturerEmail}
                </a>
              </div>
              <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/student/messages")}
                  className="w-full text-xs h-7.5 rounded-md gap-1.5 cursor-pointer font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  Direct Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Info Banner */}
        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Tripartite WRL Framework Active</p>
                <p className="text-muted-foreground text-[11px]">
                  Your weekly logs are reviewed by both your industry mentor and academic lecturer for official semester credit.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/student/logbook")}
              className="text-xs h-8 text-primary font-semibold hover:bg-primary/10 cursor-pointer shrink-0"
            >
              Submit Weekly Activity
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. If submission is pending review
  if (submission) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-border/60 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Industrial Placement</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Attachment registration and verification review</p>
        </div>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-6 md:p-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verification in Progress
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Placement Details Under Coordinator Review
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Your attachment details for <strong>{submission.company_name || submission.companyName}</strong> have been submitted. Department Coordinator <strong>Jameson Sibanda</strong> will verify employer credentials and supervisor appointment.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-border/50 text-xs">
              <div>
                <span className="text-muted-foreground">Host Employer:</span>
                <p className="font-semibold text-foreground mt-0.5">{submission.company_name || submission.companyName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Industry Supervisor:</span>
                <p className="font-semibold text-foreground mt-0.5">{submission.supervisor_name || submission.supervisorName}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/student/messages")}
                className="text-xs h-8 rounded-lg cursor-pointer"
              >
                Contact Coordinator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. If no placement or submission exists (Clean Institutional Onboarding)
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Industrial Placement</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Attachment records and employer verification</p>
      </div>

      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-8 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-muted/60 border border-border/70 text-muted-foreground flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">No Placement Registered Yet</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              To begin your 30-week Work Related Learning course and unlock your digital logbook, you must submit your approved host employer placement offer.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-left text-xs space-y-2">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary" />
              Information required for registration:
            </p>
            <ul className="space-y-1 text-muted-foreground text-[11px] list-disc list-inside">
              <li>Host company name, physical address and operating city</li>
              <li>Designated workplace supervisor full name, official email and telephone</li>
              <li>Confirmed attachment start date (minimum 30 continuous weeks)</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => router.push("/student/submit-placement")}
              className="w-full sm:w-auto h-9 px-5 bg-[#003366] hover:bg-[#002244] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Submit Placement Details
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/student")}
              className="w-full sm:w-auto h-9 px-4 text-xs rounded-lg border-border cursor-pointer"
            >
              Back to Overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
