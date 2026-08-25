import { NextResponse } from "next/server";
import { appendRuntime } from "@/lib/runtime";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  appendRuntime("messages.json", { ...body, at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
