"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDate } from "@/utils/formatters";
import { Star, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { useAssessments } from "@/hooks/useApi";

export default function Feedback() {
  const { user } = useAuth();
  const { data: assessments, isLoading } = useAssessments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const myAssessments = assessments || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feedback & Assessments</h1>
      {myAssessments.length === 0 ? (
        <EmptyState {...emptyStates.assessments} />
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {myAssessments.map((a) => (
            <AccordionItem key={a.id} value={a.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <Star className="w-4 h-4 text-accent" />
                  <div>
                    <p className="font-medium text-sm">Assessment – {formatDate(a.created_at || a.date || "")}</p>
                    <p className="text-xs text-muted-foreground">
                      Overall Score: {a.overall_score}%
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Technical</p>
                    <p className="font-semibold">{a.technical_score}%</p>
                  </div>
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Professional</p>
                    <p className="font-semibold">{a.professional_score}%</p>
                  </div>
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Communication</p>
                    <p className="font-semibold">{a.communication_score}%</p>
                  </div>
                </div>
                {a.comments && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Comments</p>
                    <p className="text-sm">{a.comments}</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
