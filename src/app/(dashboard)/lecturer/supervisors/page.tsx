"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SupervisorsCompanies() {
  // Note: This page uses mock data as supervisor/company management
  // will be enhanced with proper API endpoints in future phases
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supervisors & Companies</h1>
        <Button className="bg-primary text-primary-foreground" onClick={() => toast.info("Add supervisor/company form coming soon")}><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b"><h3 className="font-semibold">Supervisors</h3></div>
            <div className="p-8 text-center text-muted-foreground">
              <p>Supervisor management will be available once backend relationships are implemented.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b"><h3 className="font-semibold">Companies</h3></div>
            <div className="p-8 text-center text-muted-foreground">
              <p>Company management will be available once backend relationships are implemented.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
