import { prisma } from "@/lib/prisma"

export async function getStudentPlacement(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      programme: { include: { department: { include: { faculty: true } } } },
      placements: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          company: true,
          supervisor: { include: { user: true } },
          lecturer: { include: { user: true, department: true } },
          history: { orderBy: { createdAt: "desc" } },
        },
      },
      placementSubmissions: {
        orderBy: { createdAt: "desc" },
      },
    },
  })
  return student
}

export async function getPlacementSubmissions(status?: any) {
  return prisma.placementSubmission.findMany({
    where: status ? { status } : undefined,
    include: {
      student: {
        include: {
          user: true,
          programme: { include: { department: true } },
        },
      },
      company: true,
      supervisor: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllPlacements() {
  return prisma.placement.findMany({
    include: {
      student: {
        include: {
          user: true,
          programme: true,
        },
      },
      company: true,
      supervisor: { include: { user: true } },
      lecturer: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getLecturerPlacements(userId: string) {
  const lecturer = await prisma.lecturer.findUnique({ where: { userId } })
  if (!lecturer) return []
  return prisma.placement.findMany({
    where: { lecturerId: lecturer.id },
    include: {
      student: {
        include: {
          user: true,
          programme: true,
        },
      },
      company: true,
      supervisor: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getSupervisorPlacements(userId: string) {
  const supervisor = await prisma.supervisor.findUnique({ where: { userId } })
  if (!supervisor) return []
  return prisma.placement.findMany({
    where: { supervisorId: supervisor.id },
    include: {
      student: {
        include: {
          user: true,
          programme: true,
        },
      },
      company: true,
      lecturer: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}