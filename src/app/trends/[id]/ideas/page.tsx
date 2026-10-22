"use client";

import { use } from "react";
import { IdeaLab } from "@/components/idea-lab";
import { Shell } from "@/components/shell";
import { RequireUser } from "@/components/session";

export default function IdeasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Shell>
      <RequireUser>
        <IdeaLab trendId={id} />
      </RequireUser>
    </Shell>
  );
}
