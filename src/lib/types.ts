export const NICHES = [
  "tech",
  "finance",
  "fitness",
  "movies",
  "spirituality",
  "education",
  "business",
] as const;

export const REGIONS = ["india", "global", "bengaluru", "mumbai", "delhi"] as const;
export const LANGUAGES = ["en", "hi", "kn", "hinglish"] as const;
export const TONES = ["funny", "educational", "bold", "spiritual", "professional"] as const;
export const AUDIENCES = ["students", "founders", "developers", "traders", "fitness users", "general"] as const;
export const PLATFORMS = ["x", "instagram", "youtube", "linkedin"] as const;
export const STATUSES = ["rising", "peaking", "cooling"] as const;
export const EMOTIONS = ["excitement", "curiosity", "anger", "humor"] as const;
export const RANGES = ["3h", "12h", "24h", "7d"] as const;
export const PLANS = ["free", "creator", "pro", "agency"] as const;
export const ROLES = ["user", "creator_pro", "admin", "system"] as const;
export const IDEA_STATUSES = ["to_create", "posted", "performed"] as const;
export const SPICES = ["base", "spicier", "simpler", "professional"] as const;
export const ALERT_CHANNELS = ["inapp", "email", "whatsapp", "push"] as const;

export type Niche = (typeof NICHES)[number];
export type Region = (typeof REGIONS)[number];
export type Language = (typeof LANGUAGES)[number];
export type Tone = (typeof TONES)[number];
export type Audience = (typeof AUDIENCES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type TrendStatus = (typeof STATUSES)[number];
export type Emotion = (typeof EMOTIONS)[number];
export type RangeKey = (typeof RANGES)[number];
export type Plan = (typeof PLANS)[number];
export type Role = (typeof ROLES)[number];
export type IdeaStatus = (typeof IDEA_STATUSES)[number];
export type Spice = (typeof SPICES)[number];
export type AlertChannel = (typeof ALERT_CHANNELS)[number];
export type SentimentLabel = "positive" | "negative" | "neutral";

export type Sentiment = { positive: number; negative: number; neutral: number };

export type SeedPost = {
  text: string;
  likes: number;
  reposts: number;
  replies: number;
  quotes: number;
  sentiment: SentimentLabel;
  minutesAgo: number;
};

export type SeedTrend = {
  id: string;
  name: string;
  niche: Niche;
  region: Region;
  language: Language;
  status: TrendStatus;
  growthPct: number;
  windowKey: RangeKey;
  postCount: number;
  uniqueAuthors: number;
  likes: number;
  reposts: number;
  replies: number;
  quotes: number;
  growthRate: number;
  engagementRate: number;
  postVolume: number;
  relevance: Record<Niche, number>;
  sentiment: Sentiment;
  emotion: Emotion;
  summary: string;
  why: string;
  questions: string[];
  hashtags: string[];
  keywords: string[];
  spark: number[];
  posts: SeedPost[];
};

export type HookStrength = {
  clarity: number;
  curiosity: number;
  controversy: number;
};

export type TweetHook = { text: string; strength: HookStrength };

export type ReelIdea = {
  title: string;
  hook: string;
  beats: string[];
  duration: string;
};

export type CarouselOutline = { title: string; slides: string[] };

export type IdeaPack = {
  trend_summary: string;
  why_trending: string;
  audience_emotion: string;
  content_angles: string[];
  tweet_hooks: TweetHook[];
  reel_ideas: ReelIdea[];
  carousel_outline: CarouselOutline[];
  youtube_titles: string[];
  cta: string[];
  posting_window: string;
  best_angle: string;
  disclaimer: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  plan: Plan;
  niche: Niche | null;
  audience: Audience | null;
  tone: Tone | null;
  language: Language | null;
  platforms: Platform[];
  onboarded: boolean;
  streak: number;
  points: number;
  badges: string[];
  totpEnabled: boolean;
  limits: { views: number | null; ai: number; export: string[] };
  usage: { views: number; ai: number };
};

export type TrendCard = {
  id: string;
  name: string;
  niche: Niche;
  region: Region;
  language: Language;
  status: TrendStatus;
  emotion: Emotion;
  growthPct: number;
  windowKey: RangeKey;
  postCount: number;
  score: number;
  spark: number[];
  summary: string;
  why: string;
  capturedAt: string;
  origin: string;
  hunter: "you" | "claimed" | "open";
};

export type TrendDetail = TrendCard & {
  uniqueAuthors: number;
  likes: number;
  reposts: number;
  replies: number;
  quotes: number;
  sentiment: Sentiment;
  questions: string[];
  hashtags: string[];
  keywords: string[];
  woeid: number;
  snapshots: { capturedAt: string; postCount: number; score: number }[];
  posts: {
    id: string;
    text: string;
    likes: number;
    reposts: number;
    replies: number;
    quotes: number;
    sentiment: SentimentLabel;
    postedAt: string;
    language: string;
    origin: string;
    authorLabel: string;
    xPostId: string | null;
  }[];
};

export type BoardItem = {
  id: string;
  trendId: string;
  trendName: string;
  platform: string;
  format: string;
  hook: string;
  outline: string;
  status: IdeaStatus;
  notes: string;
  strength: HookStrength | null;
  createdAt: string;
};

export type CreatorProfile = {
  niche: Niche;
  audience: Audience;
  tone: Tone;
  language: Language;
  platforms: Platform[];
};
