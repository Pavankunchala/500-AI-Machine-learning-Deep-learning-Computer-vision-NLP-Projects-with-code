"use client";

import { TrendList } from "@/components/trend-list";
import { Shell } from "@/components/shell";
import { RequireUser } from "@/components/session";

export default function RadarPage() {
  return (
    <Shell>
      <RequireUser>
        <TrendList />
      </RequireUser>
    </Shell>
  );
}
