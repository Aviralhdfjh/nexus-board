import { redirect } from "next/navigation";
import { requireBoardAccess } from "@/lib/auth";
import Whiteboard from "@/components/Whiteboard";
import { WelcomeBanner } from "@/components/WelcomeBanner";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let user;
  try {
    const access = await requireBoardAccess(id);
    user = access.user;
  } catch {
    // If access is denied, send logged-in users back to their boards instead of landing.
    redirect("/boards");
  }

  const displayName = (user && (user.name || user.email)) || "Creator";

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-50">
      <WelcomeBanner name={displayName} />
      <Whiteboard />
    </main>
  );
}
