"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { getStatusColor } from "@/utils/formatters";
import { usePlacements } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";

export default function MyStudents() {
  const { user } = useAuth();
  const { data: placements, isLoading } = usePlacements();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const myPlacements = placements?.filter((p) => p.supervisor_id === user?.id) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Students</h1>
      {myPlacements.length === 0 ? (
        <EmptyState {...emptyStates.students} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Placement Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPlacements.map((placement) => (
                  <TableRow key={placement.id}>
                    <TableCell className="font-mono text-sm">{placement.student_id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{placement.start_date} - {placement.end_date}</TableCell>
                    <TableCell><Badge variant="outline" className={getStatusColor(placement.status)}>{placement.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
