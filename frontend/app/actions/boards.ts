"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireBoardAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createBoard(formData: FormData) {
  const user = await requireAuth();
  const title = (formData.get("title") as string)?.slice(0, 200) ?? "Untitled Board";
  await prisma.board.create({
    data: {
      title,
      ownerId: user.id,
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });
  revalidatePath("/");
}

export async function updateBoardTitle(boardId: string, title: string) {
  await requireBoardAccess(boardId, ["OWNER", "EDITOR"]);
  await prisma.board.update({
    where: { id: boardId },
    data: { title: title.slice(0, 200) },
  });
  revalidatePath(`/board/${boardId}`);
}

export async function deleteBoard(boardId: string) {
  await requireBoardAccess(boardId, ["OWNER"]);
  await prisma.board.delete({ where: { id: boardId } });
  revalidatePath("/");
}
