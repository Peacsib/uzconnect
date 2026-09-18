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
  AlertCircle,
  Sparkles,
  ExternalLink,
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
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
        <p className="text-xs text-muted-foreground">Loading placement details...</p>
      </div>
    );
  }

  const studentId = user?.id || profile?.userId || "";
  const placement = placements?.find((p) => p.student_id === studentId || p.studentId === studentId) || profile?.activePlacement;
  const submission = placementSubs?.find((ps) => ps.student_id === studentId || ps.student_id === user?.id) || profile?.latestSubmission;

  // 1. If active placement exists
  if (placement) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Industrial Placement</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified attachment details and mentorship contacts
            </p>
          </div>
          <Badge variant="outline" className={`${getStatusColor(placement.status)} text-xs px-3 py-1 font-bold`}>
            {placement.status || "ACTIVE"}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Company Card */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="flex-row items-center gap-3 border-b border-border/40 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#003366]/10 flex items-center justify-center text-[#003366] dark:text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Host Employer</CardTitle>
                <CardDescription className="text-xs">Company organisation details</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-5 text-sm">
              <p className="font-bold text-lg text-foreground">{placement.company_name || placement.company_id || "Company"}</p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>
                  {formatDate(placement.start_date || "")} – {formatDate(placement.end_date || "")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Harare, Zimbabwe</span>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Card */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="flex-row items-center gap-3 border-b border-border/40 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#ff8c00]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Industry Mentor / Supervisor</CardTitle>
                <CardDescription className="text-xs">Direct workplace mentor</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-5 text-sm">
              <p className="font-bold text-lg text-foreground">{placement.supervisor_name || "Assigned Industry Supervisor"}</p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{placement.supervisor_email || "supervisor@company.co.zw"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>+263 77 000 0000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 2. If submission is pending review
  if (submission) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Industrial Placement</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Attachment registration status</p>
        </div>

        <Card className="border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-card shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verification In Progress
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Placement Submitted for Coordinator Approval
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              You have submitted placement details for <strong>{submission.company_name || submission.companyName}</strong>. Department Coordinator <strong>Jameson Sibanda</strong> will review and verify your supervisor details.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-blue-100 dark:border-blue-900/40 text-xs">
              <div>
                <span className="text-muted-foreground">Employer:</span>
                <p className="font-semibold text-foreground">{submission.company_name || submission.companyName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Supervisor:</span>
                <p className="font-semibold text-foreground">{submission.supervisor_name || submission.supervisorName}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/student/messages")}
                className="text-xs h-9 rounded-xl"
              >
                Message Coordinator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. If no placement or submission exists (Empty State with Best Practice Onboarding)
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Industrial Placement</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Attachment details and verification</p>
      </div>

      <Card className="border-border/70 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#ff8c00] to-[#ffa726]" />
        <CardContent className="p-8 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#ff8c00] flex items-center justify-center mx-auto shadow-xs">
            <Briefcase className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">No Active Placement Found</h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              You haven't submitted your industrial attachment placement yet. To enable your 30-week digital logbook and receive academic supervision visits, please register your company placement offer.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-left text-xs space-y-2">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ff8c00]" />
              What you need to submit:
            </p>
            <ul className="space-y-1 text-muted-foreground text-[11px] list-disc list-inside">
              <li>Company name, physical address & city</li>
              <li>Industry supervisor full name, email & phone number</li>
              <li>Expected attachment start date (minimum 30 continuous weeks)</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => router.push("/student/submit-placement")}
              className="w-full sm:w-auto h-10 px-6 bg-gradient-to-r from-[#ff8c00] to-[#ffa726] hover:from-[#e67e00] hover:to-[#ff8c00] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Submit Placement Details
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/student")}
              className="w-full sm:w-auto h-10 px-4 text-xs rounded-xl border-border/70 cursor-pointer"
            >
              Back to Overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
