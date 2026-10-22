import { NextRequest } from "next/server";
import { evaluateAlerts, listAlerts, saveAlert } from "@/server/alerts";
import { requireUser } from "@/server/auth";
import { HttpError, json, readJson, route } from "@/server/http";
import { alertSchema } from "@/server/schemas";

export const GET = route(async (req: NextRequest) => {
  const user = requireUser(req);
  await evaluateAlerts(user);
  return json({ alerts: listAlerts(user.id) });
});

export const POST = route(async (req: NextRequest) => {
  const user = requireUser(req);
  const body = await readJson(req, alertSchema);
  if (body.channel === "whatsapp" && !body.destination) {
    throw new HttpError(400, "Add a phone number with country code for WhatsApp.");
  }
  const id = saveAlert(user, body);
  return json({ id, alerts: listAlerts(user.id) });
});
