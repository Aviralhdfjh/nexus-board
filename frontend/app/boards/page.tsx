import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CreateBoardForm } from "./CreateBoardForm";

export default async function BoardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const boards = await prisma.board.findMany({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { updatedAt: "desc" },
    include: { owner: { select: { name: true } }, _count: { select: { members: true } } },
  });

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-neutral-900">My boards</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {session.user.email}
        </p>

        <CreateBoardForm />

        <ul className="mt-6 space-y-2">
          {boards.map((b) => (
            <li key={b.id}>
              <Link
                href={`/board/${b.id}`}
                className="block rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm hover:border-blue-300 hover:shadow"
              >
                <span className="font-medium text-neutral-900">{b.title}</span>
                <span className="ml-2 text-sm text-neutral-500">
                  {b._count.members} member{b._count.members !== 1 ? "s" : ""}
                  {b.owner.name && ` · ${b.owner.name}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {boards.length === 0 && (
          <p className="mt-6 text-sm text-neutral-500">No boards yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}

