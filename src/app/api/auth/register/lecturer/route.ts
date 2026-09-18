import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, departmentId, phone, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    let deptId = Number(departmentId);
    if (isNaN(deptId) || deptId <= 0) {
      const firstDept = await prisma.department.findFirst();
      deptId = firstDept ? firstDept.id : 1;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        role: "LECTURER",
        lecturer: {
          create: {
            departmentId: deptId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lecturer account registered successfully!",
      user,
    });
  } catch (error: any) {
    console.error("Lecturer registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to register lecturer account." },
      { status: 500 }
    );
  }
}
