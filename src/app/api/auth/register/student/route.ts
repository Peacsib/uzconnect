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
    const emailPrefix = cleanEmail.split('@')[0].trim().toUpperCase();

    // REQUIREMENT: Flag if email prefix does not match registration number
    if (emailPrefix !== cleanReg) {
      return NextResponse.json(
        {
          error: `Registration number mismatch! Your student email starts with "${emailPrefix}", but registration number was entered as "${cleanReg}". Student emails must follow the format ${cleanReg}@uofzmail.uz.ac.zw.`,
        },
        { status: 400 }
      );
    }

    // Check if email already registered in User table
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Check if registration number already in use on User or Student tables
    const existingUserReg = await prisma.user.findUnique({
      where: { regNumber: cleanReg },
    });
    const existingStudentReg = await prisma.student.findUnique({
      where: { regNumber: cleanReg },
    });
    if (existingUserReg || existingStudentReg) {
      return NextResponse.json(
        { error: "An account with this registration number already exists." },
        { status: 409 }
      );
    }

    // Validate programme ID
    let pId = Number(programmeId);
    let targetProgramme = await prisma.programme.findUnique({ where: { id: pId } });
    if (!targetProgramme) {
      targetProgramme = await prisma.programme.findFirst();
      pId = targetProgramme ? targetProgramme.id : 1;
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
        student: {
          select: {
            programme: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
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
