import { NextResponse } from "next/server";
import { adminCookieHeader, adminSecret } from "@/lib/admin";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== adminSecret()) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", adminCookieHeader());
  return res;
}
