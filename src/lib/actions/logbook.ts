"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveLogbookEntry(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { placements: { orderBy: { createdAt: "desc" }, take: 1 } },
  })
  const placement = student?.placements[0]
  if (!placement) throw new Error("No active placement")

  const week = parseInt(formData.get("week") as string)
  const weekEndingDateStr = formData.get("weekEndingDate") as string
  const objectives = formData.get("objectives") as string
  const actualTasks = formData.get("actualTasks") as string
  const reflection = formData.get("reflection") as string
  const isSubmit = formData.get("action") === "submit"

  if (!week || !objectives || !actualTasks || !reflection) {
    throw new Error("All fields are required")
  }

  const weekEndingDate = weekEndingDateStr ? new Date(weekEndingDateStr) : new Date()

  const entry = await prisma.logbookEntry.upsert({
    where: {
      placementId_week: {
        placementId: placement.id,
        week,
      },
    },
    create: {
      placementId: placement.id,
      week,
      weekEndingDate,
      objectives,
      actualTasks,
      reflection,
      status: isSubmit ? "SUBMITTED" : "DRAFT",
      submittedAt: isSubmit ? new Date() : null,
    },
    update: {
      weekEndingDate,
      objectives,
      actualTasks,
      reflection,
      status: isSubmit ? "SUBMITTED" : undefined,
      submittedAt: isSubmit ? new Date() : undefined,
    },
  })

  revalidatePath("/student/logbook")
  revalidatePath("/student")
  revalidatePath("/supervisor/logbook")
  revalidatePath("/lecturer/logbook")
  return { success: true, entry }
}

export async function approveLogbookSupervisor(entryId: string, comment?: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPERVISOR") throw new Error("Unauthorized")

  const entry = await prisma.logbookEntry.update({
    where: { id: entryId },
    data: {
      supervisorApproved: true,
      supervisorComment: comment || null,
      status: "APPROVED",
    },
  })

  revalidatePath("/supervisor/logbook")
  revalidatePath("/student/logbook")
  return { success: true, entry }
}

export async function approveLogbookLecturer(entryId: string, comment?: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "LECTURER") throw new Error("Unauthorized")

  const entry = await prisma.logbookEntry.update({
    where: { id: entryId },
    data: {
      lecturerApproved: true,
      lecturerComment: comment || null,
      status: "APPROVED",
    },
  })

  revalidatePath("/lecturer/logbook")
  revalidatePath("/student/logbook")
  return { success: true, entry }
}