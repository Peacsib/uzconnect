"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function sendMessage(receiverId: string, subject: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (!receiverId || !subject.trim() || !content.trim()) {
    throw new Error("All message fields are required")
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      subject: subject.trim(),
      content: content.trim(),
    },
  })

  revalidatePath("/student/messages")
  revalidatePath("/lecturer/messages")
  revalidatePath("/supervisor/messages")
  revalidatePath("/coordinator/messages")
  return { success: true, message }
}

export async function markMessageRead(messageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.message.update({
    where: { id: messageId, receiverId: session.user.id },
    data: { read: true },
  })

  return { success: true }
}