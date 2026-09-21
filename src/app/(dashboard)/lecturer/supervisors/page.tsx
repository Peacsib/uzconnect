"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Search, 
  Users, 
  MessageSquare, 
  Loader2, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SupervisorsCompanies() {
  const { user } = useAuth();
  const [data, setData] = useState<{ supervisors: any[]; companies: any[]; totalPlacements: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"supervisors" | "companies">("supervisors");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const email = user?.email || "";
      const res = await fetch(`/api/lecturer/supervisors${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        toast.error(json.error || "Failed to load supervisors");
      }
    } catch {
      toast.error("Network error loading supervisors directory");
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
    setIsRefreshing(false);
    toast.success("Supervisors directory refreshed");
  };

  const filteredSupervisors = (data?.supervisors || []).filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.companyName.toLowerCase().includes(q) ||
      s.interns?.some((i: any) => i.name.toLowerCase().includes(q) || i.regNumber.toLowerCase().includes(q))
    );
  });

  const filteredCompanies = (data?.companies || []).filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.interns?.some((i: any) => i.studentName.toLowerCase().includes(q))
    );
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#003366] dark:text-[#ff8c00]" />
        <p className="text-xs text-muted-foreground font-medium">Loading workplace mentors & companies...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#003366] dark:text-[#ff8c00]" />
            Workplace Supervisors & Host Employers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Directory of industry mentors and accredited host organizations overseeing your assigned student cohort.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/lecturer/messages">
            <Button
              size="sm"
              className="bg-[#003366] hover:bg-[#002244] dark:bg-[#ff8c00] dark:hover:bg-[#e07b00] text-white text-xs h-9"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Message Mentors
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Workplace Mentors</CardTitle>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data?.supervisors?.length || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Designated on-site intern mentors</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Host Employers</CardTitle>
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data?.companies?.length || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Accredited corporate training organizations</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Active Placements</CardTitle>
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data?.totalPlacements || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Students currently supervised by you</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/30">
          <button
            onClick={() => setTab("supervisors")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              tab === "supervisors"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Industry Supervisors ({data?.supervisors?.length || 0})
          </button>
          <button
            onClick={() => setTab("companies")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              tab === "companies"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Host Companies ({data?.companies?.length || 0})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={tab === "supervisors" ? "Search mentors or interns..." : "Search companies..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Main Content View */}
      {tab === "supervisors" ? (
        <Card className="border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#003366] dark:text-[#ff8c00]" />
              Industry Supervisors Directory
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Workplace evaluators responsible for day-to-day student guidance and continuous logbook sign-offs.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredSupervisors.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <UserCheck className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-semibold text-foreground">No industry supervisors found</p>
                <p className="text-xs text-muted-foreground">
                  When students are assigned to your supervision roster, their workplace mentors will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="font-semibold text-xs">Workplace Mentor</TableHead>
                      <TableHead className="font-semibold text-xs">Designation & Role</TableHead>
                      <TableHead className="font-semibold text-xs">Host Organization</TableHead>
                      <TableHead className="font-semibold text-xs">Assigned Interns</TableHead>
                      <TableHead className="text-right font-semibold text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSupervisors.map((sup: any) => (
                      <TableRow key={sup.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            {sup.name}
                            <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-normal">
                              Active Mentor
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${sup.email}`} className="hover:underline hover:text-foreground">
                              {sup.email}
                            </a>
                          </div>
                          {sup.phone && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span>{sup.phone}</span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-foreground">
                          <div className="flex items-center gap-1 font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                            {sup.position}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-foreground flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-[#003366] dark:text-[#ff8c00]" />
                            {sup.companyName}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {sup.companyCity}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {sup.interns?.map((intern: any) => (
                              <div key={intern.id} className="flex items-center gap-1.5">
                                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                                  {intern.regNumber}
                                </Badge>
                                <span className="text-xs font-medium text-foreground">{intern.name}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href="/lecturer/messages">
                              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Contact
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
      ) : (
        <Card className="border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#003366] dark:text-[#ff8c00]" />
              Host Organizations Directory
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Accredited corporate and public institutions providing industrial work-related learning.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCompanies.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-semibold text-foreground">No host employers found</p>
                <p className="text-xs text-muted-foreground">Approved placement organizations will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="font-semibold text-xs">Organization Name</TableHead>
                      <TableHead className="font-semibold text-xs">Physical Address & Location</TableHead>
                      <TableHead className="font-semibold text-xs">Cohort Distribution</TableHead>
                      <TableHead className="font-semibold text-xs">Students on Attachment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((comp: any) => (
                      <TableRow key={comp.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-[#003366] dark:text-[#ff8c00]" />
                            {comp.name}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{comp.address || comp.city || "Harare, Zimbabwe"}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs font-semibold">
                            {comp.internsCount} {comp.internsCount === 1 ? "Student Intern" : "Student Interns"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {comp.interns?.map((intern: any, idx: number) => (
                              <div key={idx} className="text-xs flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[11px] text-[#003366] dark:text-blue-400">
                                  {intern.regNumber}
                                </span>
                                <span className="text-foreground">{intern.studentName}</span>
                                <span className="text-muted-foreground text-[11px]">
                                  (Mentor: {intern.supervisorName})
                                </span>
                              </div>
                            ))}
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
      )}
    </motion.div>
  );
}
