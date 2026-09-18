import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password, departmentName } = await req.json()

    if (!name || !email || !password || !departmentName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 })
    }

    let department = await prisma.department.findFirst({
      where: { name: { contains: departmentName, mode: "insensitive" } },
    })
    if (!department) {
      department = await prisma.department.findFirst()
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "LECTURER",
        lecturer: {
          create: {
            departmentId: department!.id,
          },
        },
      },
    })

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 })
  }
}