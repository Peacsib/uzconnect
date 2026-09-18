import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllStudents, getAllProgrammes } from "@/lib/queries/academic"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import Link from "next/link"
import { Upload, Users, Search, Building2, User } from "lucide-react"

export const metadata = { title: "Students | UZConnect" }

export default async function CoordinatorStudentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [students, programmes] = await Promise.all([
    getAllStudents(),
    getAllProgrammes(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Student Roster"
        description="Comprehensive list of students eligible for and currently undertaking work-related learning."
        action={
          <Link
            href="/coordinator/students/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow"
          >
            <Upload size={16} />
            <span>Import CSV</span>
          </Link>
        }
      />

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Student Name / Reg No.</th>
                <th className="px-5 py-3 font-semibold">Programme</th>
                <th className="px-5 py-3 font-semibold">Host Organization</th>
                <th className="px-5 py-3 font-semibold">Academic Supervisor</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((st) => {
                const placement = st.placements[0]
                return (
                  <tr key={st.id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">{st.user.name}</div>
                      <div className="text-xs text-muted-foreground">{st.regNumber}</div>
                      <div className="text-xs text-muted-foreground">{st.user.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-foreground">{st.programme.code}</span>
                      <div className="text-xs text-muted-foreground">{st.programme.name}</div>
                    </td>
                    <td className="px-5 py-4">
                      {placement ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          <Building2 size={14} className="text-primary" />
                          <span>{placement.company.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No placement</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {placement?.lecturer ? (
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <User size={14} className="text-primary" />
                          <span>{placement.lecturer.user.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={placement?.status ?? "UNATTACHED"} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}