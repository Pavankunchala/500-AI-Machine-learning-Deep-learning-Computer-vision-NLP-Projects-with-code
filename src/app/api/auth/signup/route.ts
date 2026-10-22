import { NextRequest } from "next/server";
import { attachSession, createSession, findUserByEmail, publicUser } from "@/server/auth";
import { audit, getDb } from "@/server/db";
import { clientIp, HttpError, json, rateLimit, readJson, route } from "@/server/http";
import { hashPassword } from "@/server/password";
import { signupSchema } from "@/server/schemas";

export const POST = route(async (req: NextRequest) => {
  rateLimit(`signup:${clientIp(req)}`, 5, 60 * 60 * 1000);
  const body = await readJson(req, signupSchema);
  if (body.company_website) throw new HttpError(400, "Signup could not be completed.");
  const email = body.email.toLowerCase();
  if (findUserByEmail(email)) throw new HttpError(409, "An account with that email already exists.");
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  getDb()
    .prepare(
      `INSERT INTO users (
        id, email, password_hash, name, role, platforms, plan, onboarded, badges, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'user', '[]', 'free', 0, '[]', ?, ?)`,
    )
    .run(id, email, await hashPassword(body.password), body.name, now, now);
  audit(id, "auth.signup");
  const user = findUserByEmail(email)!;
  const res = json({ user: publicUser(user) });
  attachSession(res, createSession(user.id, req.headers.get("user-agent")));
  return res;
});
