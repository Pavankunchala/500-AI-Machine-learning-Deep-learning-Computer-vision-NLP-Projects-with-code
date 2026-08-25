import { NextResponse } from "next/server";
import { appendRuntime } from "@/lib/runtime";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.email || typeof body.email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  appendRuntime("subscribers.json", {
    email: body.email.toLowerCase().trim(),
    whatsapp: Boolean(body.whatsapp),
    at: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
