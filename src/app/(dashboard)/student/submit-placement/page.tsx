"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle, Send, CalendarIcon, Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/utils/formatters";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useSubmitProtection } from "@/hooks/useSubmitProtection";
import { useAutoSave } from "@/hooks/useAutoSave";
import { validatePlacementSubmission, getErrorMessage, hasError } from "@/utils/formValidation";
import { placementSubmissionsApi } from "@/services/api";
import { usePlacementSubmissions } from "@/hooks/useApi";

export default function SubmitPlacementDefensive() {
  const { user } = useAuth();
  const { data: submissions, isLoading: submissionsLoading } = usePlacementSubmissions();
  
  const existingSubmission = submissions?.find((ps) => ps.student_id === user?.id);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [form, setForm] = useState({
    companyName: "",
    companyAddress: "",
    city: "",
    suburb: "",
    supervisorName: "",
    supervisorPhone: "",
    supervisorEmail: "",
    studentPhone: "",
    positionTitle: "",
  });

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear validation error for this field
    setValidationErrors((errors) => errors.filter((e) => e.field !== field));
  };

  // Auto-save hook
  const { lastSaved, isSaving, clearDraft } = useAutoSave({
    key: 'placement-submission-form',
    data: { ...form, startDate, endDate },
    enabled: !existingSubmission,
    intervalMs: 30000, // 30 seconds
    onRestore: (data: any) => {
      if (data.companyName) {
        setForm({
          companyName: data.companyName || "",
          companyAddress: data.companyAddress || "",
          city: data.city || "",
          suburb: data.suburb || "",
          supervisorName: data.supervisorName || "",
          supervisorPhone: data.supervisorPhone || "",
          supervisorEmail: data.supervisorEmail || "",
          studentPhone: data.studentPhone || "",
          positionTitle: data.positionTitle || "",
        });
        if (data.startDate) setStartDate(new Date(data.startDate));
        if (data.endDate) setEndDate(new Date(data.endDate));
        toast.info("Draft restored from auto-save");
      }
    },
  });

  // Submit protection hook
  const { isSubmitting, handleSubmit: protectedSubmit } = useSubmitProtection({
    onSubmit: async (idempotencyKey: any) => {
      try {
        await placementSubmissionsApi.create({
          company_name: form.companyName,
          company_address: form.companyAddress,
          city: form.city,
          suburb: form.suburb,
          supervisor_name: form.supervisorName,
          supervisor_phone: form.supervisorPhone,
          supervisor_email: form.supervisorEmail,
          student_phone: form.studentPhone,
          start_date: startDate ? format(startDate, "yyyy-MM-dd") : "",
          end_date: endDate ? format(endDate, "yyyy-MM-dd") : "",
          position_title: form.positionTitle,
        });

        toast.success("Placement details submitted successfully!");
        await clearDraft();
        setShowConfirmation(false);
      } catch (error: any) {
        console.error("Submission error:", error);
        
        // Handle validation errors from backend
        if (error.response?.status === 422) {
          const backendErrors = error.response?.data?.errors;
          if (backendErrors) {
            const errorMessages = Object.entries(backendErrors)
              .map(([field, messages]: [string, any]) => `${field}: ${messages[0]}`)
              .join('\n');
            toast.error(`Validation failed:\n${errorMessages}`);
          } else {
            toast.error(error.response?.data?.message || "Validation failed");
          }
        } else if (error.response?.status === 409) {
          toast.error("This request has already been processed");
        } else {
          toast.error("Failed to submit placement. Please try again.");
        }
        throw error;
      }
    },
  });

  if (submissionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (existingSubmission) {
    const sub = existingSubmission;
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Submit Placement</h1>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-primary mx-auto" />
              <p className="text-lg font-medium">Placement details submitted</p>
              <p className="text-sm text-muted-foreground">Your submission is being reviewed by the WRL Coordinator.</p>
              <Badge variant="outline" className={getStatusColor(sub.status === "pending_coordinator" ? "pending" : sub.status)}>
                {sub.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span className="font-medium">{(sub.company_name || sub.companyName)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">City</span><span className="font-medium">{sub.city}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Supervisor</span><span className="font-medium">{(sub.supervisor_name || sub.supervisorName)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start Date</span><span className="font-medium">{(sub.start_date || sub.startDate)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const validation = validatePlacementSubmission({
      companyName: form.companyName,
      companyAddress: form.companyAddress,
      supervisorName: form.supervisorName,
      supervisorEmail: form.supervisorEmail,
      supervisorPhone: form.supervisorPhone,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      positionTitle: form.positionTitle,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error("Please fix the validation errors");
      return;
    }

    // Show confirmation modal
    setShowConfirmation(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Submit Placement Details</h1>
        {lastSaved && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving draft...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Draft saved {format(lastSaved, "HH:mm:ss")}</span>
              </>
            )}
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleFormSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Student Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Reg Number</Label><Input value={(user?.reg_number || (user as any)?.regNumber) || ""} disabled className="bg-muted" /></div>
                  <div><Label>Programme</Label><Input value="Computer Science" disabled className="bg-muted" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Surname</Label><Input value={user?.name?.split(" ").slice(-1)[0] || ""} disabled className="bg-muted" /></div>
                  <div><Label>Forename(s)</Label><Input value={user?.name?.split(" ").slice(0, -1).join(" ") || ""} disabled className="bg-muted" /></div>
                </div>
                <div><Label>Student Email</Label><Input value={user?.email || ""} disabled className="bg-muted" /></div>
                <div>
                  <Label>Student Phone *</Label>
                  <Input 
                    value={form.studentPhone} 
                    onChange={(e) => update("studentPhone", e.target.value)} 
                    placeholder="+263 7X XXX XXXX"
                    className={hasError(validationErrors, 'studentPhone') ? 'border-red-500' : ''}
                  />
                  {getErrorMessage(validationErrors, 'studentPhone') && (
                    <p className="text-sm text-red-600 mt-1">{getErrorMessage(validationErrors, 'studentPhone')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Company Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input 
                    value={form.companyName} 
                    onChange={(e) => update("companyName", e.target.value)} 
                    placeholder="e.g. Econet Wireless"
                    className={hasError(validationErrors, 'companyName') ? 'border-red-500' : ''}
                  />
                  {getErrorMessage(validationErrors, 'companyName') && (
                    <p className="text-sm text-red-600 mt-1">{getErrorMessage(validationErrors, 'companyName')}</p>
                  )}
                </div>
                <div>
                  <Label>Company Physical Address *</Label>
                  <Input 
                    value={form.companyAddress} 
                    onChange={(e) => update("companyAddress", e.target.value)} 
                    placeholder="Street address"
                    className={hasError(validationErrors, 'companyAddress') ? 'border-red-500' : ''}
                  />
                  {getErrorMessage(validationErrors, 'companyAddress') && (
                    <p className="text-sm text-red-600 mt-1">{getErrorMessage(validationErrors, 'companyAddress')}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City *</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Harare" /></div>
                  <div><Label>Suburb</Label><Input value={form.suburb} onChange={(e) => update("suburb", e.target.value)} placeholder="e.g. Borrowdale" /></div>
                </div>
                <div>
                  <Label>Position Title *</Label>
                  <Input 
                    value={form.positionTitle} 
                    onChange={(e) => update("positionTitle", e.target.value)} 
                    placeholder="e.g. Software Developer Intern"
                    className={hasError(validationErrors, 'positionTitle') ? 'border-red-500' : ''}
                  />
                  {getErrorMessage(validationErrors, 'positionTitle') && (
                    <p className="text-sm text-red-600 mt-1">{getErrorMessage(validationErrors, 'positionTitle')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Work Supervisor Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Supervisor Name *</Label>
                  <Input 
                    value={form.supervisorName} 
                    onChange={(e) => update("supervisorName", e.target.value)} 
                    placeholder="Full name"
                    className={hasError(validationErrors, 'supervisorName') ? 'border-red-500' : ''}
                  />
                  {getErrorMessage(validationErrors, 'supervisorName') && (
                    <p className="text-sm text-red-600 mt-1">{getErrorMessage(validationErrors, 'supervisorName')}</p>
                  )}
                </div>
                <div>
                  <Label>Supervisor Phone *</Label>
                  <Input 
                    value={form.supervisorPhone} 
                    onChange={(e) => update("supervisorPhone", e.target.value)} 
                    placeholder="+263 7X XXX XXXX"
                    className={hasError(validationErrors, 'supervisorPhone') ? 'border-red-500' : ''}
                  />
                  {getErrorMessage(validationErrors, 'supervisorPhone') && (
                    <p className="text-sm text-red-600 mt-1">{getErrorMessage(validationErrors, 'supervisorPhone')}</p>
                  )}
                </div>
                <div>
                  <Label>Supervisor Email *</Label>
                  <Input 
                    type="email" 
                    value={form.supervisorEmail} 
                    onChange={(e) => update("supervisorEmail", e.target.value)} 
                    placeholder="supervisor@company.co.zw"
                    className={hasError(validationErrors, 'supervisorEmail') ? 'border-red-500' : ''}
                  />
                  {getErrorMessage(validationErrors, 'supervisorEmail') && (
                    <p className="text-sm text-red-600 mt-1">{getErrorMessage(validationErrors, 'supervisorEmail')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Attachment Period</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start text-left font-normal", 
                          !startDate && "text-muted-foreground",
                          hasError(validationErrors, 'startDate') && 'border-red-500'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate}  className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  {getErrorMessage(validationErrors, 'startDate') && (
                    <p className="text-sm text-red-600 mt-1">{getErrorMessage(validationErrors, 'startDate')}</p>
                  )}
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start text-left font-normal", 
                          !endDate && "text-muted-foreground",
                          hasError(validationErrors, 'endDate') && 'border-red-500'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate}  className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  {getErrorMessage(validationErrors, 'endDate') && (
                    <p className="text-sm text-red-600 mt-1">{getErrorMessage(validationErrors, 'endDate')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" className="bg-primary text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Placement Details
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
        onConfirm={protectedSubmit}
        title="Confirm Placement Submission"
        description="Please review your placement details before submitting. Once submitted, you cannot make changes until it's reviewed."
        confirmText="Submit"
        cancelText="Review Again"
        data={{
          Company: form.companyName,
          Position: form.positionTitle,
          Supervisor: form.supervisorName,
          "Start Date": startDate ? format(startDate, "PPP") : "Not set",
          "End Date": endDate ? format(endDate, "PPP") : "Not set",
        }}
      />
    </div>
  );
}
