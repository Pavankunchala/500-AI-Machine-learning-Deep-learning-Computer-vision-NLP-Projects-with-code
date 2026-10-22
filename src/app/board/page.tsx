"use client";

import { Board } from "@/components/board";
import { Shell } from "@/components/shell";
import { RequireUser } from "@/components/session";

export default function BoardPage() {
  return (
    <Shell>
      <RequireUser>
        <Board />
      </RequireUser>
    </Shell>
  );
}
