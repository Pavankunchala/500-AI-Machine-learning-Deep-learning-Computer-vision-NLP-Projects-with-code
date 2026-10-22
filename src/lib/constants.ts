import type { Audience, Emotion, Language, Niche, Plan, Platform, RangeKey, Region, Role, Tone, TrendStatus } from "./types";

export const WOEID: Record<Region, number> = {
  global: 1,
  india: 23424848,
  mumbai: 2295411,
  delhi: 20070458,
  bengaluru: 2295420,
};

export const REGION_LABEL: Record<Region, string> = {
  india: "India",
  global: "Global",
  bengaluru: "Bengaluru",
  mumbai: "Mumbai",
  delhi: "Delhi",
};

export const NICHE_LABEL: Record<Language, Record<Niche, string>> = {
  en: {
    tech: "Tech",
    finance: "Finance",
    fitness: "Fitness",
    movies: "Movies",
    spirituality: "Spirituality",
    education: "Education",
    business: "Business",
  },
  hi: {
    tech: "टेक",
    finance: "फाइनेंस",
    fitness: "फिटनेस",
    movies: "फिल्म",
    spirituality: "अध्यात्म",
    education: "एजुकेशन",
    business: "बिज़नेस",
  },
  kn: {
    tech: "ಟೆಕ್",
    finance: "ಹಣಕಾಸು",
    fitness: "ಫಿಟ್‌ನೆಸ್",
    movies: "ಸಿನಿಮಾ",
    spirituality: "ಆಧ್ಯಾತ್ಮ",
    education: "ಶಿಕ್ಷಣ",
    business: "ವ್ಯವಹಾರ",
  },
  hinglish: {
    tech: "Tech",
    finance: "Finance",
    fitness: "Fitness",
    movies: "Movies",
    spirituality: "Spirituality",
    education: "Education",
    business: "Business",
  },
};

export const LANGUAGE_LABEL: Record<Language, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  hinglish: "Hinglish",
};

export const TONE_LABEL: Record<Language, Record<Tone, string>> = {
  en: {
    funny: "funny",
    educational: "educational",
    bold: "bold",
    spiritual: "spiritual",
    professional: "professional",
  },
  hi: {
    funny: "हल्के",
    educational: "समझाने वाले",
    bold: "सीधे",
    spiritual: "शांत",
    professional: "प्रोफेशनल",
  },
  kn: {
    funny: "ಹಾಸ್ಯದ",
    educational: "ವಿವರಣಾತ್ಮಕ",
    bold: "ಧೈರ್ಯದ",
    spiritual: "ಶಾಂತ",
    professional: "ವೃತ್ತಿಪರ",
  },
  hinglish: {
    funny: "funny",
    educational: "educational",
    bold: "bold",
    spiritual: "calm",
    professional: "professional",
  },
};

export const AUDIENCE_LABEL: Record<Language, Record<Audience, string>> = {
  en: {
    students: "students",
    founders: "founders",
    developers: "developers",
    traders: "traders",
    "fitness users": "fitness users",
    general: "your audience",
  },
  hi: {
    students: "विद्यार्थियों",
    founders: "फाउंडर्स",
    developers: "डेवलपर्स",
    traders: "ट्रेडर्स",
    "fitness users": "फिटनेस करने वालों",
    general: "दर्शकों",
  },
  kn: {
    students: "ವಿದ್ಯಾರ್ಥಿಗಳ",
    founders: "ಸಂಸ್ಥಾಪಕರ",
    developers: "ಡೆವಲಪರ್‌ಗಳ",
    traders: "ಟ್ರೇಡರ್‌ಗಳ",
    "fitness users": "ಫಿಟ್‌ನೆಸ್ ಬಳಕೆದಾರರ",
    general: "ಪ್ರೇಕ್ಷಕರ",
  },
  hinglish: {
    students: "students",
    founders: "founders",
    developers: "developers",
    traders: "traders",
    "fitness users": "fitness log",
    general: "your audience",
  },
};

export const EMOTION_META: Record<Emotion, { emoji: string; label: string }> = {
  excitement: { emoji: "🔥", label: "Excitement" },
  curiosity: { emoji: "🤔", label: "Curiosity" },
  anger: { emoji: "😡", label: "Anger" },
  humor: { emoji: "😂", label: "Humor" },
};

export const STATUS_LABEL: Record<TrendStatus, string> = {
  rising: "Rising",
  peaking: "Peaking",
  cooling: "Cooling",
};

export const RANGE_LABEL: Record<RangeKey, string> = {
  "3h": "3 hours",
  "12h": "12 hours",
  "24h": "24 hours",
  "7d": "7 days",
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  x: "X",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
};

export const PLAN_LIMITS: Record<Plan, { views: number | null; ai: number; export: Array<"csv" | "json" | "notion"> }> = {
  free: { views: 5, ai: 3, export: [] },
  creator: { views: null, ai: 30, export: ["csv"] },
  pro: { views: null, ai: 120, export: ["csv", "json", "notion"] },
  agency: { views: null, ai: 400, export: ["csv", "json", "notion"] },
};

export const PLAN_PRICE: Record<Plan, string> = {
  free: "₹0",
  creator: "₹299/month",
  pro: "₹799/month",
  agency: "₹2,499/month",
};

export const POSTING_WINDOWS: Record<Audience, string> = {
  students: "7–9pm IST",
  founders: "8–10am IST",
  developers: "9–11pm IST",
  traders: "8–9:30am IST",
  "fitness users": "6–8am IST",
  general: "12–2pm IST",
};

const RANGE_ORDER: RangeKey[] = ["3h", "12h", "24h", "7d"];

/** A snapshot taken over a short window stays visible when the creator widens the range. */
export function windowsFor(key: RangeKey): RangeKey[] {
  return RANGE_ORDER.slice(RANGE_ORDER.indexOf(key));
}

export function windowPhrase(language: Language, key: RangeKey): string {
  const phrases: Record<Language, Record<RangeKey, string>> = {
    en: { "3h": "3 hours", "12h": "12 hours", "24h": "24 hours", "7d": "7 days" },
    hi: { "3h": "3 घंटे", "12h": "12 घंटे", "24h": "24 घंटे", "7d": "7 दिन" },
    kn: { "3h": "3 ಗಂಟೆ", "12h": "12 ಗಂಟೆ", "24h": "24 ಗಂಟೆ", "7d": "7 ದಿನ" },
    hinglish: { "3h": "3 ghante", "12h": "12 ghante", "24h": "24 ghante", "7d": "7 din" },
  };
  return phrases[language][key];
}

export function roleForPlan(plan: Plan, current: Role): Role {
  if (current === "admin" || current === "system") return current;
  return plan === "free" ? "user" : "creator_pro";
}

const NEIGHBORS: Record<Niche, Niche[]> = {
  tech: ["business", "education"],
  finance: ["business"],
  fitness: ["spirituality"],
  movies: ["spirituality"],
  spirituality: ["fitness", "education"],
  education: ["tech", "spirituality"],
  business: ["finance", "tech"],
};

export function relevanceMap(primary: Niche, high = 94): Record<Niche, number> {
  const scores = {} as Record<Niche, number>;
  for (const niche of Object.keys(NEIGHBORS) as Niche[]) {
    scores[niche] = NEIGHBORS[primary].includes(niche) ? 62 : 34;
  }
  scores[primary] = high;
  return scores;
}
