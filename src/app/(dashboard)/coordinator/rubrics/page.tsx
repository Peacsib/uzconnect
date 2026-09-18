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
import { Plus, Edit, Trash2, CheckCircle, Calculator } from "lucide-react";
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
  const { data: rubrics, isLoading } = useQuery({
    queryKey: ["rubrics"],
    queryFn: async () => {
      const response = await api.get("/rubrics");
      return response.data.data as Rubric[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour - rubrics rarely change
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
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
      toast.success(`Successfully recalculated ${data.data.count} assessments`);
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
    if (confirm(`Activate "${rubric.name}"? This will deactivate the current active rubric.`)) {
      activateMutation.mutate(rubric.id);
    }
  };

  const handleDelete = (rubric: Rubric) => {
    if (rubric.is_active) {
      toast.error("Cannot delete active rubric");
      return;
    }
    if (confirm(`Delete "${rubric.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(rubric.id);
    }
  };

  const handleRecalculateAll = () => {
    if (confirm("Recalculate all grades using the active rubric? This will update all assessment grades.")) {
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grading Rubrics</h1>
          <p className="text-muted-foreground mt-2">
            Manage grading rubrics and configure supervisor/lecturer weights
          </p>
        </div>
        <div className="flex gap-2">
          {activeRubric && (
            <Button variant="outline" onClick={handleRecalculateAll} disabled={recalculateMutation.isPending}>
              <Calculator className="w-4 h-4 mr-2" />
              Recalculate All Grades
            </Button>
          )}
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Create Rubric
          </Button>
        </div>
      </div>

      {/* Active Rubric Card */}
      {activeRubric && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Active Rubric
                </CardTitle>
                <CardDescription className="text-green-700">
                  Currently used for all grade calculations
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-600">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{activeRubric.name}</h3>
                {activeRubric.description && (
                  <p className="text-sm text-muted-foreground mt-1">{activeRubric.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 border">
                  <p className="text-xs text-muted-foreground">Supervisor Weight</p>
                  <p className="text-2xl font-bold text-blue-600">{activeRubric.supervisor_weight}%</p>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="text-xs text-muted-foreground">Lecturer Weight</p>
                  <p className="text-2xl font-bold text-purple-600">{activeRubric.lecturer_weight}%</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenDialog(activeRubric)}>
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Rubrics List */}
      <Card>
        <CardHeader>
          <CardTitle>All Rubrics</CardTitle>
          <CardDescription>
            {rubrics?.length || 0} rubric{rubrics?.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!rubrics || rubrics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rubrics created yet</p>
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
                Create Your First Rubric
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rubrics.map((rubric) => (
                <Card key={rubric.id} className={rubric.is_active ? "border-green-200" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{rubric.name}</h3>
                          {rubric.is_active && (
                            <Badge variant="default" className="bg-green-600">Active</Badge>
                          )}
                        </div>
                        {rubric.description && (
                          <p className="text-sm text-muted-foreground mb-3">{rubric.description}</p>
                        )}
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Supervisor:</span>{" "}
                            <span className="font-semibold">{rubric.supervisor_weight}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Lecturer:</span>{" "}
                            <span className="font-semibold">{rubric.lecturer_weight}%</span>
                          </div>
                          <div className="text-muted-foreground">
                            Created {format(new Date(rubric.created_at), "PP")}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!rubric.is_active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivate(rubric)}
                            disabled={activateMutation.isPending}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activate
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(rubric)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {!rubric.is_active && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(rubric)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRubric ? "Edit Rubric" : "Create New Rubric"}</DialogTitle>
            <DialogDescription>
              Configure grading weights for supervisor and lecturer assessments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rubric Name *</Label>
              <Input
                id="name"
                placeholder="e.g., WRL Assessment 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description of this rubric"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supervisor_weight">Supervisor Weight (%) *</Label>
                <Input
                  id="supervisor_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.supervisor_weight}
                  onChange={(e) => setFormData({ ...formData, supervisor_weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lecturer_weight">Lecturer Weight (%) *</Label>
                <Input
                  id="lecturer_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.lecturer_weight}
                  onChange={(e) => setFormData({ ...formData, lecturer_weight: e.target.value })}
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              <p className="font-medium mb-1">Weight Validation</p>
              <p>
                Total: {parseFloat(formData.supervisor_weight || "0") + parseFloat(formData.lecturer_weight || "0")}%
                {parseFloat(formData.supervisor_weight || "0") + parseFloat(formData.lecturer_weight || "0") === 100 ? (
                  <span className="text-green-600 ml-2">✓ Valid</span>
                ) : (
                  <span className="text-red-600 ml-2">✗ Must equal 100%</span>
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name ||
                parseFloat(formData.supervisor_weight || "0") + parseFloat(formData.lecturer_weight || "0") !== 100 ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editingRubric ? "Update" : "Create"} Rubric
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
