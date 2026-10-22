import { NextRequest } from "next/server";
import { requireUser, totpSecret } from "@/server/auth";
import { encrypt } from "@/server/crypto";
import { audit, getDb } from "@/server/db";
import { HttpError, json, readJson, route } from "@/server/http";
import { totpSchema } from "@/server/schemas";
import { generateTotpSecret, otpauthUrl, verifyTotp } from "@/server/totp";

export const POST = route(async (req: NextRequest) => {
  const user = requireUser(req);
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "verify") {
    const body = await readJson(req, totpSchema);
    const secret = totpSecret(user);
    if (!secret || !verifyTotp(secret, body.code)) throw new HttpError(400, "That authenticator code is not valid.");
    getDb().prepare("UPDATE users SET totp_enabled = 1, updated_at = ? WHERE id = ?").run(new Date().toISOString(), user.id);
    audit(user.id, "auth.totp_enable");
    return json({ enabled: true });
  }
  const secret = generateTotpSecret();
  getDb()
    .prepare("UPDATE users SET totp_secret = ?, totp_enabled = 0, updated_at = ? WHERE id = ?")
    .run(encrypt(secret), new Date().toISOString(), user.id);
  audit(user.id, "auth.totp_setup");
  return json({ secret, url: otpauthUrl(secret, user.email) });
});
