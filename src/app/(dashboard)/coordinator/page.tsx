"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useCoordinatorOverview } from "@/hooks/useCoordinatorOverview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Building2, 
  UserCheck, 
  RefreshCw, 
  Search, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2,
  Calendar,
  Sparkles,
  Download
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CoordinatorDashboardPage() {
  const { data, isLoading, error, refetch } = useCoordinatorOverview();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success("Coordinator portal synchronized with database");
  };

  const handleApprovePlacement = async (submissionId: string, studentName: string) => {
    try {
      setApprovingId(submissionId);
      const res = await fetch("/api/coordinator/placements/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Placement for ${studentName} verified and activated successfully!`);
        await refetch();
      } else {
        toast.error(json.error || "Failed to approve placement");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while approving placement");
    } finally {
      setApprovingId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    return data.students.filter((student: any) => {
      const matchesSearch = 
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.regNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.programmeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.programmeName?.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === "ALL") return matchesSearch;
      if (statusFilter === "ACTIVE") return matchesSearch && student.status === "ACTIVE";
      if (statusFilter === "PENDING") return matchesSearch && (student.status === "PENDING" || student.status === "Under Review");
      if (statusFilter === "NO_PLACEMENT") return matchesSearch && student.status === "NO_PLACEMENT";
      return matchesSearch;
    });
  }, [data?.students, searchQuery, statusFilter]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#003366] dark:text-[#ff8c00]" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Connecting to University of Zimbabwe WRL Database...
        </p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalStudents: 0,
    totalPlacements: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    activePlacements: 0,
    totalProgrammes: 177,
    totalFaculties: 13,
  };

  const coordinator = data?.coordinator || {
    name: "Jameson Sibanda",
    email: "peacesibx@gmail.com",
    role: "COORDINATOR",
    department: "Department of Business Studies",
  };

  const pendingSubmissions = data?.pendingSubmissions || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto pb-12"
    >
      {/* 1. Institutional Coordinator Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#002244] via-[#003366] to-[#0a192f] text-white p-6 sm:p-8 shadow-xl border border-blue-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#ff8c00]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              UZ Work-Related Learning Directorate
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Industrial Attachment Coordination
            </h1>
            <p className="text-sm text-blue-100/90 max-w-2xl font-light">
              Central supervisory dashboard for placement verification, academic lecturer allocations, and industrial performance governance across accredited departments.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Coordinator: <strong className="text-white font-medium">{coordinator.name}</strong>
              </span>
              <span className="text-blue-400">•</span>
              <span>{coordinator.department}</span>
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
              Sync DB
            </Button>
            <Link href="/coordinator/students">
              <Button 
                size="sm" 
                className="bg-[#ff8c00] hover:bg-[#e07b00] text-slate-950 font-semibold border border-amber-400/30 shadow-md transition-all"
              >
                <Users className="w-4 h-4 mr-1.5" />
                Manage Students
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registered Students */}
        <Card className="border-border/60 hover:border-[#003366]/40 dark:hover:border-blue-500/40 transition-all shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Registered Students
              </p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">
                {stats.totalStudents}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium text-[11px] px-1.5 py-0.5">
                  Live in PostgreSQL
                </Badge>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-[#003366] dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Pending Verifications */}
        <Card className={`border-border/60 transition-all shadow-sm ${
          stats.pendingSubmissions > 0 
            ? "border-amber-400/80 bg-amber-500/[0.03] dark:bg-amber-950/[0.15]" 
            : "hover:border-border"
        }`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Verification
              </p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">
                {stats.pendingSubmissions}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                {stats.pendingSubmissions > 0 ? (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 text-[11px] px-1.5 py-0.5 animate-pulse">
                    Action Required
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] px-1.5 py-0.5">
                    Queue Cleared
                  </Badge>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Placements */}
        <Card className="border-border/60 hover:border-emerald-500/40 transition-all shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Attachments
              </p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">
                {stats.activePlacements}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] px-1.5 py-0.5">
                  Verified in Industry
                </Badge>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Academic Catalog */}
        <Card className="border-border/60 hover:border-purple-500/40 transition-all shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Academic Catalog
              </p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">
                {stats.totalProgrammes}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-muted-foreground">
                  Across <strong>{stats.totalFaculties}</strong> Faculties
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Action Center: Pending Placement Verification Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Placement Verification Queue
            </h2>
            {pendingSubmissions.length > 0 && (
              <Badge variant="destructive" className="font-mono text-xs">
                {pendingSubmissions.length} Pending
              </Badge>
            )}
          </div>
          <Link href="/coordinator/placements" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
            View All Placements <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingSubmissions.length === 0 ? (
          <Card className="border-border/60 border-dashed bg-muted/20">
            <CardContent className="py-8 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">No Pending Placement Submissions</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                All submitted attachment applications have been processed. When students log into the student portal and submit company details, their applications will appear here for verification.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSubmissions.map((sub: any) => (
              <Card key={sub.id} className="border-amber-300/80 dark:border-amber-700/60 shadow-md overflow-hidden bg-card">
                <div className="h-1.5 bg-gradient-to-r from-amber-400 to-[#ff8c00]" />
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#003366] dark:text-amber-400">
                          {sub.student?.regNumber || sub.student?.user?.regNumber}
                        </span>
                        <Badge variant="outline" className="border-amber-400/80 text-amber-700 dark:text-amber-300 text-[10px] uppercase font-semibold">
                          Requires Approval
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold mt-1 text-foreground">
                        {sub.student?.user?.name || "Student"}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        [{sub.student?.programme?.code}] {sub.student?.programme?.name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1.5">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>{sub.companyName}</span>
                      <span className="text-muted-foreground font-normal">({sub.companyCity})</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Role: {sub.position || "Attachment Intern"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Supervisor: {sub.supervisorName} ({sub.supervisorEmail})</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Term: {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : "Pending"} – {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "Pending"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprovePlacement(sub.id, sub.student?.user?.name || "Student")}
                      disabled={approvingId === sub.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all"
                    >
                      {approvingId === sub.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Verify & Activate Placement
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. Live Registered Students Directory */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#003366] dark:text-[#ff8c00]" />
                Registered Students Master Roll
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Real-time cohort roster synced with University of Zimbabwe student registry.
              </CardDescription>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Filter student or reg number..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/30">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    statusFilter === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({data?.students?.length || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    statusFilter === "ACTIVE" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("NO_PLACEMENT")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    statusFilter === "NO_PLACEMENT" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Unplaced
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-medium text-foreground">No students matched the criteria</p>
              <p className="text-xs text-muted-foreground">Adjust your search query or clear the filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[140px] font-semibold text-xs">Reg Number</TableHead>
                    <TableHead className="font-semibold text-xs">Student Candidate</TableHead>
                    <TableHead className="font-semibold text-xs">Programme & Department</TableHead>
                    <TableHead className="font-semibold text-xs">Placement Status</TableHead>
                    <TableHead className="font-semibold text-xs">Host Organization</TableHead>
                    <TableHead className="text-right font-semibold text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student: any) => (
                    <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-[#003366] dark:text-blue-400">
                        {student.regNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-foreground">{student.name}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {student.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 bg-muted/60">
                            {student.programmeCode}
                          </Badge>
                          <span className="text-xs font-medium text-foreground line-clamp-1">
                            {student.programmeName}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {student.department}
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.status === "ACTIVE" ? (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                            Active Attachment
                          </Badge>
                        ) : student.status === "PENDING" ? (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                            Under Review
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-border text-[11px] font-normal">
                            Placement Needed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {student.companyName ? (
                          <span className="font-medium flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            {student.companyName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href="/coordinator/students">
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs">
                            View File
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Institutional Supervision & Guidelines Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Card className="border-border/60 hover:border-border transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              UZ WRL Regulatory Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Students must complete a minimum of 30 weeks accredited work-related learning with continuous industrial assessments and logbook submissions.
            </p>
            <div className="pt-1">
              <span className="text-[11px] text-primary font-medium hover:underline cursor-pointer">
                View 2026/2027 Guidelines →
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Academic Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Assign academic supervisors to verified students to conduct the 2 mandatory physical/virtual site evaluation assessments.
            </p>
            <div className="pt-1">
              <Link href="/coordinator/placements" className="text-[11px] text-primary font-medium hover:underline">
                Assign Lecturers →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Grading & Assessment Rubrics
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Standardized assessment rubrics for industrial supervisor appraisals (40%) and university academic supervisor visits (60%).
            </p>
            <div className="pt-1">
              <Link href="/coordinator/rubrics" className="text-[11px] text-primary font-medium hover:underline">
                Configure Rubrics →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
