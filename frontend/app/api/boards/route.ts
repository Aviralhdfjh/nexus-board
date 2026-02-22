import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();
    const boards = await prisma.board.findMany({
      where: {
        members: { some: { userId: user.id } },
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        members: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(boards);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const title = String(body?.title ?? "Untitled Board").slice(0, 200);
    const board = await prisma.board.create({
      data: {
        title,
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
      },
    });
    return NextResponse.json(board);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
