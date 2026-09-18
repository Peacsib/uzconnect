import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getLecturerPlacements } from "@/lib/queries/placements"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Users, Mail, Phone, Building2, MapPin, ArrowRight, BookOpen } from "lucide-react"

export const metadata = { title: "Assigned Students | UZConnect" }

export default async function LecturerStudentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const placements = await getLecturerPlacements(session.user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Students"
        description="Students allocated to you for academic supervision during their work-related learning."
      />

      {placements.length > 0 ? (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student Name / Reg No.</th>
                  <th className="px-5 py-3 font-semibold">Programme</th>
                  <th className="px-5 py-3 font-semibold">Company Host</th>
                  <th className="px-5 py-3 font-semibold">Workplace Supervisor</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {placements.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">{p.student.user.name}</div>
                      <div className="text-xs text-muted-foreground">{p.student.regNumber}</div>
                      <div className="text-xs text-muted-foreground">{p.student.user.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-foreground">{p.student.programme.code}</span>
                      <div className="text-xs text-muted-foreground">{p.student.programme.name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium flex items-center gap-1.5">
                        <Building2 size={14} className="text-primary" />
                        <span>{p.company.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{p.company.city || "Harare"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{p.supervisor.user.name}</div>
                      <div className="text-xs text-muted-foreground">{p.supervisor.user.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/lecturer/logbook?placementId=${p.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                      >
                        <BookOpen size={13} />
                        <span>Logbooks</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
          <Users size={32} className="mx-auto text-muted-foreground" />
          <p className="font-medium">No Students Allocated</p>
          <p className="text-xs text-muted-foreground">
            The WRL coordinator has not yet assigned any students to your supervision roster.
          </p>
        </div>
      )}
    </div>
  )
}