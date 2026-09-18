import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getCoordinatorDashboard } from "@/lib/queries/dashboard"
import { StatCard } from "@/components/common/stat-card"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Users, MapPin, ClipboardCheck, Building2, Upload, ArrowRight } from "lucide-react"

export const metadata = { title: "Coordinator Dashboard | UZConnect" }

export default async function CoordinatorOverviewPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const data = await getCoordinatorDashboard()
  const { totalStudents, activePlacements, pendingSubmissions, pendingSupervisors, recentSubmissions } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional WRL Management Portal"
        description="University of Zimbabwe Work-Related Learning Central Administration"
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/coordinator/students/import"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition shadow"
            >
              <Upload size={14} />
              <span>Import Students</span>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Enrolled Students" value={totalStudents} icon={Users} subtitle="All departments" />
        <StatCard title="Active Placements" value={activePlacements} icon={MapPin} subtitle="Currently placed" />
        <StatCard title="Pending Applications" value={pendingSubmissions} icon={ClipboardCheck} subtitle="Awaiting review" />
        <StatCard title="Pending Supervisors" value={pendingSupervisors} icon={Building2} subtitle="Unapproved accounts" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-base">Recent Placement Submissions</h3>
            <Link href="/coordinator/placements" className="text-xs text-primary font-medium hover:underline">
              Manage All
            </Link>
          </div>

          {recentSubmissions.length > 0 ? (
            <div className="space-y-2">
              {recentSubmissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border text-xs">
                  <div>
                    <span className="font-semibold text-foreground block">{s.student.user.name}</span>
                    <span className="text-muted-foreground">{s.companyName} • {s.student.programme.code}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No recent placement applications.</p>
          )}
        </div>

        {/* Quick Administration */}
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base border-b pb-3">Administrative Operations</h3>
          <div className="space-y-2 text-sm">
            <Link
              href="/coordinator/students/import"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition"
            >
              <div className="flex items-center gap-2.5">
                <Upload size={16} className="text-primary" />
                <span>Bulk Import Student Cohort (CSV)</span>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </Link>

            <Link
              href="/coordinator/placements"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition"
            >
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-primary" />
                <span>Review & Allocate Placement Applications</span>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </Link>

            <Link
              href="/coordinator/supervisors"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition"
            >
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-primary" />
                <span>Approve Workplace Mentor Accounts</span>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </Link>

            <Link
              href="/coordinator/rubrics"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardCheck size={16} className="text-primary" />
                <span>Manage WRL Assessment Rubrics</span>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}