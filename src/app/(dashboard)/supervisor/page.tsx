"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Building2, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  Loader2,
  ExternalLink,
  BookOpen,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function SupervisorOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const email = user?.email || "emakenga@oldmutual.co.zw";
      const res = await fetch(`/api/supervisor/overview?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err: any) {
      console.error("Failed to load supervisor overview:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success("Workplace mentor portal synchronized");
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#003366] dark:text-[#ff8c00]" />
        <p className="text-xs text-muted-foreground animate-pulse">Connecting to Old Mutual workplace portal...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    activeInterns: 0,
    pendingLogbooks: 0,
    submittedAppraisals: 0,
    complianceRate: "100%",
  };

  const supervisor = data?.supervisor || {
    name: "Efficience Makenga",
    email: "emakenga@oldmutual.co.zw",
    company: "Old Mutual Zimbabwe",
    position: "Senior Systems Engineering Manager",
  };

  const interns = data?.interns || [];
  const pendingLogbooks = data?.pendingLogbooks || [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Corporate Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white p-6 sm:p-8 shadow-xl border border-emerald-800/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wider text-emerald-200">
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              {supervisor.company} • Industrial Mentor Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Workplace Supervisor Dashboard
            </h1>
            <p className="text-sm text-emerald-100/90 max-w-2xl font-light">
              Oversee attached University of Zimbabwe student interns, sign weekly workplace logbooks, and submit accredited industrial appraisals.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Workplace Supervisor: <strong className="text-white font-medium">{supervisor.name}</strong>
              </span>
              <span>•</span>
              <span>{supervisor.position}</span>
              <span>•</span>
              <span className="text-amber-300 font-mono">Session 2026/2027</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-medium transition-all"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin text-emerald-300" : ""}`} />
              Sync Portal
            </Button>
            <Link href="/supervisor/students">
              <Button size="sm" className="bg-[#ff8c00] hover:bg-[#e07b00] text-slate-950 font-semibold shadow-md">
                <Users className="w-4 h-4 mr-1.5" />
                Manage Interns
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Interns</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">{stats.activeInterns}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] px-1.5 py-0.5">
                  At Old Mutual
                </Badge>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-border/60 shadow-sm ${stats.pendingLogbooks > 0 ? "border-amber-400/80 bg-amber-500/[0.02]" : ""}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Logbooks to Sign</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">{stats.pendingLogbooks}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                {stats.pendingLogbooks > 0 ? (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 text-[11px] px-1.5 py-0.5 animate-pulse">
                    Signature Required
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] px-1.5 py-0.5">
                    Queue Clear
                  </Badge>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workplace Appraisals</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">{stats.submittedAppraisals}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-muted-foreground">40% Industry Mark</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compliance & Attendance</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">{stats.complianceRate}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Accredited Host SLA</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Supervised Attached Interns Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Attached Student Interns ({interns.length})
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Students undergoing accredited 30-week industrial attachment at {supervisor.company}.
              </CardDescription>
            </div>
            <Link href="/supervisor/assessments" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              Workplace Appraisal Form <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {interns.length === 0 ? (
            <div className="py-12 text-center space-y-2 px-4">
              <div className="w-12 h-12 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center mx-auto text-muted-foreground">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">No Attached Interns Cleared Yet</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Once student candidates submit their placement details for Old Mutual Zimbabwe and are accredited by the UZ WRL Directorate, their records will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[130px] font-semibold text-xs">Reg Number</TableHead>
                    <TableHead className="font-semibold text-xs">Intern Name</TableHead>
                    <TableHead className="font-semibold text-xs">UZ Degree Programme</TableHead>
                    <TableHead className="font-semibold text-xs">Academic Lecturer</TableHead>
                    <TableHead className="font-semibold text-xs">Logbook Progress</TableHead>
                    <TableHead className="text-right font-semibold text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interns.map((intern: any) => (
                    <TableRow key={intern.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {intern.regNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-foreground">{intern.studentName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {intern.studentEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 bg-muted/60">
                          {intern.programmeCode}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {intern.programmeName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-foreground font-medium">{intern.lecturerName}</span>
                        <p className="text-[10px] text-muted-foreground">{intern.lecturerEmail}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px]">
                            {intern.approvedLogbooks} Approved
                          </Badge>
                          {intern.pendingReviewLogbooks > 0 && (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 text-[11px] animate-pulse">
                              {intern.pendingReviewLogbooks} Pending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href="/supervisor/logbook">
                            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs">
                              Sign Logbook
                            </Button>
                          </Link>
                          <Link href="/supervisor/assessments">
                            <Button size="sm" className="bg-[#003366] text-white hover:bg-[#002244] h-7 px-2.5 text-xs">
                              Appraise
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Host Employer Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Old Mutual Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Ensure all attached student interns adhere to corporate data governance, NDAs, and customer data security regulations at all times.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Industrial Grading
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Workplace supervisors evaluate interns across 4 key dimensions: Technical Competence (40%), Punctuality & Attitude (20%), Teamwork (20%), Initiative (20%).
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              University Liaison
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Direct communication link to the assigned Academic Lecturer and Central Coordinator Jameson Sibanda for site visit scheduling.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
