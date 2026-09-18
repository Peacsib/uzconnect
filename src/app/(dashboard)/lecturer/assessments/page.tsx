import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getLecturerAssessments } from "@/lib/queries/submissions"
import { getAllRubrics } from "@/lib/queries/academic"
import { PageHeader } from "@/components/common/page-header"
import { LecturerAssessmentsView } from "./assessments-view"

export const metadata = { title: "Assessments | UZConnect" }

export default async function LecturerAssessmentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [submissions, rubrics] = await Promise.all([
    getLecturerAssessments(session.user.id),
    getAllRubrics(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Deliverable Assessments"
        description="Grade industrial attachment progress reports, final presentations, and comprehensive portfolios."
      />
      <LecturerAssessmentsView submissions={submissions} rubrics={rubrics} />
    </div>
  )
}