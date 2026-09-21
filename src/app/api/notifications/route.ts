import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");
    const unreadOnly = searchParams.get("unread") === "true";
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0, stats: { total: 0, unread: 0, logbooks: 0, placements: 0 } });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0, stats: { total: 0, unread: 0, logbooks: 0, placements: 0 } });
    }

    const whereClause: any = { userId: user.id };

    if (unreadOnly) {
      whereClause.read = false;
    }

    if (category && category !== "all") {
      if (category === "logbooks") {
        whereClause.type = { in: ["LOGBOOK_SUBMITTED", "LOGBOOK_APPROVED", "LOGBOOK_PENDING", "LOGBOOK_DEADLINES", "ASSESSMENT_COMPLETED"] };
      } else if (category === "placements") {
        whereClause.type = { in: ["PLACEMENT_APPROVED", "PLACEMENT_ACTIVE", "PLACEMENT_PENDING", "ALLOCATION"] };
      }
    }

    if (search && search.trim()) {
      whereClause.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { message: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [allNotifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
    ]);

    // Calculate quick stats for the user
    const [totalCount, logbookCount, placementCount] = await Promise.all([
      prisma.notification.count({ where: { userId: user.id } }),
      prisma.notification.count({
        where: {
          userId: user.id,
          type: { in: ["LOGBOOK_SUBMITTED", "LOGBOOK_APPROVED", "LOGBOOK_PENDING", "LOGBOOK_DEADLINES", "ASSESSMENT_COMPLETED"] },
        },
      }),
      prisma.notification.count({
        where: {
          userId: user.id,
          type: { in: ["PLACEMENT_APPROVED", "PLACEMENT_ACTIVE", "PLACEMENT_PENDING", "ALLOCATION"] },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications: allNotifications,
      unreadCount,
      stats: {
        total: totalCount,
        unread: unreadCount,
        logbooks: logbookCount,
        placements: placementCount,
      },
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, title, message, type, link } = body;

    let targetUserId = userId;
    if (!targetUserId && email) {
      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (user) targetUserId = user.id;
    }

    if (!targetUserId || !title || !message) {
      return NextResponse.json({ success: false, error: "User, title, and message are required." }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        title,
        message,
        type: type || "INFO",
        link: link || null,
        read: false,
      },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Notification ID is required." }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: Boolean(read) },
    });

    return NextResponse.json({ success: true, notification: updated });
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const allRead = searchParams.get("allRead") === "true";
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    if (id) {
      await prisma.notification.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: "Notification deleted." });
    }

    if (allRead && email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.notification.deleteMany({
          where: { userId: user.id, read: true },
        });
        return NextResponse.json({ success: true, message: "All read notifications cleared." });
      }
    }

    return NextResponse.json({ success: false, error: "ID or allRead flag required." }, { status: 400 });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete notification" }, { status: 500 });
  }
}
