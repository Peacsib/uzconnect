"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { submissions, companies, placements } from "@/utils/mockData";

const submissionData = [
  { name: "Approved", value: submissions.filter((s) => s.status === "approved").length },
  { name: "Submitted", value: submissions.filter((s) => s.status === "submitted").length },
  { name: "Reviewed", value: submissions.filter((s) => s.status === "reviewed").length },
  { name: "Draft", value: submissions.filter((s) => s.status === "draft").length },
];

const companyData = companies.map((c) => ({
  name: c.name.split(" ")[0],
  students: placements.filter((p) => p.companyId === c.id).length,
}));

const COLORS = ["hsl(142 70% 45%)", "hsl(210 100% 50%)", "hsl(42 95% 50%)", "hsl(0 0% 70%)"];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Submission Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={submissionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {submissionData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Students by Company</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="hsl(210 100% 20%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
