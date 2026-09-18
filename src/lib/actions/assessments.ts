"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function gradeSubmission(data: {
  submissionId: string
  technicalScore: number
  professionalScore: number
  communicationScore: number
  comments?: string
  rubricId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "LECTURER" && session.user.role !== "SUPERVISOR") {
    throw new Error("Only lecturers and supervisors can submit assessments")
  }

  const overallScore = Math.round(
    ((data.technicalScore + data.professionalScore + data.communicationScore) / 3) * 10
  ) / 10

  const assessment = await prisma.assessment.create({
    data: {
      submissionId: data.submissionId,
      assessorId: session.user.id,
      technicalScore: data.technicalScore,
      professionalScore: data.professionalScore,
      communicationScore: data.communicationScore,
      overallScore,
      comments: data.comments || null,
      rubricId: data.rubricId || null,
    },
  })

  await prisma.submission.update({
    where: { id: data.submissionId },
    data: { status: "GRADED" },
  })

  revalidatePath("/lecturer/assessments")
  revalidatePath("/supervisor/assessments")
  revalidatePath("/student/feedback")
  return { success: true, assessment }
}