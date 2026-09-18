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
  const placement = placements?.find((p) => p.student_id === studentId || p.studentId === studentId) || profile?.activePlacement;
  const submission = placementSubs?.find((ps) => ps.student_id === studentId || ps.student_id === user?.id) || profile?.latestSubmission;

  // 1. If active placement exists
  if (placement) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Industrial Placement</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified host employer details and industry mentorship contacts
            </p>
          </div>
          <Badge variant="outline" className={`${getStatusColor(placement.status)} text-xs px-3 py-1 font-semibold`}>
            {placement.status || "ACTIVE"}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Company Card */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="flex-row items-center gap-3 border-b border-border/50 pb-4">
              <div className="w-9 h-9 rounded-lg bg-[#003366]/10 flex items-center justify-center text-[#003366] dark:text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Host Employer</CardTitle>
                <CardDescription className="text-xs">Accredited training organization</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-5 text-xs">
              <p className="font-bold text-base text-foreground">{placement.company_name || placement.company_id || "Company"}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>
                  {formatDate(placement.start_date || "")} – {formatDate(placement.end_date || "")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>Harare, Zimbabwe</span>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Card */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="flex-row items-center gap-3 border-b border-border/50 pb-4">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground">
                <User className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Industry Mentor / Supervisor</CardTitle>
                <CardDescription className="text-xs">Designated workplace evaluator</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-5 text-xs">
              <p className="font-bold text-base text-foreground">{placement.supervisor_name || "Assigned Industry Supervisor"}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{placement.supervisor_email || "supervisor@company.co.zw"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
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
