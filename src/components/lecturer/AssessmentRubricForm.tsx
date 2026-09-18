"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface RubricCriterion {
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  comment: string;
}

interface AssessmentRubricFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  assessmentId: string;
  existingScore?: number;
  existingComments?: string;
  onSubmit?: (data: { totalScore: number; comments: string; criteria: RubricCriterion[] }) => void;
}

const DEFAULT_CRITERIA: RubricCriterion[] = [
  { name: "Technical Competence", weight: 30, score: 0, maxScore: 30, comment: "" },
  { name: "Professional Conduct", weight: 20, score: 0, maxScore: 20, comment: "" },
  { name: "Communication Skills", weight: 15, score: 0, maxScore: 15, comment: "" },
  { name: "Initiative & Problem Solving", weight: 15, score: 0, maxScore: 15, comment: "" },
  { name: "Documentation Quality", weight: 20, score: 0, maxScore: 20, comment: "" },
];

export function AssessmentRubricForm({ open, onOpenChange, studentName, assessmentId, existingScore, existingComments, onSubmit }: AssessmentRubricFormProps) {
  const [criteria, setCriteria] = useState<RubricCriterion[]>(DEFAULT_CRITERIA);
  const [overallComments, setOverallComments] = useState(existingComments || "");

  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  const updateCriterion = (index: number, updates: Partial<RubricCriterion>) => {
    setCriteria((prev) => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  const handleSubmit = () => {
    onSubmit?.({ totalScore, comments: overallComments, criteria });
    toast.success(`Assessment scored: ${totalScore}/${totalWeight}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assessment Rubric — {studentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {criteria.map((c, i) => (
            <div key={c.name} className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{c.name}</span>
                <span className="text-xs text-muted-foreground">Weight: {c.weight}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  value={[c.score]}
                  onValueChange={([v]) => updateCriterion(i, { score: v })}
                  min={0}
                  max={c.maxScore}
                  step={1}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 min-w-[60px]">
                  <Input
                    type="number"
                    min={0}
                    max={c.maxScore}
                    value={c.score}
                    onChange={(e) => updateCriterion(i, { score: Math.min(c.maxScore, Math.max(0, Number(e.target.value))) })}
                    className="w-14 h-8 text-center text-sm"
                  />
                  <span className="text-xs text-muted-foreground">/ {c.maxScore}</span>
                </div>
              </div>
              <Input
                placeholder={`Comments on ${c.name.toLowerCase()}...`}
                value={c.comment}
                onChange={(e) => updateCriterion(i, { comment: e.target.value })}
                className="text-sm h-8"
              />
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
            <span className="font-semibold">Total Score</span>
            <span className="text-2xl font-bold text-primary">{totalScore}<span className="text-sm text-muted-foreground font-normal">/{totalWeight}</span></span>
          </div>

          {/* Overall comments */}
          <div>
            <Label className="text-sm">Overall Comments</Label>
            <Textarea
              value={overallComments}
              onChange={(e) => setOverallComments(e.target.value)}
              placeholder="Overall assessment comments..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
              <Check className="w-4 h-4 mr-1" /> Submit Assessment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
