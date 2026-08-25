import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearAdminCookie());
  return res;
}
