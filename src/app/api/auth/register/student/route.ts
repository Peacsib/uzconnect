import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, regNumber, programmeId, phone, password } = body;

    if (!fullName || !email || !regNumber || !password) {
      return NextResponse.json(
        { error: "Full name, email, registration number, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanReg = String(regNumber).trim().toUpperCase();

    // Check if email already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Check if registration number already in use
    const existingReg = await prisma.student.findUnique({
      where: { regNumber: cleanReg },
    });
    if (existingReg) {
      return NextResponse.json(
        { error: "An account with this registration number already exists." },
        { status: 409 }
      );
    }

    // Get programme ID - fallback to first programme if none provided
    let pId = Number(programmeId);
    if (isNaN(pId) || pId <= 0) {
      const firstProg = await prisma.programme.findFirst();
      pId = firstProg ? firstProg.id : 1;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        role: "STUDENT",
        regNumber: cleanReg,
        student: {
          create: {
            regNumber: cleanReg,
            programmeId: pId,
            phone: phone ? String(phone).trim() : null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        regNumber: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student account created successfully!",
      user,
    });
  } catch (error: any) {
    console.error("Student registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to register student account." },
      { status: 500 }
    );
  }
}
