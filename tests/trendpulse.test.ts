import assert from "node:assert/strict";
import test from "node:test";
import { windowsFor } from "../src/lib/constants";
import { generateIdeaPack, ungroundedPercents } from "../src/lib/ideas";
import { growthPercent, trendScore } from "../src/lib/score";
import { SEED_TRENDS } from "../src/lib/seed";
import { base32Encode, totpCode } from "../src/server/totp";
import type { CreatorProfile } from "../src/lib/types";

const profile = (language: CreatorProfile["language"]): CreatorProfile => ({
  niche: "education",
  audience: "students",
  tone: "educational",
  language,
  platforms: ["x"],
});

test("trend score uses the documented weights", () => {
  assert.equal(trendScore(100, 0, 0, 0), 35);
  assert.equal(trendScore(0, 100, 0, 0), 25);
  assert.equal(trendScore(0, 0, 100, 0), 20);
  assert.equal(trendScore(0, 0, 0, 100), 20);
  assert.equal(trendScore(80, 60, 40, 20), 0.35 * 80 + 0.25 * 60 + 0.2 * 40 + 0.2 * 20);
});

test("seed snapshot is internally consistent", () => {
  assert.equal(SEED_TRENDS.length, 20);
  for (const trend of SEED_TRENDS) {
    const sentiment = trend.sentiment.positive + trend.sentiment.negative + trend.sentiment.neutral;
    assert.equal(sentiment, 100, trend.id);
    assert.ok(trend.growthRate >= 0 && trend.growthRate <= 100);
    assert.equal(trend.posts.length, 3);
    assert.match(trend.why, new RegExp(`${trend.growthPct}%`));
  }
  assert.deepEqual(windowsFor("3h"), ["3h", "12h", "24h", "7d"]);
  assert.deepEqual(windowsFor("7d"), ["7d"]);
});

test("idea packs stay inside the snapshot and match the language", () => {
  const trend = SEED_TRENDS[0];
  for (const language of ["en", "hi", "kn", "hinglish"] as const) {
    for (const spice of ["base", "spicier", "simpler", "professional"] as const) {
      const pack = generateIdeaPack({ trend, profile: profile(language), spice, variant: 0 });
      assert.equal(pack.tweet_hooks.length, 10);
      assert.equal(pack.reel_ideas.length, 5);
      assert.equal(pack.carousel_outline.length, 3);
      assert.equal(pack.youtube_titles.length, 5);
      assert.equal(ungroundedPercents(JSON.stringify(pack), [trend.growthPct, trend.sentiment.positive, trend.sentiment.negative, trend.sentiment.neutral]).length, 0);
    }
  }
  const hindi = generateIdeaPack({ trend, profile: profile("hi"), spice: "base", variant: 0 });
  assert.match(hindi.tweet_hooks[0].text, /[\u0900-\u097F]/);
  const kannada = generateIdeaPack({ trend, profile: profile("kn"), spice: "base", variant: 0 });
  assert.match(kannada.tweet_hooks[0].text, /[\u0C80-\u0CFF]/);
  const hinglish = generateIdeaPack({ trend, profile: profile("hinglish"), spice: "base", variant: 0 });
  assert.match(hinglish.tweet_hooks[0].text, /asli/i);
});

test("totp matches the RFC vector and growth is relative", () => {
  const secret = base32Encode(Buffer.from("12345678901234567890"));
  assert.equal(secret, "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
  assert.equal(totpCode(secret, 59_000), "287082");
  assert.equal(growthPercent(100, 180), 80);
  assert.equal(growthPercent(0, 10), 0);
});
