"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function bulkImportStudents(students: Array<{
  regNumber: string
  name: string
  email: string
  programmeCode: string
  phone?: string
}>) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "COORDINATOR") throw new Error("Unauthorized")

  let imported = 0
  const errors: string[] = []

  const defaultPasswordHash = await bcrypt.hash("Student123!", 12)

  for (const s of students) {
    try {
      const programme = await prisma.programme.findUnique({
        where: { code: s.programmeCode.trim().toUpperCase() },
      })
      if (!programme) {
        errors.push(`Programme code "${s.programmeCode}" not found for ${s.regNumber}`)
        continue
      }

      const user = await prisma.user.upsert({
        where: { email: s.email.trim().toLowerCase() },
        update: {
          name: s.name.trim(),
          regNumber: s.regNumber.trim().toUpperCase(),
        },
        create: {
          email: s.email.trim().toLowerCase(),
          name: s.name.trim(),
          regNumber: s.regNumber.trim().toUpperCase(),
          passwordHash: defaultPasswordHash,
          role: "STUDENT",
        },
      })

      await prisma.student.upsert({
        where: { userId: user.id },
        update: {
          programmeId: programme.id,
          phone: s.phone || null,
        },
        create: {
          userId: user.id,
          regNumber: s.regNumber.trim().toUpperCase(),
          programmeId: programme.id,
          phone: s.phone || null,
        },
      })

      imported++
    } catch (err: any) {
      errors.push(`Error importing ${s.regNumber}: ${err.message}`)
    }
  }

  revalidatePath("/coordinator/students")
  return { imported, errors }
}