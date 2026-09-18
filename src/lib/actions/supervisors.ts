"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function approveSupervisorAccount(supervisorId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "COORDINATOR") throw new Error("Unauthorized")

  await prisma.supervisor.update({
    where: { id: supervisorId },
    data: { approved: true },
  })

  revalidatePath("/coordinator/supervisors")
  return { success: true }
}