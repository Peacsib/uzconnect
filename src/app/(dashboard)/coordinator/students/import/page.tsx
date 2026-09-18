import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllProgrammes } from "@/lib/queries/academic"
import { PageHeader } from "@/components/common/page-header"
import { StudentImportClient } from "./import-client"

export const metadata = { title: "Import Students | UZConnect" }

export default async function ImportStudentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const programmes = await getAllProgrammes()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Bulk Import Students via CSV"
        description="Batch register student cohorts from university enrollment spreadsheets."
      />
      <StudentImportClient programmes={programmes} />
    </div>
  )
}