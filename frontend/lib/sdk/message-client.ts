const base = (boardId: string) => `/api/boards/${boardId}/messages`;

export type Message = {
  id: string;
  boardId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
};

export async function getMessages(boardId: string, limit = 100): Promise<Message[]> {
  const res = await fetch(`${base(boardId)}?limit=${limit}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendMessage(boardId: string, content: string): Promise<Message> {
  const res = await fetch(base(boardId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content: content.trim().slice(0, 500) }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
