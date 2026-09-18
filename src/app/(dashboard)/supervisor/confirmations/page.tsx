"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { placementSubmissions, students, type PlacementSubmission } from "@/utils/mockData";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { EmptyState } from "@/components/common/EmptyState";

export default function Confirmations() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<PlacementSubmission[]>(placementSubmissions);

  // In real app, filter by supervisor's email matching the submission's supervisorEmail
  const pending = subs.filter((s) => s.status === "pending_supervisor");
  const confirmed = subs.filter((s) => s.status === "active");

  const handleConfirm = (subId: string) => {
    setSubs((prev) => prev.map((s) => s.id === subId ? { ...s, status: "active" as const } : s));
    toast.success("Placement confirmed! Student can now access their logbook.");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Placement Confirmations</h1>

      {pending.length === 0 && confirmed.length === 0 ? (
        <EmptyState icon={Clock} title="No pending confirmations" description="There are no placement submissions awaiting your confirmation." />
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />Pending Confirmations ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((sub) => {
                  const stu = students.find((s) => s.id === sub.studentId);
                  return (
                    <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="space-y-1">
                              <p className="font-medium">{sub.forenames} {sub.surname}</p>
                              <p className="text-sm text-muted-foreground">{sub.companyName} — {sub.city}</p>
                              <p className="text-xs text-muted-foreground">Start: {formatDate(sub.startDate)} · Reg: {sub.regNumber}</p>
                            </div>
                            <Button onClick={() => handleConfirm(sub.id)} className="bg-primary text-primary-foreground">
                              <CheckCircle className="w-4 h-4 mr-2" />Confirm Placement
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {confirmed.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />Confirmed ({confirmed.length})
              </h2>
              <div className="space-y-2">
                {confirmed.map((sub) => (
                  <Card key={sub.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{sub.forenames} {sub.surname}</p>
                        <p className="text-xs text-muted-foreground">{sub.companyName}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor("active")}>Confirmed</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
