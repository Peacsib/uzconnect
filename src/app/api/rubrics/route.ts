import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_RUBRICS = [
  {
    id: "rubric-uz-standard-1",
    name: "Standard UZ Work-Related Learning Assessment Rubric",
    description: "Official University of Zimbabwe grading scheme: 40% Industry Supervisor appraisal and 60% University Academic Assessor visit.",
    supervisor_weight: 40,
    lecturer_weight: 60,
    is_active: true,
    criteria: {
      industrial_appraisal: [
        { name: "Technical Competence & Problem Solving", weight: 15 },
        { name: "Work Ethic, Professionalism & Attendance", weight: 15 },
        { name: "Teamwork, Initiative & Adaptability", weight: 10 }
      ],
      academic_assessment: [
        { name: "Attachment Logbook Quality & Regularity", weight: 20 },
        { name: "Oral Presentation & Knowledge of Industry Context", weight: 20 },
        { name: "WRL Technical Project Report", weight: 20 }
      ]
    },
    created_at: "2026-01-15T08:00:00.000Z",
    updated_at: "2026-01-15T08:00:00.000Z",
  },
];

export async function GET() {
  try {
    const rubrics = await prisma.rubric.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (rubrics.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_RUBRICS,
      });
    }

    const mapped = rubrics.map((r: any, idx: number) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      criteria: r.criteria,
      supervisor_weight: 40,
      lecturer_weight: 60,
      is_active: idx === 0,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    console.error("GET /api/rubrics error:", error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_RUBRICS,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rubric = await prisma.rubric.create({
      data: {
        name: body.name || "Untitled Rubric",
        description: body.description || "",
        criteria: body.criteria || {},
        maxScore: 100,
      },
    });

    return NextResponse.json({
      success: true,
      data: rubric,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create rubric" },
      { status: 500 }
    );
  }
}
