import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStudentSubmissions } from "@/lib/queries/submissions"
import { getStudentLogbook } from "@/lib/queries/logbook"
import { PageHeader } from "@/components/common/page-header"
import { formatDate } from "@/lib/utils"
import { Star, MessageSquare, Award, BookOpen, CheckCircle } from "lucide-react"

export const metadata = { title: "Feedback | UZConnect" }

export default async function StudentFeedbackPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [submissionData, logbookData] = await Promise.all([
    getStudentSubmissions(session.user.id),
    getStudentLogbook(session.user.id),
  ])

  const assessedSubmissions = (submissionData?.submissions ?? []).filter((s) => s.assessments.length > 0)
  const commentedLogbooks = (logbookData?.logbookEntries ?? []).filter(
    (e) => e.supervisorComment || e.lecturerComment
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supervision Feedback & Assessment Scores"
        description="Comprehensive evaluation records, rubric grading, and mentor comments."
      />

      <div className="space-y-6">
        {/* Assessment rubric reviews */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Award size={18} className="text-primary" />
            <span>Academic & Industrial Report Evaluations</span>
          </h3>

          {assessedSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessedSubmissions.map((sub) => {
                const assessment = sub.assessments[0]
                return (
                  <div key={sub.id} className="bg-card rounded-xl border p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h4 className="font-semibold text-base">{sub.title}</h4>
                      <span className="text-lg font-bold text-primary">{assessment.overallScore}%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Technical</span>
                        <span className="font-bold text-foreground">{assessment.technicalScore}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Professional</span>
                        <span className="font-bold text-foreground">{assessment.professionalScore}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Communication</span>
                        <span className="font-bold text-foreground">{assessment.communicationScore}%</span>
                      </div>
                    </div>

                    {assessment.comments && (
                      <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
                        <span className="font-semibold text-muted-foreground flex items-center gap-1">
                          <MessageSquare size={12} />
                          Assessor Remarks
                        </span>
                        <p className="italic text-foreground">"{assessment.comments}"</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 border rounded-xl bg-card text-center text-xs text-muted-foreground">
              No assessed report submissions yet.
            </div>
          )}
        </div>

        {/* Weekly Logbook comments */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <BookOpen size={18} className="text-primary" />
            <span>Weekly Logbook Supervisor Comments</span>
          </h3>

          {commentedLogbooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commentedLogbooks.map((entry) => (
                <div key={entry.id} className="bg-card rounded-xl border p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-semibold text-sm">Week {entry.week} Logbook</span>
                    <span className="text-xs text-muted-foreground">{formatDate(entry.weekEndingDate)}</span>
                  </div>

                  {entry.supervisorComment && (
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-primary">Industry Supervisor:</span>
                      <p className="text-muted-foreground italic">"{entry.supervisorComment}"</p>
                    </div>
                  )}

                  {entry.lecturerComment && (
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-primary">Academic Supervisor:</span>
                      <p className="text-muted-foreground italic">"{entry.lecturerComment}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border rounded-xl bg-card text-center text-xs text-muted-foreground">
              No weekly supervisor remarks recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}