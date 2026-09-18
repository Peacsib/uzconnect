import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStudentSubmissions } from "@/lib/queries/submissions"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import { FileText, Calendar, Upload, ExternalLink, CheckCircle2, Clock } from "lucide-react"
import { SubmissionUploadModal } from "./upload-modal"

export const metadata = { title: "Submissions | UZConnect" }

export default async function StudentSubmissionsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const placement = await getStudentSubmissions(session.user.id)
  const submissions = placement?.submissions ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments & Required Submissions"
        description="Submit reports, presentations, and final logbook documentation for academic grading."
      />

      {submissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((sub) => {
            const hasAssessment = sub.assessments.length > 0
            const latestAssessment = sub.assessments[0]

            return (
              <div key={sub.id} className="bg-card rounded-xl border p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{sub.title}</h3>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          {sub.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" />
                      <span>Due Date: <strong>{formatDate(sub.dueDate)}</strong></span>
                    </div>
                    {sub.submittedAt && (
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <CheckCircle2 size={14} />
                        <span>Submitted on {formatDate(sub.submittedAt)}</span>
                      </div>
                    )}
                  </div>

                  {hasAssessment && (
                    <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Grade Awarded</span>
                        <span className="text-primary font-bold text-sm">{latestAssessment.overallScore}%</span>
                      </div>
                      {latestAssessment.comments && (
                        <p className="text-muted-foreground italic">"{latestAssessment.comments}"</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex items-center justify-between gap-2">
                  {sub.fileUrl ? (
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                    >
                      <ExternalLink size={14} />
                      View Submitted Document
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={14} />
                      Not yet submitted
                    </span>
                  )}

                  {sub.status !== "GRADED" && (
                    <SubmissionUploadModal
                      submissionId={sub.id}
                      title={sub.title}
                      currentUrl={sub.fileUrl ?? ""}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
          <FileText size={32} className="mx-auto text-muted-foreground" />
          <p className="font-medium text-foreground">No Submissions Scheduled</p>
          <p className="text-xs text-muted-foreground">
            Your assessment schedule will appear here once your placement application is approved by the coordinator.
          </p>
        </div>
      )}
    </div>
  )
}