import { DEMO_ADMIN, DEMO_CREATOR, demoHintsEnabled } from "@/server/demo";
import { json, route } from "@/server/http";

export const GET = route(async () => {
  if (!demoHintsEnabled()) return json({ enabled: false });
  return json({
    enabled: true,
    creator: { email: DEMO_CREATOR.email, password: DEMO_CREATOR.password },
    admin: { email: DEMO_ADMIN.email, password: DEMO_ADMIN.password },
  });
});
