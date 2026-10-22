"use client";

import { ProfileForm } from "@/components/profile-form";
import { Shell } from "@/components/shell";
import { RequireUser } from "@/components/session";

export default function ProfilePage() {
  return (
    <Shell>
      <RequireUser needProfile={false}>
        <ProfileForm mode="edit" />
      </RequireUser>
    </Shell>
  );
}
