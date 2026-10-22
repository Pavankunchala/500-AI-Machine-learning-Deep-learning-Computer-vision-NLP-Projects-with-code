"use client";

import { Leaderboard } from "@/components/leaderboard";
import { Shell } from "@/components/shell";
import { RequireUser } from "@/components/session";

export default function LeaderboardPage() {
  return (
    <Shell>
      <RequireUser>
        <Leaderboard />
      </RequireUser>
    </Shell>
  );
}
