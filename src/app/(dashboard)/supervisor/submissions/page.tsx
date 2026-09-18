import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupervisorAssessments } from "@/lib/queries/submissions"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import { FileText, ExternalLink, Calendar } from "lucide-react"

export const metadata = { title: "Submissions | UZConnect" }

export default async function SupervisorSubmissionsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const submissions = await getSupervisorAssessments(session.user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intern Deliverables & Submissions"
        description="Review reports, portfolios, and presentations prepared by interns at your company."
      />

      {submissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base">{sub.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {sub.placement.student.user.name} ({sub.placement.student.regNumber})
                  </p>
                </div>
                <StatusBadge status={sub.status} />
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Programme: {sub.placement.student.programme.name}</div>
                <div>Due Date: {formatDate(sub.dueDate)}</div>
                {sub.submittedAt && (
                  <div className="text-green-600 dark:text-green-400">
                    Submitted: {formatDate(sub.submittedAt)}
                  </div>
                )}
              </div>

              {sub.fileUrl && (
                <div className="pt-2 border-t">
                  <a
                    href={sub.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                  >
                    <ExternalLink size={13} />
                    <span>View Submitted File</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
          <FileText size={32} className="mx-auto text-muted-foreground" />
          <p className="font-medium">No Submissions Found</p>
          <p className="text-xs text-muted-foreground">Student deliverables will appear here.</p>
        </div>
      )}
    </div>
  )
}