"use client";

import { AlertsPanel } from "@/components/alerts-panel";
import { Shell } from "@/components/shell";
import { RequireUser } from "@/components/session";

export default function AlertsPage() {
  return (
    <Shell>
      <RequireUser>
        <AlertsPanel />
      </RequireUser>
    </Shell>
  );
}
