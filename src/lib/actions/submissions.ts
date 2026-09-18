"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function uploadSubmission(submissionId: string, fileUrl: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      fileUrl,
      submittedAt: new Date(),
      status: "SUBMITTED",
    },
  })

  revalidatePath("/student/submissions")
  revalidatePath("/lecturer/assessments")
  revalidatePath("/supervisor/submissions")
  return { success: true }
}