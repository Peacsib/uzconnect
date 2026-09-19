import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "emakenga@oldmutual.co.zw").trim().toLowerCase();

    // Find supervisor in PostgreSQL
    const supervisor = await prisma.supervisor.findFirst({
      where: {
        user: { email },
      },
      include: {
        user: true,
        company: true,
      },
    });

    if (!supervisor) {
      return NextResponse.json({
        success: true,
        supervisor: {
          name: "Efficience Makenga",
          email: "emakenga@oldmutual.co.zw",
          company: "Old Mutual Zimbabwe",
          position: "Senior Systems Engineering Manager",
        },
        stats: {
          activeInterns: 0,
          pendingLogbooks: 0,
          submittedAppraisals: 0,
          complianceRate: "100%",
        },
        interns: [],
        pendingLogbooks: [],
      });
    }

    // Fetch active placements for this supervisor
    const placements = await prisma.placement.findMany({
      where: {
        supervisorId: supervisor.id,
        status: "ACTIVE",
      },
      include: {
        student: {
          include: {
            user: true,
            programme: {
              include: { department: true },
            },
          },
        },
        lecturer: {
          include: { user: true },
        },
        company: true,
        logbookEntries: {
          orderBy: { week: "desc" },
        },
      },
    });

    const activeInterns = placements.length;
    let pendingLogbooksCount = 0;

    const formattedInterns = placements.map((p) => {
      const pending = p.logbookEntries.filter((l) => l.status === "SUBMITTED" && !l.supervisorApproved);
      pendingLogbooksCount += pending.length;

      return {
        id: p.id,
        studentId: p.studentId,
        studentName: p.student.user.name,
        regNumber: p.student.regNumber,
        studentEmail: p.student.user.email,
        programmeCode: p.student.programme.code,
        programmeName: p.student.programme.name,
        department: p.student.programme.department.name,
        lecturerName: p.lecturer?.user?.name || "Unassigned",
        lecturerEmail: p.lecturer?.user?.email || "—",
        startDate: p.startDate,
        endDate: p.endDate,
        totalLogbooks: p.logbookEntries.length,
        approvedLogbooks: p.logbookEntries.filter((l) => l.supervisorApproved).length,
        pendingReviewLogbooks: pending.length,
      };
    });

    const pendingLogbooks = await prisma.logbookEntry.findMany({
      where: {
        placement: {
          supervisorId: supervisor.id,
        },
        status: "SUBMITTED",
        supervisorApproved: false,
      },
      include: {
        placement: {
          include: {
            student: { include: { user: true, programme: true } },
          },
        },
      },
      orderBy: { week: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      supervisor: {
        name: supervisor.user.name,
        email: supervisor.user.email,
        company: supervisor.company.name,
        position: supervisor.position || "Senior Systems Engineering Manager",
      },
      stats: {
        activeInterns,
        pendingLogbooks: pendingLogbooksCount,
        submittedAppraisals: 0,
        complianceRate: "100%",
      },
      interns: formattedInterns,
      pendingLogbooks,
    });
  } catch (error: any) {
    console.error("Error fetching supervisor overview:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch supervisor overview" }, { status: 500 });
  }
}
