import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    const lecturer = await prisma.lecturer.findFirst({
      where: {
        ...(email ? { user: { email } } : {}),
      },
      include: { user: true },
    });

    if (!lecturer) {
      return NextResponse.json({
        success: true,
        stats: {
          totalAssigned: 0,
          totalLogbooks: 0,
          approvedLogbooks: 0,
          completedAssessments: 0,
        },
        companyDistribution: [],
        submissionStatusData: [],
      });
    }

    const placements = await prisma.placement.findMany({
      where: {
        lecturerId: lecturer.id,
        status: "ACTIVE",
      },
      include: {
        company: true,
        logbookEntries: true,
        submissions: {
          include: { assessments: true },
        },
      },
    });

    // Company distribution
    const compMap = new Map();
    let totalLogbooks = 0;
    let approvedLogbooks = 0;
    let completedAssessments = 0;

    for (const p of placements) {
      const cName = p.company.name;
      compMap.set(cName, (compMap.get(cName) || 0) + 1);

      totalLogbooks += p.logbookEntries.length;
      approvedLogbooks += p.logbookEntries.filter((l) => l.lecturerApproved).length;

      for (const s of p.submissions) {
        completedAssessments += s.assessments.length;
      }
    }

    const companyDistribution = Array.from(compMap.entries()).map(([name, students]) => ({
      name,
      students,
    }));

    const submissionStatusData = [
      { name: "Approved", value: approvedLogbooks },
      { name: "Pending Review", value: Math.max(0, totalLogbooks - approvedLogbooks) },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        totalAssigned: placements.length,
        totalLogbooks,
        approvedLogbooks,
        completedAssessments,
      },
      companyDistribution,
      submissionStatusData,
    });
  } catch (error: any) {
    console.error("Error fetching lecturer analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}
