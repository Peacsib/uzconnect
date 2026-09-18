import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getLecturerPlacements } from "@/lib/queries/placements"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import { Building2, Calendar, MapPin, User, Mail, Phone } from "lucide-react"

export const metadata = { title: "Placements | UZConnect" }

export default async function LecturerPlacementsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const placements = await getLecturerPlacements(session.user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industrial Placement Allocations"
        description="Monitor company sites, duration, and workplace contacts for assigned student attachments."
      />

      {placements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {placements.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{p.company.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={12} />
                      {p.company.address || "Harare, Zimbabwe"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                  <span className="font-semibold text-foreground block">Intern: {p.student.user.name}</span>
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>Reg No: {p.student.regNumber}</span>
                    <span>Prog: {p.student.programme.code}</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                  <span className="font-semibold text-foreground block">Industry Supervisor</span>
                  <div className="text-muted-foreground">
                    <div>{p.supervisor.user.name} ({p.supervisor.position || "Mentor"})</div>
                    <div>{p.supervisor.user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground pt-1">
                  <Calendar size={14} className="text-primary" />
                  <span>Period: {formatDate(p.startDate)} - {formatDate(p.endDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
          <Building2 size={32} className="mx-auto text-muted-foreground" />
          <p className="font-medium">No Active Placements</p>
          <p className="text-xs text-muted-foreground">No placement allocations found for your account.</p>
        </div>
      )}
    </div>
  )
}