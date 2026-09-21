import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: Fetch all logbook entries for all students assigned to this lecturer
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
      return NextResponse.json({ success: true, students: [], entries: [] });
    }

    // Get all placements for this lecturer
    const placements = await prisma.placement.findMany({
      where: {
        lecturerId: lecturer.id,
        status: "ACTIVE",
      },
      include: {
        student: { include: { user: true, programme: true } },
        company: true,
        supervisor: { include: { user: true } },
        logbookEntries: {
          orderBy: { week: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format students with their logbook metrics
    const formattedStudents = placements.map((p) => {
      const entries = p.logbookEntries;
      const submitted = entries.filter((e) => e.status === "SUBMITTED");
      const pendingReview = submitted.filter((e) => !e.lecturerApproved);
      const approved = entries.filter((e) => e.lecturerApproved);

      return {
        placementId: p.id,
        studentId: p.student.id,
        name: p.student.user.name,
        email: p.student.user.email,
        regNumber: p.student.regNumber,
        programmeCode: p.student.programme.code,
        programmeName: p.student.programme.name,
        companyName: p.company.name,
        companyCity: p.company.city,
        supervisorName: p.supervisor.user.name,
        supervisorEmail: p.supervisor.user.email,
        startDate: p.startDate,
        endDate: p.endDate,
        totalEntries: entries.length,
        submittedCount: submitted.length,
        pendingReviewCount: pendingReview.length,
        approvedCount: approved.length,
        entries: entries.map((e) => ({
          id: e.id,
          placementId: e.placementId,
          week: e.week,
          weekEndingDate: e.weekEndingDate,
          objectives: e.objectives,
          actualTasks: e.actualTasks,
          reflection: e.reflection,
          status: e.status,
          supervisorApproved: e.supervisorApproved,
          supervisorComment: e.supervisorComment,
          lecturerApproved: e.lecturerApproved,
          lecturerComment: e.lecturerComment,
          submittedAt: e.submittedAt,
        })),
      };
    });

    const allEntries = formattedStudents.flatMap((s) =>
      s.entries.map((e) => ({
        ...e,
        studentName: s.name,
        studentReg: s.regNumber,
        companyName: s.companyName,
      }))
    );

    return NextResponse.json({
      success: true,
      students: formattedStudents,
      entries: allEntries,
      lecturer: {
        id: lecturer.id,
        name: lecturer.user.name,
        email: lecturer.user.email,
      },
    });
  } catch (error: any) {
    console.error("Error fetching lecturer logbook:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch logbooks" }, { status: 500 });
  }
}

// POST: Lecturer approves or comments on a logbook entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entryId, comment, approved = true } = body;

    if (!entryId) {
      return NextResponse.json({ success: false, error: "Entry ID is required." }, { status: 400 });
    }

    const updatedEntry = await prisma.logbookEntry.update({
      where: { id: entryId },
      data: {
        lecturerApproved: Boolean(approved),
        lecturerComment: comment !== undefined ? String(comment) : null,
        ...(approved ? { status: "APPROVED" } : {}),
      },
      include: {
        placement: {
          include: {
            student: { include: { user: true } },
            lecturer: { include: { user: true } },
          },
        },
      },
    });

    // Notify Student of Lecturer sign-off
    if (updatedEntry.placement.student?.userId) {
      const lecturerName = updatedEntry.placement.lecturer?.user?.name || "Your Academic Lecturer";
      await prisma.notification.create({
        data: {
          userId: updatedEntry.placement.student.userId,
          title: approved ? `Logbook Week ${updatedEntry.week} Approved` : `Logbook Week ${updatedEntry.week} Feedback`,
          message: approved
            ? `${lecturerName} has approved your Week ${updatedEntry.week} logbook.${comment ? ` Note: "${comment}"` : ""}`
            : `${lecturerName} provided feedback on your Week ${updatedEntry.week} logbook: "${comment || "Please review entries."}"`,
          type: "LOGBOOK_REVIEWED",
          read: false,
          link: "/student/logbook",
        },
      });
    }

    console.log(`[Lecturer Reviewed Entry] ${entryId}, Week ${updatedEntry.week}, Approved: ${approved}`);

    return NextResponse.json({
      success: true,
      message: approved ? "Logbook entry approved successfully!" : "Logbook review feedback saved.",
      entry: updatedEntry,
    });
  } catch (error: any) {
    console.error("Error updating lecturer logbook entry:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update entry." }, { status: 500 });
  }
}
