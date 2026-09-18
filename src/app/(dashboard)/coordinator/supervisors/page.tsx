import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllSupervisors } from "@/lib/queries/academic"
import { PageHeader } from "@/components/common/page-header"
import { SupervisorApprovalList } from "./supervisor-approval-list"

export const metadata = { title: "Supervisors | UZConnect" }

export default async function CoordinatorSupervisorsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const supervisors = await getAllSupervisors()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Host Workplace Mentors & Supervisors"
        description="Verify and approve company supervisor accounts, review company affiliations, and oversee mentee assignments."
      />
      <SupervisorApprovalList supervisors={supervisors} />
    </div>
  )
}