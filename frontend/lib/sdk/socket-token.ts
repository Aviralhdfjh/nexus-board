/** Client-only: fetch JWT for Socket.io handshake. No server auth imports. */
export async function getTokenForSocket(): Promise<string | null> {
  const res = await fetch("/api/auth/socket-token", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.token ?? null;
}
