"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileDown, FileSpreadsheet, Loader2, Building2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";
import { useAuth } from "@/context/AuthContext";

const PAGE_SIZE = 10;

export default function StudentsManagement() {
  const { user } = useAuth();
  const [studentList, setStudentList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const email = user?.email || "";
      const res = await fetch(`/api/lecturer/overview${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.students)) {
        setStudentList(json.students);
      } else {
        setStudentList([]);
      }
    } catch {
      setStudentList([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = useMemo(() => studentList.filter((s) => {
    const q = debouncedSearch.toLowerCase();
    const name = (s.studentName || s.name || "").toLowerCase();
    const reg = (s.regNumber || "").toLowerCase();
    const prog = (s.programmeName || s.programme || "").toLowerCase();
    return !q || name.includes(q) || reg.includes(q) || prog.includes(q);
  }), [studentList, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getExportRows = () => filtered.map((s) => [
    s.regNumber,
    s.studentName || s.name,
    s.programmeCode || s.programme,
    s.studentEmail || s.email,
    s.companyName || "Unplaced",
    s.siteAssessmentStatus || "Active",
  ]);
  const exportCols = ["Reg No.", "Name", "Programme", "Email", "Company", "Status"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#003366] dark:text-[#ff8c00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Assigned Students Roster</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Students allocated to your academic supervision by the Departmental Coordinator.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => exportToPDF("Assigned_Students", exportCols, getExportRows())}>
            <FileDown className="w-4 h-4 mr-1" />PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToExcel("Assigned_Students", exportCols, getExportRows())}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />Excel
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search assigned students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 && !debouncedSearch ? (
        <EmptyState 
          icon={UserCheck} 
          title="No Students Assigned" 
          description="You do not have any students assigned for supervision yet. When the Coordinator assigns students to you, they will appear here." 
        />
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Host Organization</TableHead>
                    <TableHead>Workplace Supervisor</TableHead>
                    <TableHead>Attachment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((stu) => (
                    <TableRow key={stu.id}>
                      <TableCell className="font-mono text-sm font-bold text-[#003366] dark:text-blue-400">
                        {stu.regNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{stu.studentName || stu.name}</div>
                        <div className="text-xs text-muted-foreground">{stu.studentEmail || stu.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline" className="font-mono text-[10px] mr-1">
                          {stu.programmeCode}
                        </Badge>
                        {stu.programmeName}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          {stu.companyName}
                        </div>
                        <div className="text-xs text-muted-foreground">{stu.companyCity}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">{stu.supervisorName}</div>
                        <div className="text-xs text-muted-foreground">{stu.supervisorEmail}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 text-xs">
                          Active Placement
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-between items-center text-xs text-muted-foreground px-2 py-3">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
