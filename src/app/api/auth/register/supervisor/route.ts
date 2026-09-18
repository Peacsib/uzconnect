import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
  position: z.string().min(2),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return NextResponse.json({ message: "Email already registered" }, { status: 400 })

    const passwordHash = await bcrypt.hash(data.password, 12)

    // Find or create company
    let company = await prisma.company.findFirst({ where: { name: { equals: data.companyName, mode: "insensitive" } } })
    if (!company) {
      company = await prisma.company.create({ data: { name: data.companyName } })
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: "SUPERVISOR",
        supervisor: {
          create: {
            companyId: company.id,
            position: data.position,
            approved: false,
          },
        },
      },
    })

    return NextResponse.json({ message: "Registration successful", id: user.id }, { status: 201 })
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ message: "Invalid input", errors: err.errors }, { status: 422 })
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}