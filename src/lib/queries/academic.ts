import { prisma } from "@/lib/prisma"

export async function getAllStudents() {
  return prisma.student.findMany({
    include: {
      user: true,
      programme: { include: { department: { include: { faculty: true } } } },
      placements: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          company: true,
          supervisor: { include: { user: true } },
          lecturer: { include: { user: true } },
        },
      },
    },
    orderBy: { regNumber: "asc" },
  })
}

export async function getAllSupervisors() {
  return prisma.supervisor.findMany({
    include: {
      user: true,
      company: true,
      placements: {
        include: {
          student: { include: { user: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllLecturers() {
  return prisma.lecturer.findMany({
    include: {
      user: true,
      department: { include: { faculty: true } },
      placements: {
        include: {
          student: { include: { user: true } },
          company: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllCompanies() {
  return prisma.company.findMany({
    include: {
      _count: { select: { placements: true, supervisors: true } },
    },
    orderBy: { name: "asc" },
  })
}

export async function getAllProgrammes() {
  return prisma.programme.findMany({
    include: { department: true },
    orderBy: { code: "asc" },
  })
}

export async function getAllDepartments() {
  return prisma.department.findMany({
    include: { faculty: true },
    orderBy: { name: "asc" },
  })
}

export async function getAllRubrics() {
  return prisma.rubric.findMany({
    include: {
      _count: { select: { assessments: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}