import { NextRequest } from "next/server";
import { requireUser } from "@/server/auth";
import { json, rateLimit, readJson, route } from "@/server/http";
import { saveIdea } from "@/server/ideas";
import { ideaSchema } from "@/server/schemas";

export const POST = route(async (req: NextRequest) => {
  const user = requireUser(req);
  rateLimit(`save:${user.id}`, 40, 60 * 60 * 1000);
  const body = await readJson(req, ideaSchema);
  const saved = saveIdea({
    user,
    trendId: body.trendId,
    platform: body.platform,
    format: body.format,
    hook: body.hook,
    outline: body.outline ?? "",
    strength: body.strength ?? null,
  });
  return json(saved);
});
