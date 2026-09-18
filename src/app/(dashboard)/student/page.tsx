import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStudentDashboard } from "@/lib/queries/dashboard"
import { StatCard } from "@/components/common/stat-card"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { BookOpen, MapPin, MessageSquare, Calendar, Building2, User, ArrowRight, CheckCircle2 } from "lucide-react"

export const metadata = { title: "Student Dashboard | UZConnect" }

export default async function StudentOverviewPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const data = await getStudentDashboard(session.user.id)
  if (!data) return <div className="p-4 text-muted-foreground">Student profile not found.</div>

  const { student, placement, logbookStats, unreadMessages, upcomingDeadlines } = data
  const approved = logbookStats.find((s) => s.status === "APPROVED")?._count ?? 0
  const submitted = logbookStats.find((s) => s.status === "SUBMITTED")?._count ?? 0
  const total = logbookStats.reduce((a, s) => a + s._count, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${session.user.name}`}
        description={`${student.programme.name} (${student.programme.code}) • Reg: ${student.regNumber}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Placement Status"
          value={placement ? placement.status : "Pending"}
          icon={MapPin}
          subtitle={placement ? placement.company.name : "Submit placement"}
        />
        <StatCard
          title="Logbook Entries"
          value={total}
          icon={BookOpen}
          subtitle={`${approved} approved / ${submitted} under review`}
        />
        <StatCard
          title="Unread Messages"
          value={unreadMessages}
          icon={MessageSquare}
          subtitle="Direct communications"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={upcomingDeadlines.length}
          icon={Calendar}
          subtitle="Logbook & reports"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement card */}
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              <span>Host Placement Information</span>
            </h2>
            {placement && <StatusBadge status={placement.status} />}
          </div>

          {placement ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Company Host</span>
                <span className="font-semibold text-foreground">{placement.company.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Workplace Mentor</span>
                <span className="font-medium text-foreground">{placement.supervisor.user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Academic Supervisor</span>
                <span className="font-medium text-foreground">
                  {placement.lecturer?.user.name ?? "Allocation Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Attachment Period</span>
                <span className="font-medium text-foreground">
                  {formatDate(placement.startDate)} to {formatDate(placement.endDate)}
                </span>
              </div>
              <div className="pt-2">
                <Link
                  href="/student/placement"
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                >
                  <span>View full placement profile</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                No active placement registered yet. Submit your industrial attachment details.
              </p>
              <Link
                href="/student/submit-placement"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition shadow"
              >
                Submit Placement Now
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span>Upcoming Attachment Deadlines</span>
            </h2>
            <Link href="/student/deadlines" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </div>

          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                  <div className="flex items-center gap-3">
                    <BookOpen size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Week {d.week} Logbook</p>
                      <p className="text-xs text-muted-foreground">Due on {formatDate(d.dueDate)}</p>
                    </div>
                  </div>
                  <Link
                    href="/student/logbook"
                    className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No imminent deadlines. Keep submitting your weekly logs!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}