import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma, isPrismaConnectionError } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const hashed = await hash(password, 12);
    await prisma.user.create({
      data: { email, password: hashed, name: name ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isPrismaConnectionError(e)) {
      return NextResponse.json(
        {
          error:
            "Database unavailable. Start PostgreSQL (e.g. run: docker compose up -d in the project root).",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
