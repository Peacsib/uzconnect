"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { Building2, User, Calendar, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlacements } from "@/hooks/useApi";

export default function MyPlacement() {
  const { user } = useAuth();
  const { data: placements, isLoading } = usePlacements();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const placement = placements?.find((p) => p.student_id === user?.id);

  if (!placement) return <div className="text-center py-12 text-muted-foreground">No active placement found.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Placement</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <Building2 className="w-5 h-5 text-accent" />
            <CardTitle className="text-base">Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold text-lg">{placement.company_id}</p>
            <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" />{formatDate(placement.start_date || "")} – {formatDate(placement.end_date || "")}</div>
            <Badge variant="outline" className={`${getStatusColor(placement.status)} mt-2`}>{placement.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <User className="w-5 h-5 text-accent" />
            <CardTitle className="text-base">Supervisor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold text-lg">Supervisor ID: {placement.supervisor_id}</p>
            <p className="text-muted-foreground text-xs">Note: Full supervisor and company details will be available once backend relationships are implemented</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
