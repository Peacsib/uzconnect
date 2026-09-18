import { prisma } from "@/lib/prisma"

export async function getStudentDashboard(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      programme: { include: { department: { include: { faculty: true } } } },
      placements: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { company: true, supervisor: { include: { user: true } }, lecturer: { include: { user: true } } },
      },
    },
  })
  if (!student) return null

  const placement = student.placements[0]

  const logbookStats = placement
    ? await prisma.logbookEntry.groupBy({
        by: ["status"],
        where: { placementId: placement.id },
        _count: true,
      })
    : []

  const unreadMessages = await prisma.message.count({ where: { receiverId: userId, read: false } })
  const upcomingDeadlines = placement
    ? await prisma.logbookDeadline.findMany({
        where: { placementId: placement.id, dueDate: { gte: new Date() } },
        orderBy: { dueDate: "asc" },
        take: 3,
      })
    : []

  return { student, placement, logbookStats, unreadMessages, upcomingDeadlines }
}

export async function getLecturerDashboard(userId: string) {
  const lecturer = await prisma.lecturer.findUnique({
    where: { userId },
    include: { department: { include: { faculty: true } } },
  })
  const placements = await prisma.placement.findMany({
    where: { lecturerId: lecturer?.id },
    include: { student: { include: { user: true, programme: true } }, company: true },
  })
  const pendingLogbooks = await prisma.logbookEntry.count({
    where: { status: "SUBMITTED", placement: { lecturerId: lecturer?.id } },
  })
  const unreadMessages = await prisma.message.count({ where: { receiverId: userId, read: false } })
  return { lecturer, placements, pendingLogbooks, unreadMessages }
}

export async function getSupervisorDashboard(userId: string) {
  const supervisor = await prisma.supervisor.findUnique({
    where: { userId },
    include: { company: true },
  })
  const placements = await prisma.placement.findMany({
    where: { supervisorId: supervisor?.id },
    include: { student: { include: { user: true, programme: true } } },
  })
  const pendingLogbooks = await prisma.logbookEntry.count({
    where: { status: "SUBMITTED", placement: { supervisorId: supervisor?.id } },
  })
  const unreadMessages = await prisma.message.count({ where: { receiverId: userId, read: false } })
  return { supervisor, placements, pendingLogbooks, unreadMessages }
}

export async function getCoordinatorDashboard() {
  const [totalStudents, activePlacements, pendingSubmissions, pendingSupervisors] = await Promise.all([
    prisma.student.count(),
    prisma.placement.count({ where: { status: "ACTIVE" } }),
    prisma.placementSubmission.count({ where: { status: "PENDING" } }),
    prisma.supervisor.count({ where: { approved: false } }),
  ])
  const recentSubmissions = await prisma.placementSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { student: { include: { user: true, programme: true } } },
  })
  return { totalStudents, activePlacements, pendingSubmissions, pendingSupervisors, recentSubmissions }
}