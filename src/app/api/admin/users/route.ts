import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth";
import { audit, getDb, roleForPlan } from "@/server/db";
import { HttpError, json, readJson, route } from "@/server/http";
import { planSchema } from "@/server/schemas";
import type { Plan, Role } from "@/lib/types";

export const PATCH = route(async (req: NextRequest) => {
  const admin = requireAdmin(req);
  const body = await readJson(req, planSchema);
  const row = getDb().prepare("SELECT role FROM users WHERE id = ?").get(body.userId) as { role: Role } | undefined;
  if (!row) throw new HttpError(404, "User not found.");
  const role = roleForPlan(body.plan as Plan, row.role);
  getDb().prepare("UPDATE users SET plan = ?, role = ?, updated_at = ? WHERE id = ?").run(body.plan, role, new Date().toISOString(), body.userId);
  audit(admin.id, "admin.plan", `${body.userId}:${body.plan}`);
  return json({ ok: true });
});
