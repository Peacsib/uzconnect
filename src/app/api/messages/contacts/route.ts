import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: true, contacts: [] });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!currentUser) {
      return NextResponse.json({ success: true, contacts: [] });
    }

    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        regNumber: true,
      },
      orderBy: { role: "asc" },
    });

    const formatted = allUsers.map((u) => {
      let roleLabel = "User";
      let orgLabel = "University of Zimbabwe";

      if (u.role === "COORDINATOR") {
        roleLabel = "WRL Coordinator";
        orgLabel = "UZ WRL Directorate";
      } else if (u.role === "LECTURER") {
        roleLabel = "Academic Supervisor";
        orgLabel = "UZ Dept of Business Studies";
      } else if (u.role === "SUPERVISOR") {
        roleLabel = "Workplace Mentor";
        orgLabel = "Old Mutual Zimbabwe";
      } else if (u.role === "STUDENT") {
        roleLabel = "Student Intern";
        orgLabel = `Reg: ${u.regNumber || "R2421428"}`;
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        roleLabel,
        orgLabel,
      };
    });

    return NextResponse.json({
      success: true,
      contacts: formatted,
    });
  } catch (error: any) {
    console.error("Error fetching message contacts:", error);
    return NextResponse.json({ success: false, error: "Failed to load contacts" }, { status: 500 });
  }
}
