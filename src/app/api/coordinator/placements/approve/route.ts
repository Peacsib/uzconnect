import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, lecturerId } = body;

    if (!submissionId) {
      return NextResponse.json({ success: false, error: "Submission ID is required." }, { status: 400 });
    }

    const sub = await prisma.placementSubmission.findUnique({
      where: { id: submissionId },
      include: { student: true },
    });

    if (!sub) {
      return NextResponse.json({ success: false, error: "Submission not found." }, { status: 404 });
    }

    // 1. Create or find host company
    let company = await prisma.company.findFirst({
      where: { name: sub.companyName },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: sub.companyName,
          address: sub.companyAddress,
          city: sub.companyCity,
        },
      });
    }

    // 2. Create or find supervisor user
    let supervisor = await prisma.supervisor.findFirst({
      where: { companyId: company.id },
      include: { user: true },
    });

    if (!supervisor) {
      const supUser = await prisma.user.create({
        data: {
          name: sub.supervisorName,
          email: sub.supervisorEmail.toLowerCase(),
          passwordHash: "$2b$10$Kcxf8JSNE69.GdJ.9Zg/GetqDo.6xKt4qou39IxPWo70WSj68L.gS",
          role: "SUPERVISOR",
        },
      });

      supervisor = await prisma.supervisor.create({
        data: {
          userId: supUser.id,
          companyId: company.id,
          position: sub.position || "Industry Mentor",
          approved: true,
        },
        include: { user: true },
      });
    }

    // 3. Create active Placement
    const placement = await prisma.placement.create({
      data: {
        studentId: sub.studentId,
        companyId: company.id,
        supervisorId: supervisor.id,
        lecturerId: lecturerId || null,
        startDate: sub.startDate || new Date(),
        endDate: sub.endDate || new Date(Date.now() + 30 * 7 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    });

    // 4. Update submission status to APPROVED
    await prisma.placementSubmission.update({
      where: { id: sub.id },
      data: {
        status: "APPROVED",
        companyId: company.id,
        supervisorId: supervisor.id,
      },
    });

    console.log("[Coordinator] Approved placement submission:", sub.id, "Active placement:", placement.id);

    return NextResponse.json({
      success: true,
      placement,
      message: "Placement verified and activated successfully!",
    });
  } catch (error: any) {
    console.error("Error approving placement:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to approve placement." }, { status: 500 });
  }
}
