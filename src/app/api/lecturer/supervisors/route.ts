import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    // Find lecturer in PostgreSQL
    const lecturer = await prisma.lecturer.findFirst({
      where: {
        ...(email ? { user: { email } } : {}),
      },
      include: { user: true },
    });

    if (!lecturer) {
      return NextResponse.json({
        success: true,
        supervisors: [],
        companies: [],
      });
    }

    // Fetch active placements assigned to this lecturer
    const placements = await prisma.placement.findMany({
      where: {
        lecturerId: lecturer.id,
        status: "ACTIVE",
      },
      include: {
        student: { include: { user: true, programme: true } },
        company: true,
        supervisor: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Extract unique supervisors
    const supervisorMap = new Map();
    const companyMap = new Map();

    for (const p of placements) {
      if (p.supervisor) {
        const supId = p.supervisor.id;
        if (!supervisorMap.has(supId)) {
          supervisorMap.set(supId, {
            id: supId,
            userId: p.supervisor.userId,
            name: p.supervisor.user.name,
            email: p.supervisor.user.email,
            phone: p.supervisor.user.regNumber || "+263 77 000 0000",
            position: p.supervisor.position || "Workplace Mentor",
            companyName: p.company.name,
            companyCity: p.company.city || "Harare",
            interns: [],
          });
        }
        supervisorMap.get(supId).interns.push({
          id: p.student.id,
          name: p.student.user.name,
          regNumber: p.student.regNumber,
          programme: p.student.programme.name,
          placementId: p.id,
          startDate: p.startDate,
          endDate: p.endDate,
        });
      }

      if (p.company) {
        const compId = p.company.id;
        if (!companyMap.has(compId)) {
          companyMap.set(compId, {
            id: compId,
            name: p.company.name,
            address: p.company.address || "Harare, Zimbabwe",
            city: p.company.city || "Harare",
            internsCount: 0,
            supervisorsCount: 0,
            interns: [],
          });
        }
        const c = companyMap.get(compId);
        c.internsCount += 1;
        c.interns.push({
          studentName: p.student.user.name,
          regNumber: p.student.regNumber,
          supervisorName: p.supervisor?.user?.name || "Assigned Mentor",
        });
      }
    }

    return NextResponse.json({
      success: true,
      supervisors: Array.from(supervisorMap.values()),
      companies: Array.from(companyMap.values()),
      totalPlacements: placements.length,
    });
  } catch (error: any) {
    console.error("Error fetching lecturer supervisors:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch supervisors" }, { status: 500 });
  }
}
