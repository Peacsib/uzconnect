import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    const email = (session?.user?.email || body.studentEmail || "").trim().toLowerCase();
    const regPrefix = email.includes("@") ? email.split("@")[0].toUpperCase() : "";

    // Find student in PostgreSQL
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          ...(email ? [{ user: { email } }] : []),
          ...(regPrefix ? [{ regNumber: regPrefix }] : []),
        ],
      },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student record not found. Please ensure you are registered." },
        { status: 404 }
      );
    }

    const {
      companyName,
      companyAddress,
      companyCity,
      supervisorName,
      supervisorEmail,
      supervisorPhone,
      positionTitle,
      startDate,
      endDate,
    } = body;

    // Create placement submission in PostgreSQL
    const submission = await prisma.placementSubmission.create({
      data: {
        studentId: student.id,
        companyName: companyName || "Host Employer",
        companyAddress: companyAddress || "Harare",
        companyCity: companyCity || "Harare",
        supervisorName: supervisorName || "Industry Supervisor",
        supervisorEmail: supervisorEmail || "supervisor@company.co.zw",
        supervisorPhone: supervisorPhone || "+263 77 000 0000",
        position: positionTitle || "Industrial Attachment Intern",
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 7 * 24 * 60 * 60 * 1000),
        status: "PENDING",
      },
    });

    // Notify all coordinators in PostgreSQL
    const coordinators = await prisma.user.findMany({
      where: { role: "COORDINATOR" },
    });
    for (const coord of coordinators) {
      await prisma.notification.create({
        data: {
          userId: coord.id,
          title: "New Placement Registration Submitted",
          message: `${student.user.name} (${student.regNumber}) has submitted industrial attachment details for ${companyName || "Host Company"} (${companyCity || "Harare"}) for coordinator verification.`,
          type: "PLACEMENT_PENDING",
          link: "/coordinator/placements",
          read: false,
        },
      });
    }

    // Confirmation notification for the student
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: "Placement Submission Received",
        message: `Your industrial attachment registration for ${companyName || "Host Company"} has been submitted and is currently pending verification by Department Coordinator Jameson Sibanda.`,
        type: "PLACEMENT_PENDING",
        link: "/student/placement",
        read: false,
      },
    });

    console.log("[Placement Submission] Created in DB for student:", student.regNumber, submission.id);

    return NextResponse.json({
      success: true,
      data: submission,
      message: "Placement submission received and pending coordinator review.",
    });
  } catch (error: any) {
    console.error("Error submitting placement:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit placement details." },
      { status: 500 }
    );
  }
}
