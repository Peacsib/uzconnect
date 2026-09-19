"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Building2, Mail, Phone, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface PendingSupervisor {
  id: number;
  name: string;
  email: string;
  phone: string;
  job_title: string;
  company: {
    id: number;
    name: string;
    address: string;
    city: string;
  };
  registered_at: string;
}

interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function PendingSupervisors() {
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<PendingSupervisor | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch pending supervisors
  const { data: supervisors = [], isLoading } = useQuery({
    queryKey: ["supervisors", "pending"],
    queryFn: async () => {
      try {
        const response = await api.get("/supervisors/pending");
        const list = response?.data?.data ?? response?.data ?? [];
        return Array.isArray(list) ? (list as PendingSupervisor[]) : [];
      } catch (err) {
        console.error("Failed to fetch pending supervisors:", err);
        return [] as PendingSupervisor[];
      }
    },
  });

  // Calculate stats from supervisors list (no separate API call needed!)
  const stats = useMemo(() => {
    if (!supervisors) return null;
    
    return {
      pending: supervisors.filter(s => (s as any).approval_status === 'pending').length,
      approved: supervisors.filter(s => (s as any).approval_status === 'approved').length,
      rejected: supervisors.filter(s => (s as any).approval_status === 'rejected').length,
      total: supervisors.length,
    };
  }, [supervisors]);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (supervisorId: number) => {
      const response = await api.post(`/supervisors/${supervisorId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      toast.success("Supervisor approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve supervisor");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ supervisorId, reason }: { supervisorId: number; reason: string }) => {
      const response = await api.post(`/supervisors/${supervisorId}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      setRejectDialogOpen(false);
      setSelectedSupervisor(null);
      setRejectionReason("");
      toast.success("Supervisor registration rejected");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject supervisor");
    },
  });

  const handleApprove = (supervisor: PendingSupervisor) => {
    if (confirm(`Approve ${supervisor.name} as a supervisor?`)) {
      approveMutation.mutate(supervisor.id);
    }
  };

  const handleRejectClick = (supervisor: PendingSupervisor) => {
    setSelectedSupervisor(supervisor);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedSupervisor) return;
    if (rejectionReason.trim().length < 10) {
      toast.error("Please provide a detailed reason (at least 10 characters)");
      return;
    }
    rejectMutation.mutate({
      supervisorId: selectedSupervisor.id,
      reason: rejectionReason,
    });
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supervisor Approvals</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve supervisor registrations to ensure placement verification security.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-2xl font-bold">{stats.approved}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-2xl font-bold">{stats.rejected}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Supervisors List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Registrations</CardTitle>
          <CardDescription>
            {supervisors?.length || 0} supervisor{supervisors?.length !== 1 ? "s" : ""} awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!supervisors || supervisors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending supervisor registrations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supervisors.map((supervisor: any) => (
                <Card key={supervisor.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {supervisor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{supervisor.name}</h3>
                            <Badge variant="outline" className="mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{supervisor.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{supervisor.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="w-4 h-4" />
                            <span>{supervisor.job_title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span>{supervisor.company.name}</span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Registered: {format(new Date(supervisor.registered_at), "PPp")}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(supervisor)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(supervisor)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Supervisor Registration</DialogTitle>
            <DialogDescription>
              Please provide a detailed reason for rejecting {selectedSupervisor?.name}'s registration.
              This will be sent to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Unable to verify company details, invalid contact information..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters required
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending || rejectionReason.trim().length < 10}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
