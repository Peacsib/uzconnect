import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupervisorDashboard } from "@/lib/queries/dashboard"
import { StatCard } from "@/components/common/stat-card"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import Link from "next/link"
import { Users, BookOpen, MessageSquare, Building2 } from "lucide-react"

export const metadata = { title: "Supervisor Dashboard | UZConnect" }

export default async function SupervisorOverviewPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const data = await getSupervisorDashboard(session.user.id)
  if (!data) return <div className="p-4 text-muted-foreground">Supervisor profile not found.</div>

  const { supervisor, placements, pendingLogbooks, unreadMessages } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Workplace Portal - ${session.user.name}`}
        description={`${supervisor?.company.name} • ${supervisor?.position || "Mentor"}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Company Interns" value={placements.length} icon={Users} subtitle="Students hosted" />
        <StatCard title="Logbooks Pending" value={pendingLogbooks} icon={BookOpen} subtitle="Awaiting sign-off" />
        <StatCard title="Unread Messages" value={unreadMessages} icon={MessageSquare} subtitle="Communications" />
        <StatCard title="Host Company" value={supervisor?.company.name ?? "N/A"} icon={Building2} subtitle={supervisor?.company.city ?? "Harare"} />
      </div>

      <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-base">Current Intern Attachments</h3>
          <Link href="/supervisor/students" className="text-xs text-primary font-medium hover:underline">
            View All
          </Link>
        </div>

        {placements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placements.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{p.student.user.name}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-muted-foreground">Reg: {p.student.regNumber} • {p.student.programme.name}</p>
                <div className="pt-2 flex justify-end">
                  <Link
                    href="/supervisor/logbook"
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90"
                  >
                    Verify Logs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No active interns hosted currently.</p>
        )}
      </div>
    </div>
  )
}