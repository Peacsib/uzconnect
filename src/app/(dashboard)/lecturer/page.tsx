import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getLecturerDashboard } from "@/lib/queries/dashboard"
import { StatCard } from "@/components/common/stat-card"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import Link from "next/link"
import { Users, BookOpen, MessageSquare, Building2, ArrowRight } from "lucide-react"

export const metadata = { title: "Lecturer Dashboard | UZConnect" }

export default async function LecturerOverviewPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const data = await getLecturerDashboard(session.user.id)
  if (!data) return <div className="p-4 text-muted-foreground">Lecturer profile not found.</div>

  const { lecturer, placements, pendingLogbooks, unreadMessages } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Academic Portal - ${session.user.name}`}
        description={`${lecturer?.department.name} • Faculty of Science & Technology`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Allocated Students" value={placements.length} icon={Users} subtitle="Active mentees" />
        <StatCard title="Pending Logbooks" value={pendingLogbooks} icon={BookOpen} subtitle="Awaiting review" />
        <StatCard title="Host Organizations" value={new Set(placements.map((p) => p.companyId)).size} icon={Building2} subtitle="Workplace partners" />
        <StatCard title="Unread Messages" value={unreadMessages} icon={MessageSquare} subtitle="Direct inquiries" />
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-base">Assigned Students Overview</h3>
          <Link href="/lecturer/students" className="text-xs text-primary font-medium hover:underline">
            View All Roster
          </Link>
        </div>

        {placements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Reg Number</th>
                  <th className="px-4 py-2.5">Company Host</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {placements.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold">{p.student.user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.student.regNumber}</td>
                    <td className="px-4 py-3 font-medium">{p.company.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href="/lecturer/logbook" className="text-primary hover:underline font-medium">
                        Logbooks
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No students assigned to your roster yet.</p>
        )}
      </div>
    </div>
  )
}