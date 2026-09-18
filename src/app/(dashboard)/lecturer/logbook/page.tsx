import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getLecturerLogbookReviews } from "@/lib/queries/logbook"
import { PageHeader } from "@/components/common/page-header"
import { LecturerLogbookReview } from "./lecturer-review"

export const metadata = { title: "Logbook Review | UZConnect" }

export default async function LecturerLogbookPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const entries = await getLecturerLogbookReviews(session.user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Weekly Logbook Reviews"
        description="Review, verify, and provide academic guidance on weekly attachment submissions."
      />
      <LecturerLogbookReview entries={entries} />
    </div>
  )
}