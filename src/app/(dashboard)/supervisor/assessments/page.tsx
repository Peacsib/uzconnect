"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { usePlacements, useCreateAssessment } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";

interface AssessmentDraft {
  technical_score: string;
  professional_score: string;
  communication_score: string;
  comments: string;
}

export default function Assessments() {
  const { user } = useAuth();
  const { data: placements, isLoading } = usePlacements();
  const createAssessment = useCreateAssessment();

  const [drafts, setDrafts] = useState<Record<string, AssessmentDraft>>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const myPlacements = placements?.filter((p) => p.supervisor_id === user?.id) || [];

  const getDraft = (id: string): AssessmentDraft => drafts[id] || { technical_score: "", professional_score: "", communication_score: "", comments: "" };

  const updateDraft = (id: string, field: keyof AssessmentDraft, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...getDraft(id), [field]: value } }));
  };

  const handleSubmit = async (placementId: string, submissionId: string) => {
    const d = getDraft(placementId);
    const tech = Number(d.technical_score);
    const prof = Number(d.professional_score);
    const comm = Number(d.communication_score);
    
    if (isNaN(tech) || tech < 0 || tech > 100) { toast.error("Technical score must be 0-100"); return; }
    if (isNaN(prof) || prof < 0 || prof > 100) { toast.error("Professional score must be 0-100"); return; }
    if (isNaN(comm) || comm < 0 || comm > 100) { toast.error("Communication score must be 0-100"); return; }
    
    const overall = Math.round((tech + prof + comm) / 3);
    
    try {
      await createAssessment.mutateAsync({
        submission_id: submissionId,
        technical_score: tech,
        professional_score: prof,
        communication_score: comm,
        overall_score: overall,
        comments: d.comments.trim(),
      });
      setDrafts((prev) => { const copy = { ...prev }; delete copy[placementId]; return copy; });
    } catch (error) {
      console.error("Failed to submit assessment:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assessments</h1>
      {myPlacements.length === 0 ? (
        <EmptyState {...emptyStates.assessments} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {myPlacements.map((placement) => {
            const draft = getDraft(placement.id);
            return (
              <Card key={placement.id}>
                <CardHeader><CardTitle className="text-base">Student: {placement.student_id}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm">Technical Score (%)</Label>
                    <Input type="number" min={0} max={100} placeholder="0-100" className="mt-1" value={draft.technical_score} onChange={(e) => updateDraft(placement.id, "technical_score", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Professional Score (%)</Label>
                    <Input type="number" min={0} max={100} placeholder="0-100" className="mt-1" value={draft.professional_score} onChange={(e) => updateDraft(placement.id, "professional_score", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Communication Score (%)</Label>
                    <Input type="number" min={0} max={100} placeholder="0-100" className="mt-1" value={draft.communication_score} onChange={(e) => updateDraft(placement.id, "communication_score", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Comments</Label>
                    <Textarea placeholder="Add your assessment comments..." className="mt-1" rows={3} value={draft.comments} onChange={(e) => updateDraft(placement.id, "comments", e.target.value)} />
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-primary text-primary-foreground w-full" 
                    onClick={() => handleSubmit(placement.id, "temp-submission-id")}
                    disabled={createAssessment.isPending}
                  >
                    {createAssessment.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Assessment"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
