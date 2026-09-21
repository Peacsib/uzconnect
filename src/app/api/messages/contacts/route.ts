import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getAuthorizedContactsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) return [];

  const contacts: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    roleLabel: string;
    orgLabel: string;
  }> = [];

  if (user.role === "STUDENT") {
    // 1. Student: His Lecturer, His Workplace Supervisor, The Coordinator
    const student = await prisma.student.findFirst({
      where: { userId: user.id },
      include: {
        placements: {
          where: { status: "ACTIVE" },
          include: {
            lecturer: { include: { user: true, department: true } },
            supervisor: { include: { user: true } },
            company: true,
          },
        },
      },
    });

    // Coordinator
    const coordinatorUsers = await prisma.user.findMany({
      where: { role: "COORDINATOR" },
    });
    for (const c of coordinatorUsers) {
      contacts.push({
        id: c.id,
        name: c.name,
        email: c.email,
        role: c.role,
        roleLabel: "Department Coordinator",
        orgLabel: "UZ WRL Directorate",
      });
    }

    // His Lecturer and His Supervisor
    if (student?.placements) {
      for (const p of student.placements) {
        if (p.lecturer?.user) {
          contacts.push({
            id: p.lecturer.user.id,
            name: p.lecturer.user.name,
            email: p.lecturer.user.email,
            role: "LECTURER",
            roleLabel: "Academic Supervisor (Assigned)",
            orgLabel: p.lecturer.department?.name || "University of Zimbabwe",
          });
        }
        if (p.supervisor?.user) {
          contacts.push({
            id: p.supervisor.user.id,
            name: p.supervisor.user.name,
            email: p.supervisor.user.email,
            role: "SUPERVISOR",
            roleLabel: "Workplace Mentor (Assigned)",
            orgLabel: p.company?.name || "Host Company",
          });
        }
      }
    }
  } else if (user.role === "LECTURER") {
    // 2. Lecturer: His assigned students, Their workplace supervisors, The coordinator
    const lecturer = await prisma.lecturer.findFirst({
      where: { userId: user.id },
      include: {
        placements: {
          where: { status: "ACTIVE" },
          include: {
            student: { include: { user: true, programme: true } },
            supervisor: { include: { user: true } },
            company: true,
          },
        },
      },
    });

    // Coordinator
    const coordinatorUsers = await prisma.user.findMany({
      where: { role: "COORDINATOR" },
    });
    for (const c of coordinatorUsers) {
      contacts.push({
        id: c.id,
        name: c.name,
        email: c.email,
        role: c.role,
        roleLabel: "Department Coordinator",
        orgLabel: "UZ WRL Directorate",
      });
    }

    if (lecturer?.placements) {
      const addedUsers = new Set<string>();
      for (const p of lecturer.placements) {
        if (p.student?.user && !addedUsers.has(p.student.user.id)) {
          addedUsers.add(p.student.user.id);
          contacts.push({
            id: p.student.user.id,
            name: p.student.user.name,
            email: p.student.user.email,
            role: "STUDENT",
            roleLabel: "Assigned Student Intern",
            orgLabel: `${p.student.regNumber} • ${p.company?.name || "Host Company"}`,
          });
        }
        if (p.supervisor?.user && !addedUsers.has(p.supervisor.user.id)) {
          addedUsers.add(p.supervisor.user.id);
          contacts.push({
            id: p.supervisor.user.id,
            name: p.supervisor.user.name,
            email: p.supervisor.user.email,
            role: "SUPERVISOR",
            roleLabel: "Industry Mentor",
            orgLabel: p.company?.name || "Host Company",
          });
        }
      }
    }
  } else if (user.role === "SUPERVISOR") {
    // 3. Supervisor: His students, The lecturer, NO COORDINATOR
    const supervisor = await prisma.supervisor.findFirst({
      where: { userId: user.id },
      include: {
        company: true,
        placements: {
          where: { status: "ACTIVE" },
          include: {
            student: { include: { user: true, programme: true } },
            lecturer: { include: { user: true, department: true } },
            company: true,
          },
        },
      },
    });

    if (supervisor?.placements) {
      const addedUsers = new Set<string>();
      for (const p of supervisor.placements) {
        if (p.student?.user && !addedUsers.has(p.student.user.id)) {
          addedUsers.add(p.student.user.id);
          contacts.push({
            id: p.student.user.id,
            name: p.student.user.name,
            email: p.student.user.email,
            role: "STUDENT",
            roleLabel: "Attached Intern",
            orgLabel: `${supervisor.company?.name || "Host Company"} • ${p.student.regNumber}`,
          });
        }
        if (p.lecturer?.user && !addedUsers.has(p.lecturer.user.id)) {
          addedUsers.add(p.lecturer.user.id);
          contacts.push({
            id: p.lecturer.user.id,
            name: p.lecturer.user.name,
            email: p.lecturer.user.email,
            role: "LECTURER",
            roleLabel: "Academic Supervisor",
            orgLabel: p.lecturer.department?.name || "University of Zimbabwe",
          });
        }
      }
    }
    // Explicitly NO coordinator contacts for supervisor
  } else if (user.role === "COORDINATOR") {
    // 4. Coordinator: All active students, lecturers, and workplace supervisors
    const allPlacements = await prisma.placement.findMany({
      where: { status: "ACTIVE" },
      include: {
        student: { include: { user: true } },
        lecturer: { include: { user: true, department: true } },
        supervisor: { include: { user: true } },
        company: true,
      },
    });
    const addedUsers = new Set<string>();
    for (const p of allPlacements) {
      if (p.student?.user && !addedUsers.has(p.student.user.id)) {
        addedUsers.add(p.student.user.id);
        contacts.push({
          id: p.student.user.id,
          name: p.student.user.name,
          email: p.student.user.email,
          role: "STUDENT",
          roleLabel: "Placed Student Intern",
          orgLabel: `${p.student.regNumber} • ${p.company.name}`,
        });
      }
      if (p.lecturer?.user && !addedUsers.has(p.lecturer.user.id)) {
        addedUsers.add(p.lecturer.user.id);
        contacts.push({
          id: p.lecturer.user.id,
          name: p.lecturer.user.name,
          email: p.lecturer.user.email,
          role: "LECTURER",
          roleLabel: "Academic Assessor",
          orgLabel: p.lecturer.department?.name || "University of Zimbabwe",
        });
      }
      if (p.supervisor?.user && !addedUsers.has(p.supervisor.user.id)) {
        addedUsers.add(p.supervisor.user.id);
        contacts.push({
          id: p.supervisor.user.id,
          name: p.supervisor.user.name,
          email: p.supervisor.user.email,
          role: "SUPERVISOR",
          roleLabel: "Workplace Mentor",
          orgLabel: p.company.name,
        });
      }
    }
  }

  return contacts;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: true, contacts: [] });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!currentUser) {
      return NextResponse.json({ success: true, contacts: [] });
    }

    const contacts = await getAuthorizedContactsForUser(currentUser.id);

    return NextResponse.json({
      success: true,
      contacts,
    });
  } catch (error: any) {
    console.error("Error fetching message contacts:", error);
    return NextResponse.json({ success: false, error: "Failed to load contacts" }, { status: 500 });
  }
}
