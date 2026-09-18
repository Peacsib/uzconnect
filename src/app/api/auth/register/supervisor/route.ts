import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, company, jobTitle, phone, password } = body;

    if (!fullName || !email || !company || !password) {
      return NextResponse.json(
        { error: "Name, email, company name, and password are required." },
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

    // Find or create company
    const companyName = String(company).trim();
    let comp = await prisma.company.findFirst({
      where: { name: { equals: companyName, mode: "insensitive" } },
    });

    if (!comp) {
      comp = await prisma.company.create({
        data: {
          name: companyName,
          phone: phone ? String(phone).trim() : null,
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        role: "SUPERVISOR",
        supervisor: {
          create: {
            companyId: comp.id,
            position: jobTitle ? String(jobTitle).trim() : "Industry Mentor",
            approved: true,
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
      message: "Supervisor account registered successfully!",
      user,
    });
  } catch (error: any) {
    console.error("Supervisor registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to register supervisor account." },
      { status: 500 }
    );
  }
}
