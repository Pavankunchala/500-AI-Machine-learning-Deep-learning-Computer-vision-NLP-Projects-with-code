import { NextRequest } from "next/server";
import { attachSession, createSession, findUserByEmail, publicUser, totpSecret } from "@/server/auth";
import { audit } from "@/server/db";
import { clientIp, HttpError, json, rateLimit, readJson, route } from "@/server/http";
import { hashPassword, verifyPassword } from "@/server/password";
import { loginSchema } from "@/server/schemas";
import { verifyTotp } from "@/server/totp";

let dummyHash: string | null = null;

export const POST = route(async (req: NextRequest) => {
  rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000);
  const body = await readJson(req, loginSchema);
  const user = findUserByEmail(body.email.toLowerCase());
  dummyHash ??= await hashPassword("not-a-real-password-value");
  const ok = await verifyPassword(body.password, user?.password_hash ?? dummyHash);
  if (!user || !ok) throw new HttpError(401, "Email or password is incorrect.");
  if (user.totp_enabled) {
    const secret = totpSecret(user);
    if (!body.totp) throw new HttpError(401, "Enter the 6-digit authenticator code.", "TOTP_REQUIRED");
    if (!secret || !verifyTotp(secret, body.totp)) throw new HttpError(401, "That authenticator code is not valid.");
  }
  audit(user.id, "auth.login");
  const res = json({ user: publicUser(user) });
  attachSession(res, createSession(user.id, req.headers.get("user-agent")));
  return res;
});
