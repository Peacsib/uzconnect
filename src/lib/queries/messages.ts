import { prisma } from "@/lib/prisma"

export async function getUserMessages(userId: string) {
  const [received, sent] = await Promise.all([
    prisma.message.findMany({
      where: { receiverId: userId },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.findMany({
      where: { senderId: userId },
      include: { receiver: true },
      orderBy: { createdAt: "desc" },
    }),
  ])
  return { received, sent }
}

export async function getPotentialRecipients(userId: string) {
  return prisma.user.findMany({
    where: {
      id: { not: userId },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: "asc" },
  })
}