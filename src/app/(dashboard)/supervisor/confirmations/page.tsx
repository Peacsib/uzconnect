import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupervisorPlacements } from "@/lib/queries/placements"
import { PageHeader } from "@/components/common/page-header"
import { formatDate } from "@/lib/utils"
import { ClipboardCheck, CheckCircle2, Building2, Calendar, User } from "lucide-react"

export const metadata = { title: "Confirmations | UZConnect" }

export default async function SupervisorConfirmationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const placements = await getSupervisorPlacements(session.user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Confirmations & Letters"
        description="Verify host company acceptance letters and formal placement agreements."
      />

      {placements.length > 0 ? (
        <div className="space-y-4">
          {placements.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-foreground">{p.student.user.name}</span>
                  <span className="text-xs text-muted-foreground">({p.student.regNumber})</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-primary" />
                    {p.company.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" />
                    {formatDate(p.startDate)} - {formatDate(p.endDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg">
                <CheckCircle2 size={16} />
                <span>Placement Verified</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
          <ClipboardCheck size={32} className="mx-auto text-muted-foreground" />
          <p className="font-medium">No Placement Confirmations Pending</p>
          <p className="text-xs text-muted-foreground">All company attachments are currently verified.</p>
        </div>
      )}
    </div>
  )
}