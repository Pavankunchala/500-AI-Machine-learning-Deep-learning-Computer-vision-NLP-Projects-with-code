import { NextRequest } from "next/server";
import { NICHES } from "@/lib/types";
import { weekStartUtc } from "@/lib/format";
import { requireUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { json, route } from "@/server/http";

export const GET = route(async (req: NextRequest) => {
  const user = requireUser(req);
  const requested = req.nextUrl.searchParams.get("niche");
  const niche = requested && (NICHES as readonly string[]).includes(requested) ? requested : user.niche || "education";
  const rows = getDb()
    .prepare(
      `SELECT u.name, u.niche, COUNT(*) AS saves
       FROM content_ideas c JOIN users u ON u.id = c.user_id
       WHERE c.created_at >= ? AND u.niche = ?
       GROUP BY u.id
       ORDER BY saves DESC, u.name ASC
       LIMIT 20`,
    )
    .all(weekStartUtc(), niche) as { name: string; niche: string; saves: number }[];
  return json({ niche, weekStart: weekStartUtc(), rows });
});
