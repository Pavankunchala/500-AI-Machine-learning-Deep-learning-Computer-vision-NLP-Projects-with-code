export const DEMO_CREATOR = {
  email: "demo@trendpulse.dev",
  password: "PulseDemo!2026",
  name: "Demo Creator",
};

export const DEMO_ADMIN = {
  email: "admin@trendpulse.dev",
  password: "PulseAdmin!2026",
  name: "Admin",
};

export function demoHintsEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_LOGIN !== "false";
}
