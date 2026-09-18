import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStudentPlacement } from "@/lib/queries/placements"
import { PageHeader } from "@/components/common/page-header"
import { SubmitPlacementForm } from "./placement-form"

export const metadata = { title: "Submit Placement | UZConnect" }

export default async function SubmitPlacementPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const student = await getStudentPlacement(session.user.id)
  const activePlacement = student?.placements?.[0]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Submit Work-Related Learning Placement"
        description="Register your industrial attachment details, company location, and workplace mentor for university verification."
      />

      {activePlacement ? (
        <div className="bg-muted/40 border rounded-xl p-6 text-center space-y-3">
          <p className="font-semibold text-foreground">You already have an active placement at {activePlacement.company.name}.</p>
          <p className="text-sm text-muted-foreground">If you need to change your placement details, please contact your WRL coordinator.</p>
        </div>
      ) : (
        <SubmitPlacementForm />
      )}
    </div>
  )
}