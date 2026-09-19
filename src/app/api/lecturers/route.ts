import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lecturers = await prisma.lecturer.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { include: { faculty: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = lecturers.map((l) => ({
      id: l.id,
      userId: l.userId,
      name: l.user.name,
      email: l.user.email,
      department: l.department?.name || "Academics",
      faculty: l.department?.faculty?.name || "University of Zimbabwe",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Error fetching lecturers:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch lecturers" }, { status: 500 });
  }
}
