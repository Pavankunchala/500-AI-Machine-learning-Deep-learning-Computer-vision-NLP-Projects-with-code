import { NextRequest } from "next/server";
import { requireUser } from "@/server/auth";
import { json, route } from "@/server/http";
import { listBoard } from "@/server/ideas";

export const GET = route(async (req: NextRequest) => {
  const user = requireUser(req);
  const items = listBoard(user.id).map((row) => ({
    id: row.id,
    trendId: row.trend_id,
    trendName: row.trend_name ?? "Saved trend",
    platform: row.platform,
    format: row.format,
    hook: row.hook,
    outline: row.outline,
    status: row.status,
    notes: row.notes,
    strength: row.strength_json ? JSON.parse(row.strength_json) : null,
    createdAt: row.created_at,
  }));
  return json({ items });
});
