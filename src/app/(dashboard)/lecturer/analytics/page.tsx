"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  GraduationCap, 
  Building2, 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  stats: {
    totalAssigned: number;
    totalLogbooks: number;
    approvedLogbooks: number;
    completedAssessments: number;
  };
  companyDistribution: Array<{ name: string; students: number }>;
  submissionStatusData: Array<{ name: string; value: number }>;
}

const PIE_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#64748b"];

export default function Analytics() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const email = user?.email || "";
      const res = await fetch(`/api/lecturer/analytics${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        toast.error(json.error || "Failed to load cohort analytics");
      }
    } catch {
      toast.error("Network error loading analytics");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
    toast.success("Cohort metrics updated from database");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#003366] dark:text-[#ffa726]" />
        <p className="text-xs text-muted-foreground font-medium">Calculating cohort metrics...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalAssigned: 0,
    totalLogbooks: 0,
    approvedLogbooks: 0,
    completedAssessments: 0,
  };

  const approvalRate = stats.totalLogbooks > 0 
    ? Math.round((stats.approvedLogbooks / stats.totalLogbooks) * 100) 
    : 100;

  const companyData = data?.companyDistribution || [];
  const statusData = (data?.submissionStatusData || []).filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Cohort Supervision Analytics</h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold py-0.5">
              Live DB Sync
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time telemetry across student attachment host distribution, logbook submission velocity, and viva marks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs h-8 rounded-lg cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isRefreshing && "animate-spin")} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Assigned Students</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.totalAssigned}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active WRL candidates</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#003366]/10 text-[#003366] dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Logbook Entries</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.totalLogbooks}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Weekly student reports</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Approved Entries</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.approvedLogbooks}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{approvalRate}% review velocity</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Completed Appraisals</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats.completedAssessments}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Official viva marks recorded</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Industry Host Distribution Bar Chart */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Host Employer Distribution</CardTitle>
                <CardDescription className="text-xs">Number of students supervised across partner organizations</CardDescription>
              </div>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {companyData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <Building2 className="w-8 h-8 text-muted-foreground/60 mb-2" />
                <p className="text-xs text-muted-foreground">No placement host records available yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={companyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="students" fill="#003366" radius={[4, 4, 0, 0]} name="Students Attached" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Logbook Review Status Pie Chart */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Logbook Verification Pipeline</CardTitle>
                <CardDescription className="text-xs">Status ratio of student submissions requiring review</CardDescription>
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {statusData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <BookOpen className="w-8 h-8 text-muted-foreground/60 mb-2" />
                <p className="text-xs text-muted-foreground">No weekly logbook entries recorded yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Card */}
      <Card className="border-border/60 bg-muted/20">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Actionable Supervision Workflows</p>
              <p className="text-muted-foreground text-[11px]">
                Review student weekly submissions and evaluate mid-term rubric marks with live database audit logs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/lecturer/logbook")}
              className="text-xs h-8 rounded-lg cursor-pointer"
            >
              Verify Logbooks
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/lecturer/assessments")}
              className="text-xs h-8 rounded-lg cursor-pointer bg-primary text-primary-foreground"
            >
              Grade Viva Rubrics
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
