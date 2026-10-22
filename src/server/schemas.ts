import { z } from "zod";
import { ALERT_CHANNELS, AUDIENCES, IDEA_STATUSES, LANGUAGES, NICHES, PLANS, PLATFORMS, SPICES, TONES } from "@/lib/types";

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(160),
  password: z.string().min(10).max(200),
  company_website: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(200),
  totp: z.string().max(8).optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  niche: z.enum(NICHES),
  audience: z.enum(AUDIENCES),
  tone: z.enum(TONES),
  language: z.enum(LANGUAGES),
  platforms: z.array(z.enum(PLATFORMS)).min(1).max(4),
});

export const ideaSchema = z.object({
  trendId: z.string().regex(/^[a-z0-9:-]{1,90}$/),
  platform: z.enum(PLATFORMS),
  format: z.enum(["tweet", "reel", "carousel", "youtube", "angle"]),
  hook: z.string().trim().min(1).max(500),
  outline: z.string().max(4000).optional(),
  strength: z
    .object({
      clarity: z.number(),
      curiosity: z.number(),
      controversy: z.number(),
    })
    .nullable()
    .optional(),
});

export const ideaPatchSchema = z.object({
  status: z.enum(IDEA_STATUSES).optional(),
  notes: z.string().max(2000).optional(),
});

export const alertSchema = z.object({
  niche: z.enum(NICHES),
  threshold: z.number().min(10).max(500),
  channel: z.enum(ALERT_CHANNELS),
  destination: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
});

export const hookSchema = z.object({
  index: z.number().int().min(0).max(9),
  spice: z.enum(SPICES).default("base"),
  variant: z.number().int().min(0).max(12).default(1),
});

export const spiceSchema = z.object({
  spice: z.enum(SPICES).default("base"),
});

export const totpSchema = z.object({
  code: z.string().trim().min(6).max(8),
});

export const planSchema = z.object({
  userId: z.string().uuid(),
  plan: z.enum(PLANS),
});
