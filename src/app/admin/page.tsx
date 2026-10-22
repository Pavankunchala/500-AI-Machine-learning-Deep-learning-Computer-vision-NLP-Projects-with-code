"use client";

import { AdminDashboard } from "@/components/admin-dashboard";
import { Shell } from "@/components/shell";
import { RequireUser } from "@/components/session";

export default function AdminPage() {
  return (
    <Shell>
      <RequireUser admin needProfile={false}>
        <AdminDashboard />
      </RequireUser>
    </Shell>
  );
}
