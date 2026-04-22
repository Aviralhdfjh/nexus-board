import { NextResponse } from "next/server";

// Stub implementation: integrate with your email provider and token storage.
export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // TODO: Look up user by email, generate a secure token, store it with expiry,
  // and send an email containing a link to /reset-password?token=...

  // Always respond with success to avoid leaking which emails exist.
  return NextResponse.json({ ok: true });
}

