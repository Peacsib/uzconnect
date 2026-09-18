"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { departments, type Student } from "@/utils/mockData";
import { toast } from "sonner";
import { z } from "zod";
import { useProgrammes } from "@/hooks/useAcademicData";

const studentSchema = z.object({
  regNumber: z.string().min(1, "Registration number required").regex(/^R\d{6}[A-Z]$/, "Format: R######X"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  programme: z.string().min(1, "Programme required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Valid phone required"),
});

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSave: (student: Omit<Student, "id">) => void;
}

export function StudentDialog({ open, onOpenChange, student, onSave }: StudentDialogProps) {
  const [form, setForm] = useState({
    regNumber: "",
    name: "",
    programme: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch programmes from cache (instant loading)
  const { data: programmesData } = useProgrammes();

  useEffect(() => {
    if (student) {
      setForm({
        regNumber: student.regNumber,
        name: student.name,
        programme: student.programme,
        email: student.email,
        phone: student.phone,
      });
    } else {
      setForm({ regNumber: "", name: "", programme: "", email: "", phone: "" });
    }
    setErrors({});
  }, [student, open]);

  const handleSubmit = () => {
    const result = studentSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    onSave(form);
    toast.success(student ? "Student updated" : "Student added");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add Student"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Registration Number</Label>
            <Input value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value.toUpperCase() })} placeholder="R217890A" className="mt-1" />
            {errors.regNumber && <p className="text-destructive text-xs mt-1">{errors.regNumber}</p>}
          </div>
          <div>
            <Label className="text-sm">Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tatenda Chirwa" className="mt-1" />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label className="text-sm">Programme</Label>
            <Select value={form.programme} onValueChange={(v) => setForm({ ...form, programme: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select programme..." /></SelectTrigger>
              <SelectContent>
                {programmesData?.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {(p as any).code || p.name} - {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.programme && <p className="text-destructive text-xs mt-1">{errors.programme}</p>}
          </div>
          <div>
            <Label className="text-sm">Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="r217890a@students.uz.ac.zw" className="mt-1" />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label className="text-sm">Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+263 78 111 2233" className="mt-1" />
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
              {student ? "Save Changes" : "Add Student"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onConfirm: () => void;
}

export function DeleteStudentDialog({ open, onOpenChange, student, onConfirm }: DeleteStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove Student</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to remove <strong className="text-foreground">{student?.name}</strong> ({student?.regNumber})? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); toast.success("Student removed"); }}>
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
