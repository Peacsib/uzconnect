"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Building2, 
  UserCheck, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  Loader2,
  ExternalLink,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LecturerOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const email = user?.email || "panashes@uofzmail.az.uz.zw";
      const res = await fetch(`/api/lecturer/overview?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err: any) {
      console.error("Failed to load lecturer overview:", err);
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
    toast.success("Academic supervisor portal synchronized");
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#003366] dark:text-[#ff8c00]" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading academic supervisor data...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    assignedStudents: 0,
    pendingLogbooks: 0,
    completedAssessments: 0,
    averageScore: "N/A",
  };

  const lecturer = data?.lecturer || {
    name: "Panashe S",
    email: "panashes@uofzmail.az.uz.zw",
    department: "Department of Business Studies",
    faculty: "Faculty of Business Management Sciences and Economics",
  };

  const students = data?.students || [];
  const pendingLogbooks = data?.pendingLogbooks || [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Academic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a192f] via-[#003366] to-[#002244] text-white p-6 sm:p-8 shadow-xl border border-blue-900/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              UZ Academic Supervision Directorate
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Academic Supervisor Command Center
            </h1>
            <p className="text-sm text-blue-100/90 max-w-2xl font-light">
              Conduct academic site evaluations, review continuous industrial logbooks, and submit accredited coursework marks.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Supervisor: <strong className="text-white font-medium">{lecturer.name}</strong>
              </span>
              <span className="text-blue-400">•</span>
              <span>{lecturer.department}</span>
              <span className="text-blue-400">•</span>
              <span className="text-amber-300 font-mono">Academic Session 2026/2027</span>
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
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
              Sync Roster
            </Button>
            <Link href="/lecturer/students">
              <Button size="sm" className="bg-[#ff8c00] hover:bg-[#e07b00] text-slate-950 font-semibold shadow-md">
                <Users className="w-4 h-4 mr-1.5" />
                View Students
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Students</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">{stats.assignedStudents}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] px-1.5 py-0.5">
                  Supervised Cohort
                </Badge>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-[#003366] dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-border/60 shadow-sm ${stats.pendingLogbooks > 0 ? "border-amber-400/80 bg-amber-500/[0.02]" : ""}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Logbooks</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">{stats.pendingLogbooks}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                {stats.pendingLogbooks > 0 ? (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 text-[11px] px-1.5 py-0.5 animate-pulse">
                    Review Required
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] px-1.5 py-0.5">
                    All Up to Date
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed Assessments</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">{stats.completedAssessments}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] px-1.5 py-0.5">
                  Site Evaluations
                </Badge>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departmental Average</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">{stats.averageScore}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-muted-foreground">UZ Business Studies Index</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Assigned Supervised Students Roster */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#003366] dark:text-[#ff8c00]" />
                Supervised Students Roster
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Students allocated for official university academic evaluation and site inspections.
              </CardDescription>
            </div>
            <Link href="/lecturer/assessments" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              Assessment Rubrics <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="py-12 text-center space-y-2 px-4">
              <div className="w-12 h-12 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center mx-auto text-muted-foreground">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">No Students Currently Allocated</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                When students submit their host employer details in the Department of Business Studies and are verified by Coordinator Jameson Sibanda, they will appear in your academic roster.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[130px] font-semibold text-xs">Reg Number</TableHead>
                    <TableHead className="font-semibold text-xs">Student Name</TableHead>
                    <TableHead className="font-semibold text-xs">Degree Programme</TableHead>
                    <TableHead className="font-semibold text-xs">Host Employer</TableHead>
                    <TableHead className="font-semibold text-xs">Workplace Mentor</TableHead>
                    <TableHead className="font-semibold text-xs">Site Visit</TableHead>
                    <TableHead className="text-right font-semibold text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => (
                    <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-[#003366] dark:text-blue-400">
                        {student.regNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-foreground">{student.studentName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {student.studentEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 bg-muted/60">
                          {student.programmeCode}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {student.programmeName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-xs flex items-center gap-1 text-foreground">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          {student.companyName}
                        </span>
                        <p className="text-[10px] text-muted-foreground">{student.companyCity}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-foreground font-medium">{student.supervisorName}</span>
                        <p className="text-[10px] text-muted-foreground">{student.supervisorEmail}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-medium border-blue-200">
                          {student.siteAssessmentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href="/lecturer/logbook">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              Logbook
                            </Button>
                          </Link>
                          <Link href="/lecturer/assessments">
                            <Button size="sm" className="bg-[#003366] text-white hover:bg-[#002244] h-7 px-2 text-xs">
                              Evaluate
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

      {/* 4. Guidelines & Regulatory Framework */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Site Assessment Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Each academic supervisor conducts 2 formal evaluations per student: Assessment 1 (Mid-Term) and Assessment 2 (Final Defense).
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Weighting Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Academic Evaluation Visit: 60% of total WRL mark. Industry Supervisor Appraisal: 40% of final grade.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Logbook Sign-Off SLA
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Weekly reports submitted by students must be reviewed and endorsed within 7 academic days.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
