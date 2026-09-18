"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Users, CheckCircle, Loader2 } from "lucide-react";
import { usePlacementSubmissions, usePlacements } from "@/hooks/useApi";

export default function CoordinatorOverview() {
  const { data: placementSubmissions, isLoading: submissionsLoading } = usePlacementSubmissions();
  const { data: placements, isLoading: placementsLoading } = usePlacements();

  if (submissionsLoading || placementsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const pendingCount = placementSubmissions?.filter((ps) => (ps.status as any) === "pending" || ps.status === "pending_coordinator").length || 0;
  const assignedCount = placements?.length || 0;

  const stats = [
    { label: "Pending Assignments", value: pendingCount, icon: ClipboardList, color: "text-accent" },
    { label: "Assigned", value: assignedCount, icon: CheckCircle, color: "text-primary" },
    { label: "Total Placements", value: (placementSubmissions?.length || 0), icon: Users, color: "text-muted-foreground" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">WRL Coordinator Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage placement assignments and lecturers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-border/50 hover:border-[#ff8c00]/30 hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-6 pb-5 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff8c00]/10 to-[#ffa726]/10 border border-[#ff8c00]/20 mb-3">
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-2">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
