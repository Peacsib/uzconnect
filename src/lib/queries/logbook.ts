import { prisma } from "@/lib/prisma"

export async function getStudentLogbook(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      placements: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          company: true,
          logbookEntries: {
            orderBy: { week: "asc" },
          },
          logbookDeadlines: {
            orderBy: { week: "asc" },
          },
        },
      },
    },
  })
  return student?.placements[0] ?? null
}

export async function getLecturerLogbookReviews(userId: string) {
  const lecturer = await prisma.lecturer.findUnique({ where: { userId } })
  if (!lecturer) return []

  return prisma.logbookEntry.findMany({
    where: {
      placement: { lecturerId: lecturer.id },
    },
    include: {
      placement: {
        include: {
          student: { include: { user: true, programme: true } },
          company: true,
          supervisor: { include: { user: true } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  })
}

export async function getSupervisorLogbookReviews(userId: string) {
  const supervisor = await prisma.supervisor.findUnique({ where: { userId } })
  if (!supervisor) return []

  return prisma.logbookEntry.findMany({
    where: {
      placement: { supervisorId: supervisor.id },
    },
    include: {
      placement: {
        include: {
          student: { include: { user: true, programme: true } },
          company: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  })
}