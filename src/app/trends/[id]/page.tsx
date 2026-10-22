"use client";

import { use } from "react";
import { TrendDetailView } from "@/components/trend-detail";
import { Shell } from "@/components/shell";
import { RequireUser } from "@/components/session";

export default function TrendPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Shell>
      <RequireUser>
        <TrendDetailView id={id} />
      </RequireUser>
    </Shell>
  );
}
