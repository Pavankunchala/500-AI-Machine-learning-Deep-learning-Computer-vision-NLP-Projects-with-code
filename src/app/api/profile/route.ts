import { NextRequest } from "next/server";
import { publicUser, requireUser } from "@/server/auth";
import { getDb, roleForPlan } from "@/server/db";
import { json, readJson, route } from "@/server/http";
import { profileSchema } from "@/server/schemas";

export const PATCH = route(async (req: NextRequest) => {
  const user = requireUser(req);
  const body = await readJson(req, profileSchema);
  const role = roleForPlan(user.plan, user.role);
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE users SET name = ?, niche = ?, audience = ?, tone = ?, language = ?, platforms = ?, onboarded = 1, role = ?, updated_at = ? WHERE id = ?`,
    )
    .run(body.name || user.name, body.niche, body.audience, body.tone, body.language, JSON.stringify(body.platforms), role, now, user.id);
  return json({ user: publicUser(requireUser(req)) });
});
