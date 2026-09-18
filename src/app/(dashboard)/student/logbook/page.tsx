import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStudentLogbook } from "@/lib/queries/logbook"
import { PageHeader } from "@/components/common/page-header"
import { LogbookView } from "./logbook-view"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

export const metadata = { title: "Logbook | UZConnect" }

export default async function StudentLogbookPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const placement = await getStudentLogbook(session.user.id)

  if (!placement) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Weekly Industrial Logbook"
          description="Record your weekly learning objectives, industrial activities, and reflections."
        />
        <div className="bg-card rounded-xl border p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <BookOpen size={28} />
          </div>
          <h2 className="text-lg font-bold">No Active Placement Found</h2>
          <p className="text-sm text-muted-foreground">
            You must have an approved work-related learning placement before you can submit weekly logbooks.
          </p>
          <Link
            href="/student/submit-placement"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow"
          >
            Submit Placement
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Industrial Logbook"
        description={`Log your weekly progress at ${placement.company.name}. Entries are verified by your supervisor.`}
      />
      <LogbookView
        placementId={placement.id}
        entries={placement.logbookEntries}
        deadlines={placement.logbookDeadlines}
      />
    </div>
  )
}