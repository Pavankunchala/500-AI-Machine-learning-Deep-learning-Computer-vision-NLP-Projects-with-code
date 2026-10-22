import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth";
import { json, route } from "@/server/http";
import { enqueueIngestion } from "@/server/ingest";

export const POST = route(async (req: NextRequest) => {
  const admin = requireAdmin(req);
  const result = await enqueueIngestion(admin.id);
  return json(result);
});
