import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const facultyId = searchParams.get("faculty_id");
    const departmentId = searchParams.get("department_id");
    const programmeId = searchParams.get("programme_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { regNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (programmeId && programmeId !== "all") {
      where.programmeId = parseInt(programmeId);
    } else if (departmentId && departmentId !== "all") {
      where.programme = { departmentId: parseInt(departmentId) };
    } else if (facultyId && facultyId !== "all") {
      where.programme = {
        department: { facultyId: parseInt(facultyId) },
      };
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
            },
            take: 1,
          },
          placementSubmissions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
    ]);

    const formatted = students.map((s) => {
      const activePlacement = s.placements[0] || null;
      const latestSub = s.placementSubmissions[0] || null;

      let status = "NO_PLACEMENT";
      let statusLabel = "Placement Needed";
      let companyName = null;

      if (activePlacement) {
        status = "ACTIVE";
        statusLabel = "Active Attachment";
        companyName = activePlacement.company?.name || "Host Organization";
      } else if (latestSub) {
        status = latestSub.status;
        statusLabel = latestSub.status === "PENDING" ? "Under Review" : latestSub.status;
        companyName = latestSub.companyName;
      }

      return {
        id: s.id,
        user_id: s.userId,
        reg_number: s.regNumber || s.user.regNumber,
        phone: s.phone,
        user: {
          id: s.user.id,
          name: s.user.name,
          email: s.user.email,
          reg_number: s.user.regNumber || s.regNumber,
          role: s.user.role,
        },
        programme: {
          id: s.programme.id,
          code: s.programme.code,
          name: s.programme.name,
          department: {
            id: s.programme.department.id,
            name: s.programme.department.name,
            faculty: {
              id: s.programme.department.faculty.id,
              name: s.programme.department.faculty.name,
            },
          },
        },
        status,
        statusLabel,
        companyName,
        createdAt: s.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching coordinator students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch students." },
      { status: 500 }
    );
  }
}
