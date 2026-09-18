import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupervisorPlacements } from "@/lib/queries/placements"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Users, Mail, Phone, Calendar, BookOpen, ArrowRight } from "lucide-react"

export const metadata = { title: "Company Interns | UZConnect" }

export default async function SupervisorStudentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const placements = await getSupervisorPlacements(session.user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Interns & Mentees"
        description="Students completing their industrial attachment at your organization under your guidance."
      />

      {placements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {placements.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                    {p.student.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{p.student.user.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.student.regNumber}</p>
                    <p className="text-xs text-muted-foreground">{p.student.programme.name}</p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} className="text-primary shrink-0" />
                  <span>{p.student.user.email}</span>
                </div>
                {p.student.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={14} className="text-primary shrink-0" />
                    <span>{p.student.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} className="text-primary shrink-0" />
                  <span>Period: {formatDate(p.startDate)} - {formatDate(p.endDate)}</span>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Academic Lecturer: {p.lecturer?.user.name ?? "Pending Assignment"}
                </span>
                <Link
                  href={`/supervisor/logbook?placementId=${p.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition shadow-sm"
                >
                  <BookOpen size={13} />
                  <span>Verify Logbooks</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
          <Users size={32} className="mx-auto text-muted-foreground" />
          <p className="font-medium">No Interns Assigned</p>
          <p className="text-xs text-muted-foreground">
            No active student attachments found at your company currently.
          </p>
        </div>
      )}
    </div>
  )
}