import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getLecturerPlacements } from "@/lib/queries/placements"
import { getLecturerAssessments } from "@/lib/queries/submissions"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { BarChart3, Users, Award, BookOpen, CheckCircle, TrendingUp } from "lucide-react"

export const metadata = { title: "Analytics | UZConnect" }

export default async function LecturerAnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [placements, submissions] = await Promise.all([
    getLecturerPlacements(session.user.id),
    getLecturerAssessments(session.user.id),
  ])

  const totalStudents = placements.length
  const totalSubmissions = submissions.length
  const gradedSubmissions = submissions.filter((s) => s.assessments.length > 0)
  const averageScore = gradedSubmissions.length > 0
    ? Math.round(
        gradedSubmissions.reduce((acc, s) => acc + (s.assessments[0]?.overallScore ?? 0), 0) /
          gradedSubmissions.length
      )
    : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supervision Analytics & Progress"
        description="Comprehensive metrics on student performance, submission rates, and cohort achievements."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assigned Students" value={totalStudents} icon={Users} subtitle="Active cohort" />
        <StatCard title="Assessment Tasks" value={totalSubmissions} icon={BookOpen} subtitle="Total deliverables" />
        <StatCard title="Graded Deliverables" value={gradedSubmissions.length} icon={CheckCircle} subtitle={`${Math.round((gradedSubmissions.length / (totalSubmissions || 1)) * 100)}% evaluated`} />
        <StatCard title="Cohort Mean Grade" value={`${averageScore}%`} icon={Award} subtitle="Average overall" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <span>Progress Breakdown</span>
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Assessment Completion</span>
                <span>{totalSubmissions > 0 ? Math.round((gradedSubmissions.length / totalSubmissions) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${totalSubmissions > 0 ? Math.round((gradedSubmissions.length / totalSubmissions) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Active Placements</span>
                <span>100%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            <span>Host Organizations Distribution</span>
          </h3>
          <div className="space-y-2 text-xs">
            {placements.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="font-medium text-foreground">{p.company.name}</span>
                <span className="text-muted-foreground">{p.student.user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}