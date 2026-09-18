"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { students, supervisors, companies, lecturers } from "@/utils/mockData";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Building2, User, Calendar, ClipboardCheck } from "lucide-react";

interface PlacementWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: PlacementFormData) => void;
}

interface PlacementFormData {
  studentId: string;
  companyId: string;
  supervisorId: string;
  lecturerId: string;
  startDate: string;
  endDate: string;
}

const STEPS = [
  { label: "Student", icon: User },
  { label: "Company", icon: Building2 },
  { label: "Dates", icon: Calendar },
  { label: "Review", icon: ClipboardCheck },
];

export function PlacementWizard({ open, onOpenChange, onSubmit }: PlacementWizardProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PlacementFormData>({
    studentId: "",
    companyId: "",
    supervisorId: "",
    lecturerId: lecturers[0]?.id || "",
    startDate: "",
    endDate: "",
  });

  const unplacedStudents = students.filter((s) => !s.placementId);
  const companySupervisors = supervisors.filter((s) => s.companyId === form.companyId);

  const canNext = () => {
    switch (step) {
      case 0: return !!form.studentId;
      case 1: return !!form.companyId && !!form.supervisorId;
      case 2: return !!form.startDate && !!form.endDate && form.endDate > form.startDate;
      default: return true;
    }
  };

  const handleSubmit = () => {
    onSubmit?.(form);
    toast.success("Placement created successfully");
    onOpenChange(false);
    setStep(0);
    setForm({ studentId: "", companyId: "", supervisorId: "", lecturerId: lecturers[0]?.id || "", startDate: "", endDate: "" });
  };

  const selectedStudent = students.find((s) => s.id === form.studentId);
  const selectedCompany = companies.find((c) => c.id === form.companyId);
  const selectedSupervisor = supervisors.find((s) => s.id === form.supervisorId);
  const selectedLecturer = lecturers.find((l) => l.id === form.lecturerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Placement</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                i < step ? "bg-primary/10 text-primary" :
                i === step ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-px mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 min-h-[200px] py-2"
          >
            {step === 0 && (
              <div className="space-y-3">
                <Label>Select Student</Label>
                <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose a student..." /></SelectTrigger>
                  <SelectContent>
                    {unplacedStudents.length === 0 && (
                      <div className="p-3 text-sm text-muted-foreground text-center">All students are placed</div>
                    )}
                    {unplacedStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.regNumber}) — {s.programme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label>Supervising Lecturer</Label>
                <Select value={form.lecturerId} onValueChange={(v) => setForm({ ...form, lecturerId: v })}>
                  <SelectTrigger><SelectValue placeholder="Assign lecturer..." /></SelectTrigger>
                  <SelectContent>
                    {lecturers.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name} — {l.department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <Label>Company</Label>
                <Select value={form.companyId} onValueChange={(v) => setForm({ ...form, companyId: v, supervisorId: "" })}>
                  <SelectTrigger><SelectValue placeholder="Select company..." /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label>Industry Supervisor</Label>
                <Select value={form.supervisorId} onValueChange={(v) => setForm({ ...form, supervisorId: v })} disabled={!form.companyId}>
                  <SelectTrigger><SelectValue placeholder={form.companyId ? "Select supervisor..." : "Choose company first"} /></SelectTrigger>
                  <SelectContent>
                    {companySupervisors.length === 0 && (
                      <div className="p-3 text-sm text-muted-foreground text-center">No supervisors at this company</div>
                    )}
                    {companySupervisors.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} — {s.jobTitle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} min={form.startDate} className="mt-1" />
                  </div>
                </div>
                {form.startDate && form.endDate && form.endDate <= form.startDate && (
                  <p className="text-destructive text-xs">End date must be after start date</p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-base mb-2">Review Placement</p>
                <div className="grid gap-2 p-3 rounded-lg bg-muted/50 border">
                  <div><span className="text-muted-foreground">Student:</span> <strong>{selectedStudent?.name}</strong> ({selectedStudent?.regNumber})</div>
                  <div><span className="text-muted-foreground">Company:</span> <strong>{selectedCompany?.name}</strong></div>
                  <div><span className="text-muted-foreground">Supervisor:</span> <strong>{selectedSupervisor?.name}</strong> — {selectedSupervisor?.jobTitle}</div>
                  <div><span className="text-muted-foreground">Lecturer:</span> <strong>{selectedLecturer?.name}</strong></div>
                  <div><span className="text-muted-foreground">Period:</span> <strong>{form.startDate}</strong> to <strong>{form.endDate}</strong></div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : onOpenChange(false)} size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {step > 0 ? "Back" : "Cancel"}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} size="sm">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground" size="sm">
              <Check className="w-4 h-4 mr-1" /> Create Placement
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
