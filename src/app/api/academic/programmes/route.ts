import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import staticProgrammes from "@/data/programmes.json";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search");

    const programmes = await prisma.programme.findMany({
      where: {
        ...(departmentId ? { departmentId: Number(departmentId) } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (!programmes || programmes.length === 0) {
      return NextResponse.json({ programmes: staticProgrammes });
    }

    return NextResponse.json({ programmes });
  } catch (error) {
    return NextResponse.json({ programmes: staticProgrammes });
  }
}
