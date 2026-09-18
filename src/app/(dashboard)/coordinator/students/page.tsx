"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { useStudents } from "@/hooks/useApi";
import { useFaculties, useDepartments, useProgrammes } from "@/hooks/useAcademicData";
import { ImportStudentsModal } from "@/components/coordinator/ImportStudentsModal";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";

const PAGE_SIZE = 15;

export default function StudentsManagement() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [facultyId, setFacultyId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [programmeId, setProgrammeId] = useState<string>("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch data from cache (instant loading)
  const { data: faculties } = useFaculties();
  const { data: departments } = useDepartments();
  const { data: programmes } = useProgrammes();
  
  // Filter departments and programmes based on selection
  const filteredDepartments = facultyId 
    ? departments?.filter(d => d.faculty_id === parseInt(facultyId))
    : departments;
    
  const filteredProgrammes = departmentId
    ? programmes?.filter(p => p.department_id === parseInt(departmentId))
    : programmes;
  
  const { data: studentsData, isLoading } = useStudents({
    faculty_id: facultyId,
    department_id: departmentId,
    programme_id: programmeId,
    search: debouncedSearch,
  });

  const students = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.data || [];
  const totalPages = (studentsData as any)?.meta?.last_page || 1;

  // Reset dependent filters
  const handleFacultyChange = (value: string) => {
    setFacultyId(value === "all" ? "" : value);
    setDepartmentId("");
    setProgrammeId("");
    setPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value === "all" ? "" : value);
    setProgrammeId("");
    setPage(1);
  };

  const handleProgrammeChange = (value: string) => {
    setProgrammeId(value === "all" ? "" : value);
    setPage(1);
  };

  const getExportRows = () => students.map((s: any) => [
    s.user?.reg_number || s.reg_number,
    s.user?.name || '',
    s.programme?.code || '',
    s.programme?.name || '',
    s.programme?.department?.name || '',
    s.programme?.department?.faculty?.name || '',
    s.user?.email || '',
    s.phone || '',
  ]);

  const exportCols = ["Reg No.", "Name", "Programme Code", "Programme", "Department", "Faculty", "Email", "Phone"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Students Management</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => exportToPDF("Students", exportCols, getExportRows())}>
            <FileDown className="w-4 h-4 mr-1" />PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToExcel("Students", exportCols, getExportRows())}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />Excel
          </Button>
          <Button onClick={() => setImportModalOpen(true)} className="bg-primary text-primary-foreground">
            <Upload className="w-4 h-4 mr-2" />Import Students
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or reg number..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9" 
          />
        </div>

        <Select value={facultyId || "all"} onValueChange={handleFacultyChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Faculties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Faculties</SelectItem>
            {faculties?.map((faculty: any) => (
              <SelectItem key={faculty.id} value={faculty.id.toString()}>
                {faculty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={departmentId || "all"} onValueChange={handleDepartmentChange} disabled={!facultyId}>
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {filteredDepartments?.map((dept: any) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={programmeId || "all"} onValueChange={handleProgrammeChange} disabled={!departmentId}>
          <SelectTrigger>
            <SelectValue placeholder="All Programmes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programmes</SelectItem>
            {filteredProgrammes?.map((prog: any) => (
              <SelectItem key={prog.id} value={prog.id.toString()}>
                {prog.code} - {prog.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {students.length === 0 ? (
        <EmptyState {...emptyStates.students} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">{student.user?.reg_number || student.reg_number}</TableCell>
                      <TableCell className="font-medium">{student.user?.name}</TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="font-mono">{student.programme?.code}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{student.programme?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{student.programme?.department?.name}</TableCell>
                      <TableCell className="text-sm">{student.programme?.department?.faculty?.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{student.user?.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <ImportStudentsModal open={importModalOpen} onOpenChange={setImportModalOpen} />
    </div>
  );
}
