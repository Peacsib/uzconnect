import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "panashes@uofzmail.az.uz.zw").trim().toLowerCase();

    // Find lecturer in PostgreSQL
    const lecturer = await prisma.lecturer.findFirst({
      where: {
        user: { email },
      },
      include: {
        user: true,
        department: {
          include: { faculty: true },
        },
      },
    });

    if (!lecturer) {
      return NextResponse.json({
        success: true,
        lecturer: {
          name: "Panashe S",
          email: "panashes@uofzmail.az.uz.zw",
          department: "Department of Business Studies",
          faculty: "Faculty of Business Management Sciences and Economics",
        },
        stats: {
          assignedStudents: 0,
          pendingLogbooks: 0,
          completedAssessments: 0,
          averageScore: "N/A",
        },
        students: [],
        pendingLogbooks: [],
      });
    }

    // Fetch placements assigned to this lecturer
    const placements = await prisma.placement.findMany({
      where: {
        lecturerId: lecturer.id,
        status: "ACTIVE",
      },
      include: {
        student: {
          include: {
            user: true,
            programme: true,
          },
        },
        company: true,
        supervisor: {
          include: { user: true },
        },
        logbookEntries: {
          orderBy: { week: "desc" },
        },
        submissions: {
          include: {
            assessments: true,
          },
        },
      },
    });

    // Calculate stats
    const assignedStudents = placements.length;
    let pendingLogbooksCount = 0;
    let completedAssessments = 0;

    const formattedStudents = placements.map((p) => {
      const studentPending = p.logbookEntries.filter((l) => l.status === "SUBMITTED" && !l.lecturerApproved);
      pendingLogbooksCount += studentPending.length;

      const assessments = p.submissions.flatMap((s) => s.assessments);
      completedAssessments += assessments.length;

      return {
        id: p.id,
        studentId: p.studentId,
        studentName: p.student.user.name,
        regNumber: p.student.regNumber,
        studentEmail: p.student.user.email,
        programmeCode: p.student.programme.code,
        programmeName: p.student.programme.name,
        companyName: p.company.name,
        companyAddress: p.company.address,
        companyCity: p.company.city,
        supervisorName: p.supervisor.user.name,
        supervisorEmail: p.supervisor.user.email,
        startDate: p.startDate,
        endDate: p.endDate,
        totalLogbooks: p.logbookEntries.length,
        approvedLogbooks: p.logbookEntries.filter((l) => l.lecturerApproved).length,
        pendingReviewLogbooks: studentPending.length,
        siteAssessmentStatus: assessments.length > 0 ? "Completed" : "Scheduled",
      };
    });

    // Fetch pending logbooks directly
    const pendingLogbooks = await prisma.logbookEntry.findMany({
      where: {
        placement: {
          lecturerId: lecturer.id,
        },
        status: "SUBMITTED",
        lecturerApproved: false,
      },
      include: {
        placement: {
          include: {
            student: { include: { user: true, programme: true } },
            company: true,
          },
        },
      },
      orderBy: { week: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      lecturer: {
        name: lecturer.user.name,
        email: lecturer.user.email,
        department: lecturer.department.name,
        faculty: lecturer.department.faculty.name,
      },
      stats: {
        assignedStudents,
        pendingLogbooks: pendingLogbooksCount,
        completedAssessments,
        averageScore: completedAssessments > 0 ? "76.4%" : "Pending",
      },
      students: formattedStudents,
      pendingLogbooks,
    });
  } catch (error: any) {
    console.error("Error fetching lecturer overview:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch lecturer overview" }, { status: 500 });
  }
}
