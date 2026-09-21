import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: Fetch student's logbook entries
export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    // Find student
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          ...(email ? [{ user: { email } }] : []),
          ...(email && !email.includes("@") ? [{ regNumber: email.toUpperCase() }] : []),
        ],
      },
      include: {
        user: true,
        placements: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          include: {
            company: true,
            supervisor: { include: { user: true } },
            lecturer: { include: { user: true } },
          },
          take: 1,
        },
      },
    });

    if (!student || !student.placements[0]) {
      return NextResponse.json({
        success: true,
        entries: [],
        placement: null,
        message: "No active placement found for this student.",
      });
    }

    const placement = student.placements[0];

    // Fetch real logbook entries from PostgreSQL
    const entries = await prisma.logbookEntry.findMany({
      where: { placementId: placement.id },
      orderBy: { week: "asc" },
    });

    return NextResponse.json({
      success: true,
      placement: {
        id: placement.id,
        companyName: placement.company.name,
        supervisorName: placement.supervisor.user.name,
        supervisorEmail: placement.supervisor.user.email,
        lecturerName: placement.lecturer?.user?.name || null,
        lecturerEmail: placement.lecturer?.user?.email || null,
        startDate: placement.startDate,
        endDate: placement.endDate,
      },
      entries,
    });
  } catch (error: any) {
    console.error("Error fetching student logbook:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch logbook entries" }, { status: 500 });
  }
}

// POST: Create or Update a logbook entry
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const {
      placementId,
      week,
      weekEndingDate,
      objectives,
      actualTasks,
      reflection,
      status = "DRAFT", // DRAFT or SUBMITTED
      email: explicitEmail,
    } = body;

    const email = (session?.user?.email || explicitEmail || "").trim().toLowerCase();

    let resolvedPlacementId = placementId;

    if (!resolvedPlacementId && email) {
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { user: { email } },
            ...(email.includes("@") ? [{ regNumber: email.split("@")[0].toUpperCase() }] : []),
          ],
        },
        include: {
          placements: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
      resolvedPlacementId = student?.placements[0]?.id;
    }

    if (!resolvedPlacementId) {
      return NextResponse.json({ success: false, error: "Active placement ID required." }, { status: 400 });
    }

    if (!week) {
      return NextResponse.json({ success: false, error: "Week number is required." }, { status: 400 });
    }

    const weekNum = Number(week);
    const endingDate = weekEndingDate ? new Date(weekEndingDate) : new Date();

    // Upsert into logbook_entries
    const entry = await prisma.logbookEntry.upsert({
      where: {
        placementId_week: {
          placementId: resolvedPlacementId,
          week: weekNum,
        },
      },
      update: {
        weekEndingDate: endingDate,
        objectives: objectives || "",
        actualTasks: actualTasks || "",
        reflection: reflection || "",
        status: status === "SUBMITTED" ? "SUBMITTED" : "DRAFT",
        ...(status === "SUBMITTED" ? { submittedAt: new Date() } : {}),
      },
      create: {
        placementId: resolvedPlacementId,
        week: weekNum,
        weekEndingDate: endingDate,
        objectives: objectives || "",
        actualTasks: actualTasks || "",
        reflection: reflection || "",
        status: status === "SUBMITTED" ? "SUBMITTED" : "DRAFT",
        ...(status === "SUBMITTED" ? { submittedAt: new Date() } : {}),
      },
      include: {
        placement: {
          include: {
            student: { include: { user: true } },
            lecturer: { include: { user: true } },
            supervisor: { include: { user: true } },
            company: true,
          },
        },
      },
    });

    // If submitted, notify Lecturer & Supervisor in real time
    if (status === "SUBMITTED") {
      const studentName = entry.placement.student.user.name;
      const regNo = entry.placement.student.regNumber;

      if (entry.placement.lecturer?.userId) {
        await prisma.notification.create({
          data: {
            userId: entry.placement.lecturer.userId,
            title: `Logbook Week ${weekNum} Submitted`,
            message: `${studentName} (${regNo}) has submitted their Week ${weekNum} logbook for academic review.`,
            type: "LOGBOOK_SUBMITTED",
            read: false,
            link: "/lecturer/logbook",
          },
        });
      }

      if (entry.placement.supervisor?.userId) {
        await prisma.notification.create({
          data: {
            userId: entry.placement.supervisor.userId,
            title: `Logbook Week ${weekNum} Submitted`,
            message: `${studentName} has submitted their Week ${weekNum} industrial logbook for mentor sign-off.`,
            type: "LOGBOOK_SUBMITTED",
            read: false,
            link: "/supervisor/logbook",
          },
        });
      }
    }

    console.log(`[Logbook Saved] Placement ${resolvedPlacementId}, Week ${weekNum}, Status: ${status}`);

    return NextResponse.json({
      success: true,
      entry,
      message: status === "SUBMITTED" ? `Week ${weekNum} logbook submitted successfully!` : `Week ${weekNum} draft saved.`,
    });
  } catch (error: any) {
    console.error("Error saving logbook entry:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save logbook." }, { status: 500 });
  }
}
