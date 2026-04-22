import { NextResponse } from "next/server";

// Stub implementation: integrate with your user store and token verification.
export async function POST(request: Request) {
  const { token, password } = await request.json().catch(() => ({}));

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  // TODO:
  // - Validate token (lookup in DB, check expiry and user)
  // - Hash the new password and update the user record
  // - Invalidate the token so it can't be reused

  return NextResponse.json({ ok: true });
}

