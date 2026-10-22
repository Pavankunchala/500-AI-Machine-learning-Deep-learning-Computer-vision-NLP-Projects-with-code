import { z } from "zod";
import { allowedPercents, generateIdeaPack, rateHook, ungroundedPercents, type IdeaContext } from "@/lib/ideas";
import type { IdeaPack } from "@/lib/types";

const PackSchema = z.object({
  trend_summary: z.string().min(1),
  why_trending: z.string().min(1),
  audience_emotion: z.string().min(1),
  content_angles: z.array(z.string()).min(1),
  tweet_hooks: z.array(z.string()).length(10),
  reel_ideas: z
    .array(
      z.object({
        title: z.string(),
        hook: z.string(),
        beats: z.array(z.string()).min(2),
        duration: z.string(),
      }),
    )
    .length(5),
  carousel_outline: z.array(z.object({ title: z.string(), slides: z.array(z.string()).min(3) })).length(3),
  youtube_titles: z.array(z.string()).length(5),
  cta: z.array(z.string()).min(1),
  posting_window: z.string(),
  best_angle: z.string(),
  disclaimer: z.string(),
});

export async function createPack(ctx: IdeaContext, posts: { text: string; origin: string }[]): Promise<{ pack: IdeaPack; source: "llm" | "local" }> {
  const local = () => ({ pack: generateIdeaPack(ctx), source: "local" as const });
  if (!process.env.LLM_API_KEY) return local();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    const response = await fetch(process.env.LLM_BASE_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Draft creator ideas from the supplied snapshot only. Do not invent statistics, percentages, quotes, or real-person attribution. If a number is not in the context, omit it. Return JSON with trend_summary, why_trending, audience_emotion, content_angles, tweet_hooks (10 strings), reel_ideas (5 objects with title, hook, beats, duration), carousel_outline (3 objects with title, slides), youtube_titles (5 strings), cta, posting_window, best_angle, disclaimer. disclaimer must say these are idea starters and not a promise of reach.",
          },
          {
            role: "user",
            content: JSON.stringify({
              trend: ctx.trend,
              posts,
              creator: ctx.profile,
              spice: ctx.spice,
            }),
          },
        ],
      }),
    });
    clearTimeout(timer);
    if (!response.ok) return local();
    const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = body.choices?.[0]?.message?.content;
    if (!content) return local();
    const parsed = PackSchema.safeParse(JSON.parse(content));
    if (!parsed.success) return local();
    const pack: IdeaPack = {
      ...parsed.data,
      tweet_hooks: parsed.data.tweet_hooks.map((text) => ({ text, strength: rateHook(text) })),
    };
    const blob = JSON.stringify(pack);
    if (ungroundedPercents(blob, allowedPercents(ctx.trend)).length) return local();
    if (/@\w/.test(blob)) return local();
    return { pack, source: "llm" };
  } catch {
    return local();
  }
}
