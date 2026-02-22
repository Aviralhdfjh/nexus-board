import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function requireBoardAccess(
  boardId: string,
  roles?: Array<"OWNER" | "EDITOR" | "VIEWER">
) {
  const user = await requireAuth();
  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: user.id } },
    include: { board: true },
  });
  if (!member) throw new Error("Forbidden");
  if (roles && !roles.includes(member.role)) throw new Error("Forbidden");
  return { user, member, board: member.board };
}
