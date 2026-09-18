import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, lecturerId: explicitLecturerId } = body;

    if (!submissionId) {
      return NextResponse.json({ success: false, error: "Submission ID is required." }, { status: 400 });
    }

    const sub = await prisma.placementSubmission.findUnique({
      where: { id: submissionId },
      include: { 
        student: {
          include: {
            user: true,
            programme: {
              include: { department: true }
            }
          }
        } 
      },
    });

    if (!sub) {
      return NextResponse.json({ success: false, error: "Submission not found." }, { status: 404 });
    }

    // 1. Create or find host company
    let company = await prisma.company.findFirst({
      where: { name: { contains: sub.companyName, mode: "insensitive" } },
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

    // 2. Create or find supervisor (Efficience Makenga or from submission)
    let supervisor = await prisma.supervisor.findFirst({
      where: { user: { email: sub.supervisorEmail.toLowerCase() } },
      include: { user: true },
    });

    if (!supervisor) {
      const supUser = await prisma.user.create({
        data: {
          name: sub.supervisorName,
          email: sub.supervisorEmail.toLowerCase(),
          passwordHash: "$2b$10$eUJB.pGMCfTHbPDYSGDiNOyyGO7H4w91o0fVN4C.wkZjx6Kf5Ugwa",
          role: "SUPERVISOR",
        },
      });

      supervisor = await prisma.supervisor.create({
        data: {
          userId: supUser.id,
          companyId: company.id,
          position: sub.position || "Workplace Mentor",
          approved: true,
        },
        include: { user: true },
      });
    }

    // 3. Resolve Academic Lecturer: Panashe S or explicit lecturer
    let resolvedLecturerId = explicitLecturerId;
    if (!resolvedLecturerId) {
      const panashe = await prisma.lecturer.findFirst({
        where: { user: { email: "panashes@uofzmail.az.uz.zw" } },
      });
      if (panashe) {
        resolvedLecturerId = panashe.id;
      } else {
        const anyLec = await prisma.lecturer.findFirst({
          where: { departmentId: sub.student.programme.departmentId },
        });
        resolvedLecturerId = anyLec?.id || null;
      }
    }

    // 4. Create active Placement
    const placement = await prisma.placement.create({
      data: {
        studentId: sub.studentId,
        companyId: company.id,
        supervisorId: supervisor.id,
        lecturerId: resolvedLecturerId,
        startDate: sub.startDate || new Date("2026-10-01"),
        endDate: sub.endDate || new Date("2027-05-31"),
        status: "ACTIVE",
      },
      include: {
        company: true,
        supervisor: { include: { user: true } },
        lecturer: { include: { user: true } },
      },
    });

    // 5. Update submission status to APPROVED
    await prisma.placementSubmission.update({
      where: { id: sub.id },
      data: {
        status: "APPROVED",
        companyId: company.id,
        supervisorId: supervisor.id,
      },
    });

    // 6. Create Notifications for Student, Lecturer, and Supervisor
    await prisma.notification.create({
      data: {
        userId: sub.student.userId,
        title: "Placement Approved & Verified",
        message: `Your industrial attachment at ${company.name} has been verified and accredited by Coordinator Jameson Sibanda. Your supervisor is ${supervisor.user.name}.`,
        type: "PLACEMENT_APPROVED",
        read: false,
        link: "/student/placement",
      },
    });

    if (placement.lecturer?.userId) {
      await prisma.notification.create({
        data: {
          userId: placement.lecturer.userId,
          title: "New Student Assigned for Supervision",
          message: `${sub.student.user.name} (${sub.student.regNumber}) at ${company.name} has been allocated to your academic supervision roster.`,
          type: "ALLOCATION",
          read: false,
          link: "/lecturer/students",
        },
      });
    }

    await prisma.notification.create({
      data: {
        userId: supervisor.userId,
        title: "Student Intern Authorized",
        message: `${sub.student.user.name} has been cleared by the University of Zimbabwe for attachment at ${company.name}.`,
        type: "PLACEMENT_ACTIVE",
        read: false,
        link: "/supervisor/students",
      },
    });

    console.log("[Placement Approved]", placement.id, "Student:", sub.student.regNumber);

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
