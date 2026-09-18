import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'active' or all submissions

    if (type === "active") {
      const placements = await prisma.placement.findMany({
        where: { status: "ACTIVE" },
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
          lecturer: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: placements,
      });
    }

    // Default: fetch placement submissions
    const submissions = await prisma.placementSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: {
            user: true,
            programme: true,
          },
        },
      },
    });

    const formatted = submissions.map((sub) => ({
      id: sub.id,
      student_id: sub.student.regNumber || sub.student.user.regNumber || sub.studentId,
      student_name: sub.student.user.name,
      student_email: sub.student.user.email,
      programme_code: sub.student.programme.code,
      programme_name: sub.student.programme.name,
      company_name: sub.companyName,
      company_address: sub.companyAddress,
      city: sub.companyCity,
      company_city: sub.companyCity,
      supervisor_name: sub.supervisorName,
      supervisor_email: sub.supervisorEmail,
      supervisor_phone: sub.supervisorPhone,
      position: sub.position,
      start_date: sub.startDate ? sub.startDate.toISOString().split("T")[0] : "",
      end_date: sub.endDate ? sub.endDate.toISOString().split("T")[0] : "",
      status: sub.status.toLowerCase(), // 'pending', 'approved', 'rejected'
      submitted_at: sub.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Error fetching coordinator placements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch placements." },
      { status: 500 }
    );
  }
}
