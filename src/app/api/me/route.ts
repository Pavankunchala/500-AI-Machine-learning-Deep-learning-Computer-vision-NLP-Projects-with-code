import { NextRequest } from "next/server";
import { publicUser, requireUser } from "@/server/auth";
import { json, route } from "@/server/http";

export const GET = route(async (req: NextRequest) => {
  return json({ user: publicUser(requireUser(req)) });
});
