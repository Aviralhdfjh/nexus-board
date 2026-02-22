import { NextResponse } from "next/server";
import { requireBoardAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireBoardAccess(id);
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Number(limitParam) || 100, 200);
    const messages = await prisma.message.findMany({
      where: { boardId: id },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: { user: { select: { id: true, name: true, image: true } } },
    });
    return NextResponse.json(messages);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Forbidden" },
      { status: 403 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireBoardAccess(id, ["OWNER", "EDITOR", "VIEWER"]);
    const body = await req.json();
    const content = String(body?.content ?? "").trim().slice(0, 500);
    if (!content) return NextResponse.json({ error: "Empty content" }, { status: 400 });
    const message = await prisma.message.create({
      data: { boardId: id, userId: user.id, content },
      include: { user: { select: { id: true, name: true, image: true } } },
    });
    return NextResponse.json(message);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Forbidden" },
      { status: 403 }
    );
  }
}
