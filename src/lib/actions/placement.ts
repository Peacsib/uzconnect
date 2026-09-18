"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function submitPlacementApplication(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } })
  if (!student) throw new Error("Student record not found")

  const companyName = formData.get("companyName") as string
  const companyAddress = formData.get("companyAddress") as string
  const companyCity = formData.get("companyCity") as string
  const supervisorName = formData.get("supervisorName") as string
  const supervisorEmail = formData.get("supervisorEmail") as string
  const supervisorPhone = formData.get("supervisorPhone") as string
  const position = formData.get("position") as string
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string

  if (!companyName || !companyAddress || !companyCity || !supervisorName || !supervisorEmail || !supervisorPhone) {
    throw new Error("Missing required fields")
  }

  const startDate = startDateStr ? new Date(startDateStr) : null
  const endDate = endDateStr ? new Date(endDateStr) : null

  await prisma.placementSubmission.create({
    data: {
      studentId: student.id,
      companyName,
      companyAddress,
      companyCity,
      supervisorName,
      supervisorEmail,
      supervisorPhone,
      position,
      startDate,
      endDate,
      status: "PENDING",
    },
  })

  revalidatePath("/student/placement")
  revalidatePath("/student/submit-placement")
  revalidatePath("/coordinator/placements")
  return { success: true }
}

export async function approvePlacementSubmission(submissionId: string, lecturerId?: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "COORDINATOR") throw new Error("Unauthorized")

  const sub = await prisma.placementSubmission.findUnique({
    where: { id: submissionId },
    include: { student: true },
  })
  if (!sub) throw new Error("Submission not found")

  // Find or create company
  let company = await prisma.company.findFirst({
    where: { name: { equals: sub.companyName, mode: "insensitive" } },
  })
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: sub.companyName,
        address: sub.companyAddress,
        city: sub.companyCity,
        email: sub.supervisorEmail,
        phone: sub.supervisorPhone,
      },
    })
  }

  // Find or create supervisor
  let supervisorUser = await prisma.user.findUnique({
    where: { email: sub.supervisorEmail },
  })
  let supervisorId: string

  if (!supervisorUser) {
    const bcrypt = await import("bcryptjs")
    const hash = await bcrypt.default.hash("Welcome123!", 12)
    supervisorUser = await prisma.user.create({
      data: {
        email: sub.supervisorEmail,
        name: sub.supervisorName,
        passwordHash: hash,
        role: "SUPERVISOR",
        supervisor: {
          create: {
            companyId: company.id,
            position: sub.position || "Workplace Supervisor",
            approved: true,
          },
        },
      },
    })
    const supRecord = await prisma.supervisor.findUnique({ where: { userId: supervisorUser.id } })
    supervisorId = supRecord!.id
  } else {
    let supRecord = await prisma.supervisor.findUnique({ where: { userId: supervisorUser.id } })
    if (!supRecord) {
      supRecord = await prisma.supervisor.create({
        data: {
          userId: supervisorUser.id,
          companyId: company.id,
          position: sub.position || "Workplace Supervisor",
          approved: true,
        },
      })
    }
    supervisorId = supRecord.id
  }

  const startDate = sub.startDate || new Date()
  const endDate = sub.endDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)

  // Create placement
  const placement = await prisma.placement.create({
    data: {
      studentId: sub.studentId,
      companyId: company.id,
      supervisorId: supervisorId,
      lecturerId: lecturerId || null,
      startDate,
      endDate,
      status: "ACTIVE",
    },
  })

  // Create default logbook deadlines for 12 weeks
  for (let week = 1; week <= 12; week++) {
    const dueDate = new Date(startDate)
    dueDate.setDate(dueDate.getDate() + week * 7)
    await prisma.logbookDeadline.create({
      data: {
        placementId: placement.id,
        week,
        dueDate,
      },
    })
  }

  // Create standard submissions
  const midDueDate = new Date(startDate)
  midDueDate.setDate(midDueDate.getDate() + 45)
  const finalDueDate = new Date(endDate)
  finalDueDate.setDate(finalDueDate.getDate() - 7)

  await prisma.submission.createMany({
    data: [
      { placementId: placement.id, title: "Mid-Term Progress Report", type: "REPORT", dueDate: midDueDate },
      { placementId: placement.id, title: "Final WRL Report", type: "REPORT", dueDate: finalDueDate },
      { placementId: placement.id, title: "Workplace Presentation", type: "PRESENTATION", dueDate: finalDueDate },
      { placementId: placement.id, title: "Final Logbook Submission", type: "LOGBOOK", dueDate: finalDueDate },
    ],
  })

  // Update submission status
  await prisma.placementSubmission.update({
    where: { id: submissionId },
    data: { status: "APPROVED", companyId: company.id, supervisorId: supervisorId },
  })

  revalidatePath("/coordinator/placements")
  revalidatePath("/student/placement")
  return { success: true, placementId: placement.id }
}

export async function rejectPlacementSubmission(submissionId: string, reason: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "COORDINATOR") throw new Error("Unauthorized")

  await prisma.placementSubmission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
    },
  })

  revalidatePath("/coordinator/placements")
  return { success: true }
}

export async function assignLecturerToPlacement(placementId: string, lecturerId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "COORDINATOR") throw new Error("Unauthorized")

  await prisma.placement.update({
    where: { id: placementId },
    data: { lecturerId },
  })

  revalidatePath("/coordinator/placements")
  return { success: true }
}