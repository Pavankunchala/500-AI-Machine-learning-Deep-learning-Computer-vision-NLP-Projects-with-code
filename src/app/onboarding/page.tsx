"use client";

import { ProfileForm } from "@/components/profile-form";
import { Shell } from "@/components/shell";
import { RequireUser } from "@/components/session";

export default function OnboardingPage() {
  return (
    <Shell>
      <RequireUser needProfile={false}>
        <ProfileForm mode="onboarding" />
      </RequireUser>
    </Shell>
  );
}
