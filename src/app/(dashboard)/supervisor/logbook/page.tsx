import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupervisorLogbookReviews } from "@/lib/queries/logbook"
import { PageHeader } from "@/components/common/page-header"
import { SupervisorLogbookReview } from "./supervisor-review"

export const metadata = { title: "Logbook Review | UZConnect" }

export default async function SupervisorLogbookPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const entries = await getSupervisorLogbookReviews(session.user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Intern Logbook Verification"
        description="Verify on-site industrial activities performed by students and provide weekly feedback."
      />
      <SupervisorLogbookReview entries={entries} />
    </div>
  )
}