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
      return NextResponse.json({ success: true, placements: [] });
    }

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
        logbookDeadlines: {
          orderBy: { week: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = placements.map((p) => ({
      id: p.id,
      studentId: p.studentId,
      studentName: p.student.user.name,
      studentEmail: p.student.user.email,
      regNumber: p.student.regNumber,
      programmeCode: p.student.programme.code,
      programmeName: p.student.programme.name,
      companyId: p.company.id,
      companyName: p.company.name,
      companyAddress: p.company.address,
      companyCity: p.company.city,
      supervisorId: p.supervisor.id,
      supervisorName: p.supervisor.user.name,
      supervisorEmail: p.supervisor.user.email,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      totalLogbooks: p.logbookEntries.length,
      approvedLogbooks: p.logbookEntries.filter((l) => l.lecturerApproved).length,
      pendingReviewLogbooks: p.logbookEntries.filter((l) => l.status === "SUBMITTED" && !l.lecturerApproved).length,
      deadlines: p.logbookDeadlines,
    }));

    return NextResponse.json({ success: true, placements: formatted });
  } catch (error: any) {
    console.error("Error fetching lecturer placements:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch placements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { placementId, deadlines } = body;

    if (!placementId || !Array.isArray(deadlines)) {
      return NextResponse.json({ success: false, error: "placementId and deadlines array required" }, { status: 400 });
    }

    const upsertPromises = deadlines.map((d: { week: number; dueDate?: string; due_date?: string }) => {
      const dateVal = d.dueDate || d.due_date;
      if (!dateVal) return null;
      return prisma.logbookDeadline.upsert({
        where: {
          placementId_week: {
            placementId,
            week: Number(d.week),
          },
        },
        create: {
          placementId,
          week: Number(d.week),
          dueDate: new Date(dateVal),
        },
        update: {
          dueDate: new Date(dateVal),
        },
      });
    }).filter(Boolean);

    await Promise.all(upsertPromises);

    // Notify student about published deadlines
    const targetPlacement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: { student: true },
    });

    if (targetPlacement?.student?.userId) {
      await prisma.notification.create({
        data: {
          userId: targetPlacement.student.userId,
          title: "Logbook Deadlines Scheduled",
          message: `Your academic supervisor has scheduled milestone deadlines for your 12-week industrial attachment logbook.`,
          type: "LOGBOOK_DEADLINES",
          read: false,
          link: "/student/logbook",
        },
      });
    }

    return NextResponse.json({ success: true, message: "Deadlines saved successfully" });
  } catch (error: any) {
    console.error("Error saving placement deadlines:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save deadlines" }, { status: 500 });
  }
}
