import { redirect } from "next/navigation";
import { requireBoardAccess } from "@/lib/auth";
import Whiteboard from "@/components/Whiteboard";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    await requireBoardAccess(id);
  } catch {
    redirect("/");
  }
  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-50">
      <Whiteboard />
    </main>
  );
}
