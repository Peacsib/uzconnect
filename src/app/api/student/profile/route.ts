import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import staticProgrammes from "@/data/programmes.json";
import staticDepartments from "@/data/departments.json";
import staticFaculties from "@/data/faculties.json";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const email = (session?.user?.email || emailParam || "").trim().toLowerCase();

    // 1. Query Prisma DB if email or user exists
    let studentData: any = null;

    if (email) {
      const regPrefix = email.includes("@") ? email.split("@")[0].toUpperCase() : "";
      
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { user: { email } },
            ...(regPrefix ? [{ regNumber: regPrefix }] : []),
          ],
        },
        include: {
          user: true,
          programme: {
            include: {
              department: {
                include: {
                  faculty: true,
                },
              },
            },
          },
          placements: {
            include: {
              company: true,
              supervisor: { include: { user: true } },
              lecturer: { include: { user: true } },
            },
          },
          placementSubmissions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (student) {
        studentData = {
          id: student.id,
          userId: student.userId,
          name: student.user.name,
          email: student.user.email,
          regNumber: student.regNumber,
          phone: student.phone,
          programme: {
            id: student.programme.id,
            code: student.programme.code,
            name: student.programme.name,
            duration: student.programme.duration,
            department: student.programme.department.name,
            faculty: student.programme.department.faculty.name,
          },
          activePlacement: student.placements[0] || null,
          latestSubmission: student.placementSubmissions[0] || null,
        };
      }
    }

    // 2. If not found in DB, provide enriched fallback
    if (!studentData) {
      // Default to Peace Sibanda / R2421428 with HBMSDA
      const fallbackProg = staticProgrammes.find((p) => p.code === "HBMSDA") || staticProgrammes[0];
      const dept = staticDepartments.find((d) => d.id === fallbackProg.department_id);
      const fac = staticFaculties.find((f) => f.id === dept?.faculty_id);

      studentData = {
        id: "stu_demo",
        userId: session?.user?.id || "u_demo",
        name: session?.user?.name || "Peace Sibanda",
        email: email || "r2421428@uofzmail.uz.ac.zw",
        regNumber: email ? (email.split("@")[0].toUpperCase()) : "R2421428",
        phone: "+263 77 123 4567",
        programme: {
          id: fallbackProg.id,
          code: fallbackProg.code,
          name: fallbackProg.name,
          duration: 4,
          department: dept?.name || "Department of Business Studies",
          faculty: fac?.name || "Faculty of Business Management Sciences and Economics",
        },
        activePlacement: null,
        latestSubmission: null,
      };
    }

    return NextResponse.json({ success: true, data: studentData });
  } catch (error: any) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load student profile" },
      { status: 500 }
    );
  }
}
