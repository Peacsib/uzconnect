import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserMessages, getPotentialRecipients } from "@/lib/queries/messages"
import { PageHeader } from "@/components/common/page-header"
import { MessagesView } from "@/components/common/messages-view"

export const metadata = { title: "Messages | UZConnect" }

export default async function CoordinatorMessagesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [{ received, sent }, recipients] = await Promise.all([
    getUserMessages(session.user.id),
    getPotentialRecipients(session.user.id),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional WRL Communications"
        description="Broadcast system announcements or send direct messages to students, lecturers, and workplace supervisors."
      />
      <MessagesView
        currentUserId={session.user.id}
        received={received}
        sent={sent}
        recipients={recipients}
      />
    </div>
  )
}