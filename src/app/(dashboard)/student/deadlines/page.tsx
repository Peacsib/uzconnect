import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStudentLogbook } from "@/lib/queries/logbook"
import { getStudentSubmissions } from "@/lib/queries/submissions"
import { PageHeader } from "@/components/common/page-header"
import { formatDate } from "@/lib/utils"
import { Calendar, Clock, CheckCircle2, AlertCircle, BookOpen, FileText } from "lucide-react"

export const metadata = { title: "Deadlines | UZConnect" }

export default async function StudentDeadlinesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [logbookData, submissionData] = await Promise.all([
    getStudentLogbook(session.user.id),
    getStudentSubmissions(session.user.id),
  ])

  const logbookDeadlines = (logbookData?.logbookDeadlines ?? []).map((d) => {
    const entry = logbookData?.logbookEntries.find((e) => e.week === d.week)
    return {
      id: d.id,
      title: `Week ${d.week} Logbook Submission`,
      dueDate: d.dueDate,
      type: "LOGBOOK" as const,
      isCompleted: entry?.status === "APPROVED" || entry?.status === "SUBMITTED",
      status: entry?.status ?? "PENDING",
    }
  })

  const subDeadlines = (submissionData?.submissions ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    dueDate: s.dueDate,
    type: "SUBMISSION" as const,
    isCompleted: s.status === "SUBMITTED" || s.status === "GRADED",
    status: s.status,
  }))

  const allDeadlines = [...logbookDeadlines, ...subDeadlines].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  const now = new Date()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Important Deadlines & Timeline"
        description="Chronological schedule of weekly logbook submissions and academic report deliverables."
      />

      {allDeadlines.length > 0 ? (
        <div className="space-y-3">
          {allDeadlines.map((item) => {
            const isPast = new Date(item.dueDate) < now
            const isDueSoon = !isPast && (new Date(item.dueDate).getTime() - now.getTime()) < 5 * 24 * 60 * 60 * 1000

            return (
              <div
                key={item.id}
                className="bg-card rounded-xl border p-4 shadow-sm flex items-center justify-between gap-4 transition hover:border-primary/40"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      item.isCompleted
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : isDueSoon
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {item.type === "LOGBOOK" ? <BookOpen size={20} /> : <FileText size={20} />}
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Calendar size={13} className="text-primary" />
                      Due on {formatDate(item.dueDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={13} />
                      Completed
                    </span>
                  ) : isPast ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                      <AlertCircle size={13} />
                      Overdue
                    </span>
                  ) : isDueSoon ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <Clock size={13} />
                      Due Soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
          <Calendar size={32} className="mx-auto text-muted-foreground" />
          <p className="font-medium">No Deadlines Available</p>
          <p className="text-xs text-muted-foreground">
            Deadlines will be populated automatically once your placement is confirmed.
          </p>
        </div>
      )}
    </div>
  )
}