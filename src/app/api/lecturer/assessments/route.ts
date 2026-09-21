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
      return NextResponse.json({ success: true, assessments: [] });
    }

    // 1. Fetch active placements for this lecturer
    const placements = await prisma.placement.findMany({
      where: {
        lecturerId: lecturer.id,
        status: "ACTIVE",
      },
      include: {
        student: { include: { user: true, programme: true } },
        company: true,
        supervisor: { include: { user: true } },
        submissions: {
          include: {
            assessments: {
              include: { rubric: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const assessmentList = [];

    for (const p of placements) {
      const allSubAssessments = p.submissions.flatMap((s) => s.assessments);
      if (allSubAssessments.length > 0) {
        for (const a of allSubAssessments) {
          assessmentList.push({
            id: a.id,
            placementId: p.id,
            studentId: p.student.id,
            studentName: p.student.user.name,
            studentEmail: p.student.user.email,
            regNumber: p.student.regNumber,
            programme: p.student.programme?.name || "BSc Honours",
            companyName: p.company.name,
            supervisorName: p.supervisor.user.name,
            technicalScore: a.technicalScore,
            professionalScore: a.professionalScore,
            communicationScore: a.communicationScore,
            overallScore: a.overallScore,
            comments: a.comments,
            date: a.createdAt,
            status: "graded",
          });
        }
      } else {
        // Pending evaluation record for this active placement
        assessmentList.push({
          id: `pending_${p.id}`,
          placementId: p.id,
          studentId: p.student.id,
          studentName: p.student.user.name,
          studentEmail: p.student.user.email,
          regNumber: p.student.regNumber,
          programme: p.student.programme?.name || "BSc Honours",
          companyName: p.company.name,
          supervisorName: p.supervisor.user.name,
          technicalScore: 0,
          professionalScore: 0,
          communicationScore: 0,
          overallScore: 0,
          comments: "",
          date: p.createdAt,
          status: "pending",
        });
      }
    }

    return NextResponse.json({ success: true, assessments: assessmentList });
  } catch (error: any) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch assessments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const {
      placementId,
      submissionId,
      technicalScore,
      professionalScore,
      communicationScore,
      overallScore,
      comments,
      rubricId,
    } = body;

    let targetSubmissionId = submissionId && !submissionId.startsWith("pending_") ? submissionId : null;

    // If no target submission or pending, ensure a submission record exists
    if (!targetSubmissionId && placementId) {
      let sub = await prisma.submission.findFirst({
        where: { placementId, type: "REPORT" },
      });
      if (!sub) {
        sub = await prisma.submission.create({
          data: {
            placementId,
            title: "Academic Supervisor Site Visit & Viva Appraisal",
            type: "REPORT",
            dueDate: new Date(),
            status: "GRADED",
            submittedAt: new Date(),
          },
        });
      }
      targetSubmissionId = sub.id;
    }

    if (!targetSubmissionId) {
      return NextResponse.json({ success: false, error: "Placement ID or Submission ID required." }, { status: 400 });
    }

    const assessorId = session?.user?.id || "u_lecturer";

    const assessment = await prisma.assessment.create({
      data: {
        submissionId: targetSubmissionId,
        assessorId,
        technicalScore: Number(technicalScore) || 0,
        professionalScore: Number(professionalScore) || 0,
        communicationScore: Number(communicationScore) || 0,
        overallScore: Number(overallScore) || 0,
        comments: comments || "Assessment completed according to UZ rubric standard.",
        ...(rubricId ? { rubricId } : {}),
      },
      include: {
        submission: {
          include: {
            placement: {
              include: {
                student: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    // Notify student in PostgreSQL
    if (assessment.submission?.placement?.student?.userId) {
      await prisma.notification.create({
        data: {
          userId: assessment.submission.placement.student.userId,
          title: "Academic Assessment Graded",
          message: `Your academic supervision evaluation has been submitted with score ${overallScore}%. Feedback: "${comments || "Completed"}"`,
          type: "ASSESSMENT_COMPLETED",
          read: false,
          link: "/student/feedback",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Academic assessment saved successfully!",
      assessment,
    });
  } catch (error: any) {
    console.error("Error saving assessment:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save assessment" }, { status: 500 });
  }
}
