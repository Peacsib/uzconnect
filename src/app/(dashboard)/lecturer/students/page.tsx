"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { students as initialStudents, placements, type Student } from "@/utils/mockData";
import { Plus, Upload, Search, Pencil, Trash2, FileDown, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { getStatusColor } from "@/utils/formatters";
import { StudentDialog, DeleteStudentDialog } from "@/components/lecturer/StudentDialog";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";

const PAGE_SIZE = 10;

export default function StudentsManagement() {
  const [studentList, setStudentList] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => studentList.filter((s) => {
    const q = debouncedSearch.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.regNumber.toLowerCase().includes(q) || s.programme.toLowerCase().includes(q);
  }), [studentList, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getExportRows = () => filtered.map((s) => {
    const pl = placements.find((p) => p.studentId === s.id);
    return [s.regNumber, s.name, s.programme, s.email, s.phone, pl?.status ?? "Unplaced"];
  });
  const exportCols = ["Reg No.", "Name", "Programme", "Email", "Phone", "Placement"];

  const handleSave = (data: Omit<Student, "id">) => {
    if (editingStudent) {
      setStudentList((prev) => prev.map((s) => s.id === editingStudent.id ? { ...s, ...data } : s));
    } else {
      const newStudent: Student = { ...data, id: `stu-${Date.now()}` };
      setStudentList((prev) => [...prev, newStudent]);
    }
  };

  const handleDelete = () => {
    if (deletingStudent) {
      setStudentList((prev) => prev.filter((s) => s.id !== deletingStudent.id));
    }
  };

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
          <Button variant="outline" onClick={() => toast.info("CSV import coming soon")}><Upload className="w-4 h-4 mr-2" />Import</Button>
          <Button onClick={() => { setEditingStudent(null); setDialogOpen(true); }} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />Add Student
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 && !debouncedSearch ? (
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
                    <TableHead>Email</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((stu) => {
                    const pl = placements.find((p) => p.studentId === stu.id);
                    return (
                      <TableRow key={stu.id}>
                        <TableCell className="font-mono text-sm">{stu.regNumber}</TableCell>
                        <TableCell className="font-medium">{stu.name}</TableCell>
                        <TableCell className="text-sm">{stu.programme}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{stu.email}</TableCell>
                        <TableCell>
                          {pl ? <Badge variant="outline" className={getStatusColor(pl.status)}>{pl.status}</Badge> : <Badge variant="outline">Unplaced</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingStudent(stu); setDialogOpen(true); }}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setDeletingStudent(stu); setDeleteOpen(true); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paged.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No students found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <StudentDialog open={dialogOpen} onOpenChange={setDialogOpen} student={editingStudent} onSave={handleSave} />
      <DeleteStudentDialog open={deleteOpen} onOpenChange={setDeleteOpen} student={deletingStudent} onConfirm={handleDelete} />
    </div>
  );
}
