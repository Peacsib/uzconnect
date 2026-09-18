"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, Send, CalendarIcon, Loader2, Save, Building2, UserCheck, ShieldAlert, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import Link from "next/link";

export default function SubmitPlacementPage() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading, refetch: refetchProfile } = useStudentProfile();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [form, setForm] = useState({
    companyName: "",
    companyAddress: "",
    city: "Harare",
    suburb: "",
    supervisorName: "",
    supervisorPhone: "",
    supervisorEmail: "",
    studentPhone: "",
    positionTitle: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile?.phone && !form.studentPhone) {
      setForm((f) => ({ ...f, studentPhone: profile.phone || "" }));
    }
  }, [profile]);

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.companyName.trim()) errs.companyName = "Company name is required";
    if (!form.companyAddress.trim()) errs.companyAddress = "Company address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.positionTitle.trim()) errs.positionTitle = "Position title is required";
    if (!form.supervisorName.trim()) errs.supervisorName = "Supervisor name is required";
    if (!form.supervisorEmail.trim()) errs.supervisorEmail = "Supervisor email is required";
    if (!form.supervisorPhone.trim()) errs.supervisorPhone = "Supervisor phone is required";
    if (!startDate) errs.startDate = "Start date is required";
    if (!endDate) errs.endDate = "End date is required";

    if (startDate && endDate && startDate >= endDate) {
      errs.endDate = "End date must be after start date";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields");
      return;
    }
    setShowConfirmation(true);
  };

  const executeSubmission = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/placements/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: user?.email || profile?.email,
          companyName: form.companyName,
          companyAddress: form.companyAddress,
          companyCity: form.city,
          supervisorName: form.supervisorName,
          supervisorEmail: form.supervisorEmail,
          supervisorPhone: form.supervisorPhone,
          positionTitle: form.positionTitle,
          startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Placement submitted successfully to Coordinator Jameson Sibanda!");
        setShowConfirmation(false);
        await refetchProfile();
      } else {
        toast.error(json.error || "Failed to submit placement details");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while submitting placement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
        <p className="text-sm text-muted-foreground">Checking placement records...</p>
      </div>
    );
  }

  // Active Placement Record
  if (profile?.activePlacement) {
    const p = profile.activePlacement;
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Placement Status</h1>
          <p className="text-sm text-muted-foreground">Your industrial attachment is active and accredited.</p>
        </div>

        <Card className="border-emerald-300 dark:border-emerald-800 shadow-md overflow-hidden bg-card">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Active Attachment
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">ID: {p.id}</span>
              </div>
              <Link href="/student/logbook">
                <Button size="sm" className="bg-[#ff8c00] hover:bg-[#e07b00] text-slate-950 font-semibold text-xs">
                  Open Logbook
                </Button>
              </Link>
            </div>
            <CardTitle className="text-xl font-bold mt-2">
              {p.company?.name || "Host Company"}
            </CardTitle>
            <CardDescription className="text-sm">
              {p.company?.address || "Harare, Zimbabwe"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Industrial Supervisor</span>
                <p className="font-medium text-foreground mt-0.5">{p.supervisor?.user?.name || "Appointed Mentor"}</p>
                <p className="text-xs text-muted-foreground">{p.supervisor?.user?.email || "supervisor@company.co.zw"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Attachment Period</span>
                <p className="font-medium text-foreground mt-0.5">
                  {p.startDate ? format(new Date(p.startDate), "PPP") : "Pending"} – {p.endDate ? format(new Date(p.endDate), "PPP") : "Pending"}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Standard 30-Week Session</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending Submission Record
  if (profile?.latestSubmission && profile.latestSubmission.status === "PENDING") {
    const sub = profile.latestSubmission;
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Placement Submission Status</h1>
          <p className="text-sm text-muted-foreground">Your industrial attachment details have been submitted.</p>
        </div>

        <Card className="border-amber-400/70 dark:border-amber-700/60 shadow-md overflow-hidden bg-card">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 to-[#ff8c00]" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 font-semibold text-xs">
                <Clock className="w-3.5 h-3.5 mr-1 animate-spin" />
                Under Coordinator Verification
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Submitted {format(new Date(sub.createdAt), "PPP")}
              </span>
            </div>
            <CardTitle className="text-xl font-bold mt-2">
              {sub.companyName}
            </CardTitle>
            <CardDescription className="text-sm">
              {sub.companyAddress}, {sub.companyCity}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300/40 dark:border-amber-800/40 space-y-2">
              <p className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2 text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                University Verification in Progress
              </p>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                Your placement submission has been recorded in the University of Zimbabwe central placement registry and is currently pending review by WRL Coordinator <strong>Jameson Sibanda</strong>. Once approved, your logbook will become active.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border/50 text-xs">
              <div>
                <span className="text-muted-foreground uppercase font-semibold">Position Title</span>
                <p className="font-medium text-foreground text-sm mt-0.5">{sub.position}</p>
              </div>
              <div>
                <span className="text-muted-foreground uppercase font-semibold">Industry Supervisor</span>
                <p className="font-medium text-foreground text-sm mt-0.5">{sub.supervisorName}</p>
                <p className="text-muted-foreground">{sub.supervisorEmail} • {sub.supervisorPhone}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-muted-foreground uppercase font-semibold">Attachment Duration</span>
                <p className="font-medium text-foreground text-sm mt-0.5">
                  {format(new Date(sub.startDate), "PPP")} – {format(new Date(sub.endDate), "PPP")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submission Form
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Submit Placement Details</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Provide your accredited host organization and industrial supervisor details for institutional clearance.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Student Information (Locked from DB) */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Student Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Academic details verified from university database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Registration Number</Label>
                    <Input 
                      value={profile?.regNumber || user?.reg_number || "R2421428"} 
                      disabled 
                      className="bg-muted font-mono font-bold text-xs" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Programme Code</Label>
                    <Input 
                      value={profile?.programme?.code || "HBMSDA"} 
                      disabled 
                      className="bg-muted font-mono font-bold text-xs" 
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Degree Programme</Label>
                  <Input 
                    value={profile?.programme?.name || "BSc Honours Business Management and Analytics"} 
                    disabled 
                    className="bg-muted text-xs font-medium" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Full Name</Label>
                    <Input 
                      value={profile?.name || user?.name || "Peace Sibanda"} 
                      disabled 
                      className="bg-muted text-xs font-medium" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs">UZ Student Email</Label>
                    <Input 
                      value={profile?.email || user?.email || "r2421428@uofzmail.uz.ac.zw"} 
                      disabled 
                      className="bg-muted text-xs" 
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Student Contact Phone *</Label>
                  <Input 
                    value={form.studentPhone} 
                    onChange={(e) => update("studentPhone", e.target.value)} 
                    placeholder="+263 77 123 4567"
                    className={errors.studentPhone ? "border-red-500 text-xs" : "text-xs"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Host Employer Details */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Host Employer Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Company or organization where you will be attached.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs">Organization / Company Name *</Label>
                  <Input 
                    value={form.companyName} 
                    onChange={(e) => update("companyName", e.target.value)} 
                    placeholder="e.g. Econet Wireless Zimbabwe / Delta Corporation"
                    className={errors.companyName ? "border-red-500 text-xs" : "text-xs"}
                  />
                  {errors.companyName && <p className="text-[11px] text-red-500 mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <Label className="text-xs">Physical Address *</Label>
                  <Input 
                    value={form.companyAddress} 
                    onChange={(e) => update("companyAddress", e.target.value)} 
                    placeholder="e.g. 2 Old Mutare Road, Msasa"
                    className={errors.companyAddress ? "border-red-500 text-xs" : "text-xs"}
                  />
                  {errors.companyAddress && <p className="text-[11px] text-red-500 mt-1">{errors.companyAddress}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">City / Town *</Label>
                    <Input 
                      value={form.city} 
                      onChange={(e) => update("city", e.target.value)} 
                      placeholder="e.g. Harare"
                      className={errors.city ? "border-red-500 text-xs" : "text-xs"}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Suburb / Industrial Area</Label>
                    <Input 
                      value={form.suburb} 
                      onChange={(e) => update("suburb", e.target.value)} 
                      placeholder="e.g. Graniteside"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Internship / Position Title *</Label>
                  <Input 
                    value={form.positionTitle} 
                    onChange={(e) => update("positionTitle", e.target.value)} 
                    placeholder="e.g. Business Intelligence Intern / WRL Trainee"
                    className={errors.positionTitle ? "border-red-500 text-xs" : "text-xs"}
                  />
                  {errors.positionTitle && <p className="text-[11px] text-red-500 mt-1">{errors.positionTitle}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Industrial Work Supervisor Details */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Industrial Supervisor
                </CardTitle>
                <CardDescription className="text-xs">
                  Company manager who will oversee and grade your work.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs">Supervisor Full Name *</Label>
                  <Input 
                    value={form.supervisorName} 
                    onChange={(e) => update("supervisorName", e.target.value)} 
                    placeholder="e.g. Eng. T. Ndlovu / Ms. S. Moyo"
                    className={errors.supervisorName ? "border-red-500 text-xs" : "text-xs"}
                  />
                  {errors.supervisorName && <p className="text-[11px] text-red-500 mt-1">{errors.supervisorName}</p>}
                </div>

                <div>
                  <Label className="text-xs">Supervisor Email Address *</Label>
                  <Input 
                    type="email"
                    value={form.supervisorEmail} 
                    onChange={(e) => update("supervisorEmail", e.target.value)} 
                    placeholder="supervisor@company.co.zw"
                    className={errors.supervisorEmail ? "border-red-500 text-xs" : "text-xs"}
                  />
                  {errors.supervisorEmail && <p className="text-[11px] text-red-500 mt-1">{errors.supervisorEmail}</p>}
                </div>

                <div>
                  <Label className="text-xs">Supervisor Contact Phone *</Label>
                  <Input 
                    value={form.supervisorPhone} 
                    onChange={(e) => update("supervisorPhone", e.target.value)} 
                    placeholder="+263 77 200 0000"
                    className={errors.supervisorPhone ? "border-red-500 text-xs" : "text-xs"}
                  />
                  {errors.supervisorPhone && <p className="text-[11px] text-red-500 mt-1">{errors.supervisorPhone}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Attachment Period */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  Attachment Duration
                </CardTitle>
                <CardDescription className="text-xs">
                  Minimum 30 weeks per University of Zimbabwe WRL guidelines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs">Attachment Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start text-left font-normal text-xs h-9", 
                          !startDate && "text-muted-foreground",
                          errors.startDate && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {startDate ? format(startDate, "PPP") : "Pick starting date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && <p className="text-[11px] text-red-500 mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <Label className="text-xs">Expected Completion Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start text-left font-normal text-xs h-9", 
                          !endDate && "text-muted-foreground",
                          errors.endDate && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {endDate ? format(endDate, "PPP") : "Pick completion date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && <p className="text-[11px] text-red-500 mt-1">{errors.endDate}</p>}
                </div>

                <div className="pt-2 text-[11px] text-muted-foreground leading-relaxed">
                  Tip: Most standard sessions run from <strong>October 2026</strong> through <strong>May 2027</strong>.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              className="bg-[#003366] hover:bg-[#002244] text-white font-semibold shadow-md px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting to Coordinator...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Placement for Approval
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={executeSubmission}
        title="Confirm Placement Submission"
        description="Please confirm your host employer details. This will be transmitted directly to WRL Coordinator Jameson Sibanda for institutional verification."
        confirmText="Confirm & Submit"
        cancelText="Review Again"
        data={{
          "Student": profile?.name || user?.name || "Student",
          "Reg Number": profile?.regNumber || user?.reg_number || "R2421428",
          "Host Company": form.companyName,
          "Position": form.positionTitle,
          "Supervisor": form.supervisorName,
          "City": form.city,
          "Start Date": startDate ? format(startDate, "PPP") : "Not specified",
          "End Date": endDate ? format(endDate, "PPP") : "Not specified",
        }}
      />
    </div>
  );
}
