import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    // 1. Fetch real counts from PostgreSQL
    const [
      totalStudents,
      totalPlacements,
      totalSubmissions,
      pendingSubmissionsCount,
      activePlacementsCount,
      totalProgrammes,
      totalFaculties,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.placement.count(),
      prisma.placementSubmission.count(),
      prisma.placementSubmission.count({
        where: { status: "PENDING" },
      }),
      prisma.placement.count({
        where: { status: "ACTIVE" },
      }),
      prisma.programme.count(),
      prisma.faculty.count(),
    ]);

    // 2. Fetch latest registered students with rich academic relation
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            regNumber: true,
            createdAt: true,
          },
        },
        programme: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        placements: {
          include: {
            company: true,
            supervisor: { include: { user: true } },
          },
          take: 1,
        },
        placementSubmissions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Format students cleanly
    const formattedStudents = students.map((s) => {
      const activePlacement = s.placements[0] || null;
      const latestSub = s.placementSubmissions[0] || null;

      let status = "NO_PLACEMENT";
      let statusLabel = "Placement Needed";
      let companyName = null;

      if (activePlacement) {
        status = "ACTIVE";
        statusLabel = "Active Attachment";
        companyName = activePlacement.company?.name || "Host Organization";
      } else if (latestSub) {
        status = latestSub.status;
        statusLabel = latestSub.status === "PENDING" ? "Under Review" : latestSub.status;
        companyName = latestSub.companyName;
      }

      return {
        id: s.id,
        userId: s.userId,
        name: s.user.name,
        email: s.user.email,
        regNumber: s.regNumber || s.user.regNumber,
        programmeCode: s.programme.code,
        programmeName: s.programme.name,
        department: s.programme.department.name,
        faculty: s.programme.department.faculty.name,
        status,
        statusLabel,
        companyName,
        createdAt: s.createdAt,
      };
    });

    // 3. Fetch latest placement submissions
    const pendingSubmissions = await prisma.placementSubmission.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: {
            user: true,
            programme: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalPlacements,
        totalSubmissions,
        pendingSubmissions: pendingSubmissionsCount,
        activePlacements: activePlacementsCount,
        totalProgrammes,
        totalFaculties,
      },
      students: formattedStudents,
      pendingSubmissions,
      coordinator: {
        name: "Jameson Sibanda",
        email: "peacesibx@gmail.com",
        role: "COORDINATOR",
        department: "Department of Business Studies",
      },
    });
  } catch (error: any) {
    console.error("Error fetching coordinator overview:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coordinator overview." },
      { status: 500 }
    );
  }
}
