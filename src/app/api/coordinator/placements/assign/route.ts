import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { placementId, submissionId, lecturerId } = body;

    const targetLecturerId = (lecturerId && lecturerId !== "unassigned") ? String(lecturerId) : null;

    let lecturer: any = null;
    if (targetLecturerId) {
      lecturer = await prisma.lecturer.findUnique({
        where: { id: targetLecturerId },
        include: { user: true },
      });

      if (!lecturer) {
        return NextResponse.json({ success: false, error: "Selected lecturer not found." }, { status: 404 });
      }
    }

    let targetPlacementId = placementId;

    if (!targetPlacementId && submissionId) {
      // Check if student already has an active placement
      const sub = await prisma.placementSubmission.findUnique({
        where: { id: submissionId },
        include: {
          student: {
            include: {
              placements: {
                where: { status: "ACTIVE" },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      if (sub?.student?.placements?.[0]) {
        targetPlacementId = sub.student.placements[0].id;
      } else if (sub) {
        // Placement not created yet: activate placement with this lecturer manually assigned
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

        const newPlacement = await prisma.placement.create({
          data: {
            studentId: sub.studentId,
            companyId: company.id,
            supervisorId: supervisor.id,
            lecturerId: targetLecturerId,
            startDate: sub.startDate || new Date("2026-10-01"),
            endDate: sub.endDate || new Date("2027-05-31"),
            status: "ACTIVE",
          },
          include: {
            student: { include: { user: true } },
            company: true,
            lecturer: { include: { user: true } },
          },
        });

        await prisma.placementSubmission.update({
          where: { id: sub.id },
          data: {
            status: "APPROVED",
            companyId: company.id,
            supervisorId: supervisor.id,
          },
        });

        if (lecturer?.userId) {
          await prisma.notification.create({
            data: {
              userId: lecturer.userId,
              title: "New Student Assigned for Supervision",
              message: `${newPlacement.student.user.name} (${newPlacement.student.regNumber || "Student"}) at ${company.name} has been assigned to your supervision roster.`,
              type: "ALLOCATION",
              read: false,
              link: "/lecturer/students",
            },
          });
        }

        return NextResponse.json({
          success: true,
          message: lecturer ? `Academic Lecturer ${lecturer.user.name} assigned and placement activated.` : "Placement activated without lecturer.",
          placement: newPlacement,
        });
      }
    }

    if (targetPlacementId) {
      const placement = await prisma.placement.update({
        where: { id: targetPlacementId },
        data: { lecturerId: targetLecturerId },
        include: {
          student: { include: { user: true } },
          company: true,
          lecturer: { include: { user: true } },
        },
      });

      // Send notification to the newly assigned lecturer
      if (lecturer?.userId) {
        await prisma.notification.create({
          data: {
            userId: lecturer.userId,
            title: "New Student Assigned for Supervision",
            message: `${placement.student.user.name} (${placement.student.regNumber || "Student"}) at ${placement.company.name} has been assigned to your supervision roster by Coordinator Jameson Sibanda.`,
            type: "ALLOCATION",
            read: false,
            link: "/lecturer/students",
          },
        });
      }

      // Send notification to the student about their assigned academic lecturer
      if (placement.student?.userId && lecturer) {
        await prisma.notification.create({
          data: {
            userId: placement.student.userId,
            title: "Academic Assessor Assigned",
            message: `Lecturer ${lecturer.user.name} (${lecturer.department}) has been assigned as your University Academic Supervisor for your attachment at ${placement.company.name}.`,
            type: "ALLOCATION",
            read: false,
            link: "/student/placement",
          },
        });
      }

      console.log(`[Lecturer Assigned] Placement ${targetPlacementId} -> Lecturer ${lecturer ? lecturer.user.name : "Unassigned"}`);

      return NextResponse.json({
        success: true,
        message: lecturer ? `Academic Lecturer ${lecturer.user.name} assigned successfully.` : "Lecturer unassigned from placement.",
        placement,
      });
    }

    return NextResponse.json({ success: false, error: "Placement ID or Submission ID required." }, { status: 400 });
  } catch (error: any) {
    console.error("Error assigning lecturer:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to assign lecturer." }, { status: 500 });
  }
}
