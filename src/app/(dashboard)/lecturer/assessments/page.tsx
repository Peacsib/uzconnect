"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AssessmentRubricForm } from "@/components/lecturer/AssessmentRubricForm";
import { 
  ClipboardCheck, 
  Loader2, 
  Search, 
  FileDown, 
  FileSpreadsheet, 
  GraduationCap, 
  Building2, 
  User, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssessmentRecord {
  id: string;
  placementId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  regNumber: string;
  programme: string;
  companyName: string;
  supervisorName: string;
  technicalScore: number;
  professionalScore: number;
  communicationScore: number;
  overallScore: number;
  comments: string;
  date: string;
  status: "graded" | "pending";
}

export default function AssessmentsReview() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [rubricOpen, setRubricOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentRecord | null>(null);

  const fetchAssessments = useCallback(async () => {
    try {
      setIsLoading(true);
      const email = user?.email || "";
      const res = await fetch(`/api/lecturer/assessments${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.assessments)) {
        setAssessments(json.assessments);
      } else {
        toast.error(json.error || "Failed to load assessments");
      }
    } catch {
      toast.error("Network error loading assessments");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAssessments();
    setIsRefreshing(false);
    toast.success("Assessments synchronized with academic grading ledger");
  };

  const openRubric = (a: AssessmentRecord) => {
    setSelectedAssessment(a);
    setRubricOpen(true);
  };

  const handleRubricSubmit = async (data: { totalScore: number; comments: string; criteria: any[] }) => {
    if (!selectedAssessment) return;

    try {
      const technicalScore = data.criteria.find((c) => c.name.toLowerCase().includes("technical"))?.score || 0;
      const professionalScore = data.criteria.find((c) => c.name.toLowerCase().includes("professional"))?.score || 0;
      const communicationScore = data.criteria.find((c) => c.name.toLowerCase().includes("communication"))?.score || 0;

      const res = await fetch("/api/lecturer/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placementId: selectedAssessment.placementId,
          submissionId: selectedAssessment.id.startsWith("pending_") ? null : selectedAssessment.id,
          technicalScore,
          professionalScore,
          communicationScore,
          overallScore: data.totalScore,
          comments: data.comments,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Assessment recorded (${data.totalScore}%). Student notified!`);
        setRubricOpen(false);
        fetchAssessments();
      } else {
        toast.error(json.error || "Failed to save assessment");
      }
    } catch {
      toast.error("Network error while submitting assessment");
    }
  };

  const filtered = useMemo(() => {
    return assessments.filter((a) => {
      const q = debouncedSearch.toLowerCase();
      return (
        !q ||
        a.studentName.toLowerCase().includes(q) ||
        a.regNumber.toLowerCase().includes(q) ||
        a.companyName.toLowerCase().includes(q) ||
        a.programme.toLowerCase().includes(q)
      );
    });
  }, [assessments, debouncedSearch]);

  const exportCols = ["Student Name", "Reg Number", "Host Employer", "Overall Score", "Technical", "Professional", "Status", "Date"];
  const getExportRows = () =>
    filtered.map((a) => [
      a.studentName,
      a.regNumber,
      a.companyName,
      a.status === "graded" ? `${a.overallScore}%` : "Pending",
      `${a.technicalScore}%`,
      `${a.professionalScore}%`,
      a.status.toUpperCase(),
      formatDate(a.date || ""),
    ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic Assessment & Viva Rubric</h1>
            <Badge variant="outline" className="bg-[#003366]/10 text-[#003366] dark:text-blue-400 border-[#003366]/20 text-xs font-semibold">
              {assessments.filter((a) => a.status === "graded").length} / {assessments.length} Graded
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional rubric scoring for student work-related learning, site visit appraisals, and viva evaluations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="text-xs h-8 rounded-lg cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isRefreshing && "animate-spin")} />
            Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToPDF("Academic_Assessments_Ledger", exportCols, getExportRows())}
            className="text-xs h-8 rounded-lg cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel("Academic_Assessments", exportCols, getExportRows())}
            className="text-xs h-8 rounded-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Excel
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student, reg number, or employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#003366] dark:text-[#ffa726]" />
          <p className="text-xs text-muted-foreground font-medium">Loading assessment ledger...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-foreground text-sm">No Student Assessments Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {search ? "No records matched your search query." : "No students currently assigned for academic appraisal."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((a, i) => {
            const isGraded = a.status === "graded";
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="border-border/60 shadow-xs hover:border-border transition-colors">
                  <CardHeader className="pb-3 border-b border-border/40 flex-row items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-bold text-foreground">{a.studentName}</CardTitle>
                        <Badge variant="outline" className="font-mono text-[10px] py-0">
                          {a.regNumber}
                        </Badge>
                        <span className="text-xs text-muted-foreground">• {a.companyName}</span>
                      </div>
                      <CardDescription className="text-[11px] mt-0.5">
                        {a.programme} • Supervisor: {a.supervisorName}
                      </CardDescription>
                    </div>
                    <div>
                      {isGraded ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold py-1 px-2.5">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Score: {a.overallScore}%
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-semibold py-1 px-2.5">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Pending Evaluation
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 text-xs">
                    {isGraded ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3 rounded-lg border border-border/40">
                        <div>
                          <span className="text-muted-foreground text-[11px]">Technical Competence</span>
                          <p className="font-bold text-sm text-foreground mt-0.5">{a.technicalScore}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[11px]">Professional Conduct</span>
                          <p className="font-bold text-sm text-foreground mt-0.5">{a.professionalScore}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[11px]">Communication</span>
                          <p className="font-bold text-sm text-foreground mt-0.5">{a.communicationScore}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[11px]">Overall Total</span>
                          <p className="font-bold text-sm text-primary mt-0.5">{a.overallScore}%</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Student is actively attached at {a.companyName}. Conduct workplace appraisal, site evaluation, and viva grading using the university standard rubric below.
                      </p>
                    )}

                    {a.comments && (
                      <div className="bg-background/80 p-2.5 rounded-md border border-border/50 text-[11px] text-muted-foreground flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong>Examiner Comments:</strong> {a.comments}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        {isGraded ? `Evaluated on ${formatDate(a.date)}` : "Awaiting viva or midterm evaluation"}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => openRubric(a)}
                        className="bg-primary text-primary-foreground text-xs h-8 rounded-lg cursor-pointer gap-1.5"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        {isGraded ? "Update Rubric Marks" : "Grade with Rubric"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rubric Dialog */}
      {selectedAssessment && (
        <AssessmentRubricForm
          open={rubricOpen}
          onOpenChange={setRubricOpen}
          studentName={`${selectedAssessment.studentName} (${selectedAssessment.regNumber})`}
          assessmentId={selectedAssessment.id}
          existingScore={selectedAssessment.overallScore}
          existingComments={selectedAssessment.comments}
          onSubmit={handleRubricSubmit}
        />
      )}
    </div>
  );
}
