"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssessmentRubricForm } from "@/components/lecturer/AssessmentRubricForm";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { useAssessments } from "@/hooks/useApi";

const MAX_ANIMATED = 10;

export default function AssessmentsReview() {
  const { data: assessments, isLoading } = useAssessments();
  const [rubricOpen, setRubricOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<typeof assessments[0] | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const openRubric = (a: typeof assessments[0]) => {
    setSelectedAssessment(a);
    setRubricOpen(true);
  };

  if (!assessments || assessments.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Assessments Review</h1>
        <EmptyState {...emptyStates.assessments} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assessments Review</h1>
      <div className="space-y-4">
        {assessments.map((a, i) => {
          const hasScore = (a.overall_score || 0) > 0;
          return (
            <motion.div
              key={a.id}
              initial={i < MAX_ANIMATED ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={i < MAX_ANIMATED ? { delay: i * 0.05 } : undefined}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Assessment — {formatDate(a.created_at || a.date || "")}</CardTitle>
                    {hasScore ? (
                      <Badge variant="outline" className={getStatusColor("graded")}>Graded</Badge>
                    ) : (
                      <Badge variant="outline" className={getStatusColor("pending")}>Pending</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Technical:</span> <strong>{a.technical_score}%</strong></div>
                    <div><span className="text-muted-foreground">Professional:</span> <strong>{a.professional_score}%</strong></div>
                    <div><span className="text-muted-foreground">Communication:</span> <strong>{a.communication_score}%</strong></div>
                    <div><span className="text-muted-foreground">Overall:</span> <strong>{a.overall_score}%</strong></div>
                    {a.comments && (
                      <div className="col-span-2"><span className="text-muted-foreground">Comments:</span> {a.comments}</div>
                    )}
                  </div>
                  <Button size="sm" onClick={() => openRubric(a)} className="bg-primary text-primary-foreground">
                    <ClipboardCheck className="w-4 h-4 mr-1" />
                    {hasScore ? "Re-evaluate" : "Grade with Rubric"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedAssessment && (
        <AssessmentRubricForm
          open={rubricOpen}
          onOpenChange={setRubricOpen}
          studentName={selectedAssessment.submission_id || selectedAssessment.student_id || ""}
          assessmentId={selectedAssessment.id}
          existingScore={selectedAssessment.overall_score}
          existingComments={selectedAssessment.comments}
        />
      )}
    </div>
  );
}
