import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserMessages, getPotentialRecipients } from "@/lib/queries/messages"
import { PageHeader } from "@/components/common/page-header"
import { MessagesView } from "@/components/common/messages-view"

export const metadata = { title: "Messages | UZConnect" }

export default async function StudentMessagesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [{ received, sent }, recipients] = await Promise.all([
    getUserMessages(session.user.id),
    getPotentialRecipients(session.user.id),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Direct Communication & Messaging"
        description="Communicate with your academic lecturer, company supervisor, and WRL coordinator."
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