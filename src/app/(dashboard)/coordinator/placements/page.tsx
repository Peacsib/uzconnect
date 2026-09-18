"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UserCheck, ClipboardList, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { usePlacementSubmissions, useAssignPlacement } from "@/hooks/useApi";
import { useLecturers } from "@/hooks/useLecturerData";

export default function PlacementAssignments() {
  const { data: placementSubmissions, isLoading } = usePlacementSubmissions();
  const { data: lecturers, isLoading: lecturersLoading } = useLecturers();
  const assignPlacement = useAssignPlacement();
  const [selectedLecturer, setSelectedLecturer] = useState<Record<string, string>>({});

  if (isLoading || lecturersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const pending = placementSubmissions?.filter((s) => (s.status as any) === "pending" || s.status === "pending_coordinator") || [];
  const assigned = placementSubmissions?.filter((s) => (s.status as any) === "approved" || s.status === "active") || [];

  const handleAssign = async (subId: string) => {
    const lecId = selectedLecturer[subId];
    if (!lecId) { toast.error("Select a lecturer first"); return; }
    
    try {
      await assignPlacement.mutateAsync({
        student_id: subId,
        supervisor_id: "temp-supervisor-id",
        company_id: "temp-company-id",
        lecturer_id: lecId,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Failed to assign placement:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Placement Assignments</h1>

      {pending.length === 0 && assigned.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No placement submissions" description="Students haven't submitted placement details yet." />
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <h2 className="text-lg font-semibold">Pending Assignment ({pending.length})</h2>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Supervisor</TableHead>
                          <TableHead>Assign to Lecturer</TableHead>
                          <TableHead className="w-[100px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pending.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-mono text-sm">{sub.student_id}</TableCell>
                            <TableCell>{sub.company_name}</TableCell>
                            <TableCell>{(sub as any).company_city || sub.city}</TableCell>
                            <TableCell>{sub.supervisor_name}</TableCell>
                            <TableCell>
                              <Select value={selectedLecturer[sub.id] || ""} onValueChange={(v) => setSelectedLecturer((p) => ({ ...p, [sub.id]: v }))}>
                                <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select lecturer" /></SelectTrigger>
                                <SelectContent>
                                  {lecturers && lecturers.length > 0 ? (
                                    lecturers.map((lecturer) => (
                                      <SelectItem key={lecturer.id} value={lecturer.id}>
                                        {lecturer.name} - {lecturer.department}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-lecturers" disabled>No lecturers available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                onClick={() => handleAssign(sub.id)} 
                                className="bg-primary text-primary-foreground"
                                disabled={assignPlacement.isPending}
                              >
                                <UserCheck className="w-3.5 h-3.5 mr-1" />Assign
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {assigned.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-6">Assigned ({assigned.length})</h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assigned.map((sub) => {
                        return (
                          <TableRow key={sub.id}>
                            <TableCell className="font-mono text-sm">{sub.student_id}</TableCell>
                            <TableCell>{sub.company_name}</TableCell>
                            <TableCell><Badge variant="outline" className={getStatusColor(sub.status)}>{sub.status}</Badge></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
