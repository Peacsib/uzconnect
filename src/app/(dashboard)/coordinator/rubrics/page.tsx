"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, CheckCircle, Calculator, Sparkles, Building2, GraduationCap, AlertCircle, Scale } from "lucide-react";
import { format } from "date-fns";

interface Rubric {
  id: number;
  name: string;
  description: string | null;
  criteria: any;
  supervisor_weight: number;
  lecturer_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function RubricManagement() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState<Rubric | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supervisor_weight: "40",
    lecturer_weight: "60",
  });

  // Fetch rubrics
  const { data: rubrics = [], isLoading } = useQuery({
    queryKey: ["rubrics"],
    queryFn: async () => {
      try {
        const response = await api.get("/rubrics");
        const list = response?.data?.data ?? response?.data ?? [];
        return Array.isArray(list) ? (list as Rubric[]) : [];
      } catch (err) {
        console.error("Failed to fetch rubrics:", err);
        return [] as Rubric[];
      }
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });

  // Create rubric mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/rubrics", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rubrics"] });
      setDialogOpen(false);
      resetForm();
      toast.success("Rubric created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create rubric");
    },
  });

  // Update rubric mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/rubrics/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rubrics"] });
      setDialogOpen(false);
      setEditingRubric(null);
      resetForm();
      toast.success("Rubric updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update rubric");
    },
  });

  // Activate rubric mutation
  const activateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/rubrics/${id}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rubrics"] });
      toast.success("Rubric activated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to activate rubric");
    },
  });

  // Delete rubric mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/rubrics/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rubrics"] });
      toast.success("Rubric deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete rubric");
    },
  });

  // Recalculate all grades mutation
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/rubrics/recalculate-all");
      return response.data;
    },
    onSuccess: (data: any) => {
      toast.success(`Successfully recalculated ${data.data?.count || 0} assessments`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to recalculate grades");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      supervisor_weight: "40",
      lecturer_weight: "60",
    });
  };

  const handleOpenDialog = (rubric?: Rubric) => {
    if (rubric) {
      setEditingRubric(rubric);
      setFormData({
        name: rubric.name,
        description: rubric.description || "",
        supervisor_weight: rubric.supervisor_weight.toString(),
        lecturer_weight: rubric.lecturer_weight.toString(),
      });
    } else {
      setEditingRubric(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const supervisorWeight = parseFloat(formData.supervisor_weight);
    const lecturerWeight = parseFloat(formData.lecturer_weight);

    if (supervisorWeight + lecturerWeight !== 100) {
      toast.error("Weights must sum to 100%");
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description || null,
      supervisor_weight: supervisorWeight,
      lecturer_weight: lecturerWeight,
      is_active: false,
    };

    if (editingRubric) {
      updateMutation.mutate({ id: editingRubric.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleActivate = (rubric: Rubric) => {
    if (confirm(`Activate "${rubric.name}"? This will set this scheme for all active assessment calculations.`)) {
      activateMutation.mutate(rubric.id);
    }
  };

  const handleDelete = (rubric: Rubric) => {
    if (rubric.is_active) {
      toast.error("Cannot delete the active rubric");
      return;
    }
    if (confirm(`Delete "${rubric.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(rubric.id);
    }
  };

  const handleRecalculateAll = () => {
    if (confirm("Recalculate all grades using the active rubric? This will update assessment totals across the system.")) {
      recalculateMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const activeRubric = rubrics?.find((r) => r.is_active);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-[#003366] dark:text-[#ff8c00]" />
            Grading Rubrics & Weighting
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure institutional evaluation standards and proportion weights for workplace mentor vs academic assessor visits.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {activeRubric && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRecalculateAll} 
              disabled={recalculateMutation.isPending}
              className="text-xs h-9 border-border/80 hover:bg-muted/50"
            >
              <Calculator className="w-3.5 h-3.5 mr-1.5" />
              Recalculate All Grades
            </Button>
          )}
          <Button 
            size="sm"
            onClick={() => handleOpenDialog()}
            className="bg-[#003366] hover:bg-[#002244] dark:bg-[#ff8c00] dark:hover:bg-[#e07b00] text-white font-medium text-xs h-9 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Rubric
          </Button>
        </div>
      </div>

      {/* Active Rubric Card - Premium High-Contrast Redesign */}
      {activeRubric && (
        <Card className="border border-border/80 bg-card shadow-sm rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003366] via-blue-600 to-[#ff8c00] dark:from-[#ff8c00] dark:via-amber-500 dark:to-orange-600" />
          <CardHeader className="pb-3 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    Active Standard
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Applied to all active cohort assessments
                  </span>
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold mt-2 text-foreground">
                  {activeRubric.name}
                </CardTitle>
                {activeRubric.description && (
                  <CardDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {activeRubric.description}
                  </CardDescription>
                )}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleOpenDialog(activeRubric)}
                className="h-8 text-xs font-medium border-border/80 hover:bg-muted/50 sm:self-start shrink-0"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit Scheme
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Industry Workplace Mentor
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5">
                    Continuous Appraisal
                  </Badge>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
                    {activeRubric.supervisor_weight}
                  </span>
                  <span className="text-base font-semibold text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Logbook entries, technical work delivery, attendance compliance & organizational ethics.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    University Academic Assessor
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5">
                    Supervision Visits
                  </Badge>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
                    {activeRubric.lecturer_weight}
                  </span>
                  <span className="text-base font-semibold text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Physical and virtual site visits, academic oral defense, viva voce & final attachment report.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Rubrics List */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#003366] dark:text-[#ff8c00]" />
                All Assessment Rubrics
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {rubrics?.length || 0} total grading {rubrics?.length === 1 ? "scheme" : "schemes"} configured in university registry
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {!rubrics || rubrics.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calculator className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">No rubrics created yet</p>
                <p className="text-xs text-muted-foreground">Define your first grading schema to establish weighting parameters.</p>
              </div>
              <Button size="sm" onClick={() => handleOpenDialog()} className="text-xs mt-2">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Your First Rubric
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rubrics.map((rubric) => {
                const isActive = rubric.is_active;
                return (
                  <div 
                    key={rubric.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      isActive 
                        ? "border-emerald-500/40 bg-emerald-500/[0.02] shadow-sm" 
                        : "border-border/60 bg-card hover:border-border/90"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-foreground">{rubric.name}</h3>
                          {isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                              Active Scheme
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">
                              Archived / Inactive
                            </Badge>
                          )}
                        </div>
                        {rubric.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {rubric.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs mt-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Supervisor:</span>
                            <span className="font-mono font-semibold text-foreground">{rubric.supervisor_weight}%</span>
                          </div>
                          <span className="text-muted-foreground/40">•</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Lecturer:</span>
                            <span className="font-mono font-semibold text-foreground">{rubric.lecturer_weight}%</span>
                          </div>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="text-muted-foreground text-[11px]">
                            Configured {rubric.created_at ? format(new Date(rubric.created_at), "PP") : "Jan 15, 2026"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        {!isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivate(rubric)}
                            disabled={activateMutation.isPending}
                            className="h-8 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Set Active
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleOpenDialog(rubric)}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        {!isActive && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(rubric)}
                            disabled={deleteMutation.isPending}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border/80">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingRubric ? "Edit Evaluation Rubric" : "Create New Rubric"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the percentage weight proportion distributed between workplace mentor assessments and university academic inspection visits.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Rubric Scheme Name *</Label>
              <Input
                id="name"
                placeholder="e.g., UZ Work-Related Learning Framework 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">Official Description</Label>
              <Textarea
                id="description"
                placeholder="Details of the assessment weighting criteria..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="supervisor_weight" className="text-xs font-semibold">
                  Supervisor Weight (%) *
                </Label>
                <Input
                  id="supervisor_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.supervisor_weight}
                  onChange={(e) => setFormData({ ...formData, supervisor_weight: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lecturer_weight" className="text-xs font-semibold">
                  Lecturer Weight (%) *
                </Label>
                <Input
                  id="lecturer_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.lecturer_weight}
                  onChange={(e) => setFormData({ ...formData, lecturer_weight: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Weight Validation Box */}
            <div className="rounded-lg p-3 border border-border/60 bg-muted/20 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Total Proportion</span>
                <span className="font-mono">
                  {parseFloat(formData.supervisor_weight || "0") + parseFloat(formData.lecturer_weight || "0")}%
                </span>
              </div>
              <div>
                {parseFloat(formData.supervisor_weight || "0") + parseFloat(formData.lecturer_weight || "0") === 100 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" /> Balanced distribution (100% total)
                  </span>
                ) : (
                  <span className="text-rose-500 font-medium flex items-center gap-1 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" /> Weights must equal exactly 100%
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="text-xs h-9">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={
                !formData.name ||
                parseFloat(formData.supervisor_weight || "0") + parseFloat(formData.lecturer_weight || "0") !== 100 ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              className="text-xs h-9 bg-[#003366] hover:bg-[#002244] dark:bg-[#ff8c00] dark:hover:bg-[#e07b00] text-white"
            >
              {editingRubric ? "Save Changes" : "Create Scheme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
