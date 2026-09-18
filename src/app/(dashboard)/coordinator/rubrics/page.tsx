import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllRubrics } from "@/lib/queries/academic"
import { PageHeader } from "@/components/common/page-header"
import { ClipboardCheck, Award, Plus, CheckCircle2 } from "lucide-react"

export const metadata = { title: "Assessment Rubrics | UZConnect" }

export default async function CoordinatorRubricsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const rubrics = await getAllRubrics()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Rubrics & Grading Standards"
        description="Standardized grading matrices, evaluation weights, and performance criteria for university and industry assessors."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Default Standard Rubric Card */}
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base">Standard WRL Assessment Matrix</h3>
              <p className="text-xs text-muted-foreground">Default institutional standard for industrial attachments</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Max Score: 100%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>1. Technical Competence & Execution</span>
                <span>33.3%</span>
              </div>
              <p className="text-muted-foreground">
                Demonstrated mastery of technical principles, system development, tooling, problem resolution, and code quality.
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>2. Professional Conduct & Initiative</span>
                <span>33.3%</span>
              </div>
              <p className="text-muted-foreground">
                Punctuality, workplace ethics, self-management, team collaboration, and proactive problem-solving.
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>3. Documentation & Technical Communication</span>
                <span>33.3%</span>
              </div>
              <p className="text-muted-foreground">
                Clarity of written weekly logbooks, comprehensive final report structure, and oral presentation delivery.
              </p>
            </div>
          </div>
        </div>

        {rubrics.map((r) => (
          <div key={r.id} className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base">{r.name}</h3>
                <p className="text-xs text-muted-foreground">{r.description || "Custom rubric"}</p>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                Max: {r.maxScore}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Applied in {r._count.assessments} recorded evaluation{r._count.assessments !== 1 ? "s" : ""}.
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}