"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/formatters";
import { Check, X, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { usePlacements, useSubmissions } from "@/hooks/useApi";

export default function SubmissionsReview() {
  const { user } = useAuth();
  const { data: placements, isLoading: placementsLoading } = usePlacements();
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions();

  if (placementsLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const myStudentIds = placements?.filter((p) => p.supervisor_id === user?.id).map((p) => p.student_id) || [];
  const pendingSubs = submissions?.filter((s) => myStudentIds.includes(s.student_id) && s.status === "submitted") || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Submissions Review</h1>
      {pendingSubs.length === 0 ? (
        <EmptyState {...emptyStates.submissions} title="No pending submissions" description="All submissions have been reviewed. Check back later." />
      ) : (
        <div className="space-y-3">
          {pendingSubs.map((sub) => {
            return (
              <Card key={sub.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sub.title}</p>
                    <p className="text-sm text-muted-foreground">Student: {sub.student_id} · Due {formatDate(sub.due_date || "")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.info("PDF viewer would open here")}><MessageSquare className="w-4 h-4" /></Button>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => toast.success("Approved!")}><Check className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => toast.error("Rejected")}><X className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
