import { prisma } from "@/lib/prisma"

export async function getStudentSubmissions(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      placements: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          submissions: {
            include: {
              assessments: {
                include: { rubric: true },
              },
            },
            orderBy: { dueDate: "asc" },
          },
        },
      },
    },
  })
  return student?.placements[0] ?? null
}

export async function getLecturerAssessments(userId: string) {
  const lecturer = await prisma.lecturer.findUnique({ where: { userId } })
  if (!lecturer) return []

  return prisma.submission.findMany({
    where: {
      placement: { lecturerId: lecturer.id },
    },
    include: {
      placement: {
        include: {
          student: { include: { user: true, programme: true } },
          company: true,
        },
      },
      assessments: {
        include: { rubric: true },
      },
    },
    orderBy: { dueDate: "asc" },
  })
}

export async function getSupervisorAssessments(userId: string) {
  const supervisor = await prisma.supervisor.findUnique({ where: { userId } })
  if (!supervisor) return []

  return prisma.submission.findMany({
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
      assessments: {
        include: { rubric: true },
      },
    },
    orderBy: { dueDate: "asc" },
  })
}