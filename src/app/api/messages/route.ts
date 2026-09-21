import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getAuthorizedContactsForUser } from "@/app/api/messages/contacts/route";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: true, messages: [] });
    }

    // Get authorized contacts to strictly scope conversation history
    const authorizedContacts = await getAuthorizedContactsForUser(user.id);
    const authorizedIds = new Set(authorizedContacts.map((c) => c.id));

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: { in: Array.from(authorizedIds) } },
          { receiverId: user.id, senderId: { in: Array.from(authorizedIds) } },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { receiverId, subject, content, email: emailParam } = body;

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const sender = await prisma.user.findUnique({ where: { email } });
    if (!sender) {
      return NextResponse.json({ success: false, error: "Sender not found" }, { status: 404 });
    }

    if (!receiverId || !content) {
      return NextResponse.json({ success: false, error: "Recipient and message content are required" }, { status: 400 });
    }

    // Enforce strict communication boundaries
    const authorizedContacts = await getAuthorizedContactsForUser(sender.id);
    const isAuthorized = authorizedContacts.some((c) => c.id === receiverId);

    if (!isAuthorized) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized: Communication is strictly restricted to your assigned tripartite supervision contacts." 
        }, 
        { status: 403 }
      );
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return NextResponse.json({ success: false, error: "Receiver not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        subject: subject || "WRL Communication",
        content,
        read: false,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: receiver.id,
        title: `New Message from ${sender.name}`,
        message: content.length > 100 ? content.slice(0, 97) + "..." : content,
        type: "MESSAGE",
        read: false,
        link: receiver.role === "STUDENT" ? "/student/messages" 
             : receiver.role === "LECTURER" ? "/lecturer/messages"
             : receiver.role === "SUPERVISOR" ? "/supervisor/messages"
             : "/coordinator/messages",
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
