const base = (path: string) => `/api/boards${path}`;

export type Board = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string | null; image: string | null };
  members?: Array<{
    id: string;
    role: string;
    user: { id: string; name: string | null; image: string | null };
  }>;
};

export async function getBoards(): Promise<Board[]> {
  const res = await fetch(base(""), { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getBoard(id: string): Promise<Board> {
  const res = await fetch(base(`/${id}`), { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createBoard(title: string): Promise<Board> {
  const res = await fetch(base(""), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateBoard(id: string, title: string): Promise<Board> {
  const res = await fetch(base(`/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteBoard(id: string): Promise<void> {
  const res = await fetch(base(`/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getBoardMembers(boardId: string) {
  const res = await fetch(base(`/${boardId}/members`), {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function inviteMember(
  boardId: string,
  email: string,
  role: "EDITOR" | "VIEWER"
) {
  const res = await fetch(base(`/${boardId}/members`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
