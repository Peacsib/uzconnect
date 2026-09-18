import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getLecturerPlacements } from "@/lib/queries/placements"
import { PageHeader } from "@/components/common/page-header"
import { Building2, User, Mail, Phone, MapPin } from "lucide-react"

export const metadata = { title: "Supervisors | UZConnect" }

export default async function LecturerSupervisorsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const placements = await getLecturerPlacements(session.user.id)

  // Deduplicate supervisors
  const supervisorsMap = new Map()
  placements.forEach((p) => {
    if (!supervisorsMap.has(p.supervisor.id)) {
      supervisorsMap.set(p.supervisor.id, {
        ...p.supervisor,
        company: p.company,
        students: [p.student],
      })
    } else {
      supervisorsMap.get(p.supervisor.id).students.push(p.student)
    }
  })
  const supervisors = Array.from(supervisorsMap.values())

  return (
    <div className="space-y-6">
      <PageHeader
        title="Host Workplace Supervisors"
        description="Industry mentors and company supervisors working with your assigned students."
      />

      {supervisors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supervisors.map((s) => (
            <div key={s.id} className="bg-card rounded-xl border p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {s.user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{s.user.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.position || "Workplace Supervisor"}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 size={14} className="text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{s.company.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} className="shrink-0" />
                  <span>{s.user.email}</span>
                </div>
                {s.user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={14} className="shrink-0" />
                    <span>{s.user.phone}</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-muted/40 rounded-lg border text-xs">
                <span className="text-[11px] text-muted-foreground block mb-1">Mentees Supervised:</span>
                <div className="space-y-0.5">
                  {s.students.map((st: any) => (
                    <div key={st.id} className="font-medium text-foreground">
                      • {st.user.name} ({st.regNumber})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
          <User size={32} className="mx-auto text-muted-foreground" />
          <p className="font-medium">No Supervisors Listed</p>
          <p className="text-xs text-muted-foreground">Supervisors will appear once students are allocated.</p>
        </div>
      )}
    </div>
  )
}