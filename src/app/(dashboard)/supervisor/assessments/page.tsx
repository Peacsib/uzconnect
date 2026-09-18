import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupervisorAssessments } from "@/lib/queries/submissions"
import { getAllRubrics } from "@/lib/queries/academic"
import { PageHeader } from "@/components/common/page-header"
import { LecturerAssessmentsView } from "../../lecturer/assessments/assessments-view"

export const metadata = { title: "Assessments | UZConnect" }

export default async function SupervisorAssessmentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [submissions, rubrics] = await Promise.all([
    getSupervisorAssessments(session.user.id),
    getAllRubrics(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Host Employer Assessments"
        description="Provide formal industry evaluations on student performance, technical competence, and workplace culture."
      />
      <LecturerAssessmentsView submissions={submissions} rubrics={rubrics} />
    </div>
  )
}