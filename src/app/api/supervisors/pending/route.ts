import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pending = await prisma.supervisor.findMany({
      where: { approved: false },
      include: {
        user: true,
        company: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = pending.map((s: any) => ({
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      phone: s.user.phone || "N/A",
      job_title: s.position || "Workplace Supervisor",
      approval_status: "pending",
      company: {
        id: s.company.id,
        name: s.company.name,
        address: s.company.address || "",
        city: s.company.city || "Harare",
      },
      registered_at: s.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/supervisors/pending error:", error);
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}
