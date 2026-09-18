import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPlacementSubmissions, getAllPlacements } from "@/lib/queries/placements"
import { getAllLecturers } from "@/lib/queries/academic"
import { PageHeader } from "@/components/common/page-header"
import { CoordinatorPlacementsView } from "./coordinator-placements-view"

export const metadata = { title: "Placement Applications | UZConnect" }

export default async function CoordinatorPlacementsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [pendingSubmissions, activePlacements, lecturers] = await Promise.all([
    getPlacementSubmissions("PENDING"),
    getAllPlacements(),
    getAllLecturers(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Approvals & Allocation"
        description="Review student industrial placement submissions, verify company hosts, and allocate university academic lecturers."
      />
      <CoordinatorPlacementsView
        pendingSubmissions={pendingSubmissions}
        activePlacements={activePlacements}
        lecturers={lecturers}
      />
    </div>
  )
}