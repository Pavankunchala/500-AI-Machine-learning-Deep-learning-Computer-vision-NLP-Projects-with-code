import {
  AUDIENCE_LABEL,
  EMOTION_META,
  NICHE_LABEL,
  POSTING_WINDOWS,
  TONE_LABEL,
  windowPhrase,
} from "./constants";
import type {
  Audience,
  CarouselOutline,
  CreatorProfile,
  HookStrength,
  IdeaPack,
  Language,
  Niche,
  ReelIdea,
  SeedTrend,
  Spice,
  Tone,
  TweetHook,
} from "./types";

export type IdeaContext = {
  trend: Pick<
    SeedTrend,
    "name" | "summary" | "why" | "questions" | "emotion" | "growthPct" | "windowKey" | "sentiment" | "niche"
  >;
  profile: CreatorProfile;
  spice: Spice;
  variant: number;
};

type Bag = {
  name: string;
  audience: string;
  niche: string;
  tone: string;
  growthPct: number;
  windowLabel: string;
  question: string;
  emotion: string;
  why: string;
  summary: string;
};

function bag(ctx: IdeaContext): Bag {
  const { trend, profile } = ctx;
  const language = profile.language;
  return {
    name: trend.name,
    audience: AUDIENCE_LABEL[language][profile.audience],
    niche: NICHE_LABEL[language][profile.niche],
    tone: TONE_LABEL[language][profile.tone],
    growthPct: trend.growthPct,
    windowLabel: windowPhrase(language, trend.windowKey),
    question: trend.questions[0] ?? "",
    emotion: EMOTION_META[trend.emotion].label,
    why: trend.why,
    summary: trend.summary,
  };
}

function enSets(b: Bag): Record<Spice, string[]> {
  return {
    base: [
      `Everyone is talking about ${b.name}, but nobody is telling ${b.audience} this…`,
      `Posts on ${b.name} are up ${b.growthPct}% in ${b.windowLabel}. Here is the part ${b.audience} can actually use.`,
      `I went through the ${b.name} conversation so ${b.audience} don't have to.`,
      `The question under ${b.name}: ${b.question}`,
      `${b.name} looks loud. The useful angle for ${b.audience} is quieter.`,
      `Before you post about ${b.name}, answer this: ${b.question}`,
      `A ${b.tone} take on ${b.name} for a ${b.niche} account.`,
      `If ${b.name} is for everyone, this version is for ${b.audience}.`,
      `One clear point from the ${b.name} posts, then one example, then one ask.`,
      `If you only make one thing on ${b.name}, make it useful to ${b.audience}.`,
    ],
    spicier: [
      `Stop posting the headline of ${b.name}. Post the consequence for ${b.audience}.`,
      `${b.growthPct}% more posts in ${b.windowLabel}. Most of them repeat the same line.`,
      `The ${b.name} noise is high. The decision for ${b.audience} is small.`,
      `People keep asking: ${b.question}`,
      `Uncomfortable read of ${b.name}: attention moved faster than understanding.`,
      `Don't explain all of ${b.name}. Explain this: ${b.question}`,
      `Make ${b.name} feel specific to ${b.audience}, not to the whole timeline.`,
      `The ${b.emotion.toLowerCase()} in these posts is the real hook.`,
      `Cut the preamble. Start ${b.name} with the question your audience already has.`,
      `A sharper ${b.name} post: one claim, one reason, one next step.`,
    ],
    simpler: [
      `${b.name} is getting more attention. Here is what that means for ${b.audience}.`,
      `In ${b.windowLabel}, posts about ${b.name} rose ${b.growthPct}%. This is the plain version.`,
      `${b.audience} do not need every post about ${b.name}. They need the useful part.`,
      `A common question: ${b.question}`,
      `${b.name} is popular. This is the simple way to talk about it.`,
      `Start with this question: ${b.question}`,
      `Explain ${b.name} as if you are talking to ${b.audience}.`,
      `Skip the hype. Say what ${b.name} changes for ${b.audience}.`,
      `Three beats: what happened, why people care, what to do next.`,
      `One post about ${b.name} is enough if it is clear.`,
    ],
    professional: [
      `Briefing for ${b.audience}: what the ${b.name} conversation is actually about.`,
      `Volume is up ${b.growthPct}% over ${b.windowLabel}. Here is a measured read for ${b.audience}.`,
      `A short brief on ${b.name}, using only the cached snapshot.`,
      `Question showing up in the posts: ${b.question}`,
      `Recommended angle: make ${b.name} practical for ${b.audience}.`,
      `Open with the audience question, then the context, then a next step.`,
      `${b.niche} note on ${b.name}, in a ${b.tone} register.`,
      `Stick to what the posts actually say about ${b.name}.`,
      `Structure: context, implication, action.`,
      `Close with a specific ask, not a generic follow prompt.`,
    ],
  };
}

function hiSets(b: Bag): Record<"base" | "alt", string[]> {
  return {
    base: [
      `सब ${b.name} की बात कर रहे हैं, पर ${b.audience} को असली बात कोई नहीं बता रहा…`,
      `${b.windowLabel} में ${b.name} पर पोस्ट ${b.growthPct}% बढ़ी हैं। ${b.audience} के लिए काम का हिस्सा यही है।`,
      `मैंने ${b.name} वाली बातें पढ़ लीं, ताकि ${b.audience} को सब छानना न पड़े।`,
      `पोस्ट में यह सवाल है: ${b.question}`,
      `${b.name} का शोर ज़्यादा है। ${b.audience} के लिए मतलब छोटा और साफ है।`,
      `${b.name} पर लिखने से पहले इस सवाल का जवाब दीजिए: ${b.question}`,
      `${b.niche} अकाउंट के लिए ${b.name} पर एक ${b.tone} बात।`,
      `${b.name} सबके लिए हो सकता है। यह संस्करण ${b.audience} के लिए है।`,
      `एक बात, एक उदाहरण, एक अगला कदम — ${b.name} के लिए बस इतना।`,
      `${b.name} पर एक ही पोस्ट बनानी हो, तो उसे ${b.audience} के लिए उपयोगी बनाइए।`,
    ],
    alt: [
      `${b.name} की हेडलाइन मत दो। ${b.audience} पर उसका असर बताओ।`,
      `${b.windowLabel} में पोस्ट ${b.growthPct}% बढ़ी हैं। ज़्यादातर एक ही लाइन दोहरा रही हैं।`,
      `${b.name} का शोर बड़ा है। ${b.audience} का फैसला छोटा है।`,
      `लोग बार-बार पूछ रहे हैं: ${b.question}`,
      `${b.name} पर ध्यान समझ से तेज़ बढ़ा है।`,
      `पूरा ${b.name} मत समझाओ। यह समझाओ: ${b.question}`,
      `${b.name} को पूरे टाइमलाइन के लिए नहीं, ${b.audience} के लिए लिखो।`,
      `इन पोस्ट में ${b.emotion} असली हुक है।`,
      `भूमिका काटो। ${b.name} की शुरुआत सवाल से करो।`,
      `तेज़ संस्करण: एक दावा, एक कारण, एक अगला कदम।`,
    ],
  };
}

function knSets(b: Bag): Record<"base" | "alt", string[]> {
  return {
    base: [
      `ಎಲ್ಲರೂ ${b.name} ಬಗ್ಗೆ ಮಾತಾಡುತ್ತಿದ್ದಾರೆ. ಆದರೆ ${b.audience} ಗೆ ಬೇಕಾದ ಮಾತು ಯಾರೂ ಹೇಳುತ್ತಿಲ್ಲ…`,
      `${b.windowLabel}ಯಲ್ಲಿ ${b.name} ಪೋಸ್ಟ್‌ಗಳು ${b.growthPct}% ಹೆಚ್ಚಿವೆ. ${b.audience} ಗೆ ಉಪಯುಕ್ತ ಭಾಗ ಇಷ್ಟೇ.`,
      `${b.audience} ಗಾಗಿ ${b.name} ಸಂಭಾಷಣೆಯ ಉಪಯುಕ್ತ ಭಾಗವನ್ನು ತೆಗೆದಿದ್ದೇನೆ.`,
      `ಪೋಸ್ಟ್‌ಗಳಲ್ಲಿನ ಪ್ರಶ್ನೆ: ${b.question}`,
      `${b.name} ಗದ್ದಲ ಜಾಸ್ತಿ. ${b.audience} ಗೆ ಅರ್ಥ ಚಿಕ್ಕದು.`,
      `${b.name} ಬಗ್ಗೆ ಬರೆಯುವ ಮುನ್ನ ಈ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಿ: ${b.question}`,
      `${b.niche} ಖಾತೆಗೆ ${b.name} ಮೇಲೆ ಒಂದು ${b.tone} ಮಾತು.`,
      `${b.name} ಎಲ್ಲರಿಗೂ ಆಗಿರಬಹುದು. ಈ ಆವೃತ್ತಿ ${b.audience} ಗಾಗಿ.`,
      `ಒಂದು ಅಂಶ, ಒಂದು ಉದಾಹರಣೆ, ಒಂದು ಮುಂದಿನ ಹೆಜ್ಜೆ — ${b.name} ಗೆ ಸಾಕು.`,
      `${b.name} ಮೇಲೆ ಒಂದೇ ಪೋಸ್ಟ್ ಮಾಡುವುದಾದರೆ, ಅದು ${b.audience} ಗೆ ಉಪಯುಕ್ತವಾಗಿರಲಿ.`,
    ],
    alt: [
      `${b.name} ಶೀರ್ಷಿಕೆ ಬಿಡಿ. ${b.audience} ಮೇಲಿನ ಪರಿಣಾಮ ಹೇಳಿ.`,
      `${b.windowLabel}ಯಲ್ಲಿ ಪೋಸ್ಟ್‌ಗಳು ${b.growthPct}% ಹೆಚ್ಚಿವೆ. ಹೆಚ್ಚಿನವು ಒಂದೇ ಮಾತನ್ನು ಪುನರಾವರ್ತಿಸುತ್ತವೆ.`,
      `${b.name} ಸದ್ದು ದೊಡ್ಡದು. ${b.audience} ನಿರ್ಧಾರ ಚಿಕ್ಕದು.`,
      `ಜನರು ಮತ್ತೆ ಕೇಳುತ್ತಿದ್ದಾರೆ: ${b.question}`,
      `${b.name} ನಲ್ಲಿ ಗಮನ ತಿಳುವಳಿಕೆಗಿಂತ ವೇಗವಾಗಿ ಬೆಳೆದಿದೆ.`,
      `${b.name} ಅನ್ನು ಪೂರ್ತಿ ವಿವರಿಸಬೇಡಿ. ಇದನ್ನು ವಿವರಿಸಿ: ${b.question}`,
      `${b.name} ಅನ್ನು ಎಲ್ಲರಿಗೂ ಅಲ್ಲ, ${b.audience} ಗೆ ಬರೆಯಿರಿ.`,
      `ಈ ಪೋಸ್ಟ್‌ಗಳ ${b.emotion} ನಿಜವಾದ ಹುಕ್.`,
      `ಪೀಠಿಕೆ ಬಿಡಿ. ${b.name} ಅನ್ನು ಪ್ರಶ್ನೆಯಿಂದ ಆರಂಭಿಸಿ.`,
      `ತೀಕ್ಷ್ಣ ಆವೃತ್ತಿ: ಒಂದು ಹೇಳಿಕೆ, ಒಂದು ಕಾರಣ, ಒಂದು ಮುಂದಿನ ಹೆಜ್ಜೆ.`,
    ],
  };
}

function hinglishSets(b: Bag): Record<"base" | "alt", string[]> {
  return {
    base: [
      `Sab log ${b.name} ki baat kar rahe hain, par ${b.audience} ko asli baat koi nahi bata raha…`,
      `${b.windowLabel} mein ${b.name} posts ${b.growthPct}% badhi hain. ${b.audience} ke kaam ka hissa itna hai.`,
      `Maine ${b.name} wala chatter padh liya, taaki ${b.audience} ko sab scroll na karna pade.`,
      `Log pooch rahe hain: ${b.question}`,
      `${b.name} ka noise zyada hai. ${b.audience} ke liye matlab chhota hai.`,
      `${b.name} pe post karne se pehle yeh jawab do: ${b.question}`,
      `Ek ${b.tone} ${b.niche} take on ${b.name}, sirf ${b.audience} ke liye.`,
      `${b.name} sabke liye ho sakta hai. Yeh version ${b.audience} ke liye hai.`,
      `Ek point, ek example, ek next step — ${b.name} ke liye bas itna.`,
      `${b.name} pe ek hi post banani hai to use ${b.audience} ke liye useful banao.`,
    ],
    alt: [
      `${b.name} ki headline mat do. ${b.audience} pe asar batao.`,
      `${b.windowLabel} mein posts ${b.growthPct}% up hain. Zyadatar ek hi line dohra rahe hain.`,
      `${b.name} ka noise bada hai. ${b.audience} ka decision chhota hai.`,
      `Bar-bar yahi sawal hai: ${b.question}`,
      `${b.name} pe attention samajh se tez badha hai.`,
      `Poora ${b.name} mat samjhao. Yeh samjhao: ${b.question}`,
      `${b.name} ko timeline ke liye nahi, ${b.audience} ke liye likho.`,
      `In posts ka ${b.emotion} hi asli hook hai.`,
      `Intro kaato. ${b.name} ko sawal se shuru karo.`,
      `Tez version: ek claim, ek reason, ek next step.`,
    ],
  };
}

export function selectHooks(ctx: IdeaContext): string[] {
  const b = bag(ctx);
  const variant = Math.max(0, ctx.variant);
  if (ctx.profile.language === "en") {
    const sets = enSets(b);
    const spice = ctx.spice;
    if (spice !== "base") return sets[spice];
    return variant % 2 === 0 ? sets.base : sets.spicier;
  }
  const pair =
    ctx.profile.language === "hi" ? hiSets(b) : ctx.profile.language === "kn" ? knSets(b) : hinglishSets(b);
  const useAlt = ctx.spice === "spicier" || variant % 2 === 1;
  return useAlt ? pair.alt : pair.base;
}

export function hookAt(ctx: IdeaContext, index: number): TweetHook {
  const hooks = selectHooks({ ...ctx, variant: ctx.variant });
  const text = hooks[index] ?? hooks[0];
  return { text, strength: rateHook(text) };
}

export function rateHook(text: string): HookStrength {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const clarity = clamp(100 - Math.abs(words - 18) * 3);
  let curiosity = 28;
  if (text.includes("?")) curiosity += 24;
  if (text.includes("…") || text.includes("...")) curiosity += 16;
  if (/nobody|koi nahi|yararu|asli|question|sawal|ಪ್ರಶ್ನೆ|सवाल|before|munn|pehle/i.test(text)) curiosity += 22;
  let controversy = 32;
  if (/nobody|stop|don't|dont|mat |bidi|uncomfortable|noise|zyada|ಬಿಡಿ|मत/i.test(text)) controversy += 28;
  if (/but |par |adare|lekin/i.test(text)) controversy += 8;
  return {
    clarity,
    curiosity: clamp(curiosity),
    controversy: clamp(controversy),
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function reels(ctx: IdeaContext, hooks: string[]): ReelIdea[] {
  const b = bag(ctx);
  const lang = ctx.profile.language;
  const duration = "25–35s";
  if (lang === "hi") {
    return [
      reel(` ${b.name} का मतलब`, hooks[0], [`नाम दिखाओ: ${b.name}.`, `कैश किया बदलाव बोलो: ${b.growthPct}% / ${b.windowLabel}.`, `पोस्ट का सवाल पढ़ो: ${b.question}`, `${b.audience} के लिए एक कोण रखो।`], duration),
      reel("तीन सवाल", hooks[3], ["पहला सवाल स्क्रीन पर।", "दूसरा सवाल बोलो।", "तीसरे पर रुककर जवाब दो।", "आखिर में एक काम बताओ।"], duration),
      reel("शोर बनाम मतलब", hooks[4], ["शोर वाला पोस्ट फ्लैश करो।", "उपयोगी लाइन पर रुकें।", `${b.audience} का नाम लो।`, "एक उदाहरण दो।"], duration),
      reel("करके दिखाओ", hooks[2], ["कैमरा पर नोटबुक।", "सिर्फ स्नैपशॉट से एक बात लिखो।", "जो नंबर स्नैपशॉट में नहीं, वह मत जोड़ो।", "सेव करने को कहो।"], duration),
      reel("एक दावा", hooks[9], ["एक वाक्य से खुलो।", "कारण दो।", "अगला कदम बताओ।", "सवाल से बंद करो।"], duration),
    ];
  }
  if (lang === "kn") {
    return [
      reel(`${b.name} ಅರ್ಥ`, hooks[0], [`ಹೆಸರು ತೋರಿಸಿ: ${b.name}.`, `ಬದಲಾವಣೆ: ${b.growthPct}% / ${b.windowLabel}.`, `ಪ್ರಶ್ನೆ ಓದಿ: ${b.question}`, `${b.audience} ಗೆ ಒಂದು ಕೋನ ಕೊಡಿ.`], duration),
      reel("ಮೂರು ಪ್ರಶ್ನೆ", hooks[3], ["ಪ್ರಶ್ನೆಯನ್ನು ಪರದೆಯ ಮೇಲೆ ಇಡಿ.", "ಎರಡನೇ ಪ್ರಶ್ನೆ ಹೇಳಿ.", "ಮೂರನೇದಕ್ಕೆ ಉತ್ತರಿಸಿ.", "ಒಂದು ಕೆಲಸ ಹೇಳಿ ಮುಗಿಸಿ."], duration),
      reel("ಸದ್ದು ಮತ್ತು ಅರ್ಥ", hooks[4], ["ಸದ್ದಿನ ಪೋಸ್ಟ್ ತೋರಿಸಿ.", "ಉಪಯುಕ್ತ ಸಾಲಿನಲ್ಲಿ ನಿಲ್ಲಿಸಿ.", `${b.audience} ಹೆಸರು ಹೇಳಿ.`, "ಒಂದು ಉದಾಹರಣೆ ಕೊಡಿ."], duration),
      reel("ಮಾಡಿ ತೋರಿಸಿ", hooks[2], ["ನೋಟ್‌ಬುಕ್ ತೆರೆಯಿರಿ.", "ಸ್ನ್ಯಾಪ್‌ಶಾಟ್‌ನ ಒಂದು ಅಂಶ ಬರೆಯಿರಿ.", "ಇಲ್ಲದ ಸಂಖ್ಯೆಯನ್ನು ಸೇರಿಸಬೇಡಿ.", "ಉಳಿಸಲು ಹೇಳಿ."], duration),
      reel("ಒಂದು ಹೇಳಿಕೆ", hooks[9], ["ಒಂದು ವಾಕ್ಯದಿಂದ ತೆರೆಯಿರಿ.", "ಕಾರಣ ಹೇಳಿ.", "ಮುಂದಿನ ಹೆಜ್ಜೆ ಹೇಳಿ.", "ಪ್ರಶ್ನೆಯಿಂದ ಮುಗಿಸಿ."], duration),
    ];
  }
  if (lang === "hinglish") {
    return [
      reel(`${b.name} ka matlab`, hooks[0], [`Naam dikhao: ${b.name}.`, `Cached change bolo: ${b.growthPct}% in ${b.windowLabel}.`, `Sawal padho: ${b.question}`, `${b.audience} ke liye ek angle chhodo.`], duration),
      reel("Teen sawal", hooks[3], ["Pehla sawal screen pe.", "Doosra bolo.", "Teesre pe ruk ke jawab do.", "Ek kaam keh ke khatam karo."], duration),
      reel("Noise vs matlab", hooks[4], ["Noisy post flash karo.", "Useful line pe roko.", `${b.audience} ka naam lo.`, "Ek example do."], duration),
      reel("Karke dikhao", hooks[2], ["Notebook kholo.", "Snapshot se sirf ek baat likho.", "Jo number snapshot mein nahi, woh mat jodo.", "Save karne ko kaho."], duration),
      reel("Ek claim", hooks[9], ["Ek line se kholo.", "Reason do.", "Next step bolo.", "Sawal pe band karo."], duration),
    ];
  }
  return [
    reel(`What ${b.name} means for ${b.audience}`, hooks[0], [`Show the name: ${b.name}.`, `Say the cached change: up ${b.growthPct}% in ${b.windowLabel}.`, `Read one question from the posts: ${b.question}`, `Leave one angle for ${b.audience}.`], duration),
    reel("Three questions, one answer", hooks[3], ["Put the first question on screen.", "Say the second out loud.", "Answer only the third.", "End on a single action."], duration),
    reel("Noise versus the useful part", hooks[4], ["Flash a noisy headline.", "Pause on the useful line from the snapshot.", `Name ${b.audience}.`, "Give one example, then stop."], duration),
    reel("I read it so you don't have to", hooks[2], ["Open a notebook on camera.", "Write one point that is actually in the snapshot.", "Cross out any number that is not in the snapshot.", "Ask people to save the useful line."], duration),
    reel("One claim, one reason", hooks[9], ["Open with one sentence.", "Give the reason from the summary.", "Offer the next step.", "Close on the audience question."], duration),
  ];
}

function reel(title: string, hook: string, beats: string[], duration: string): ReelIdea {
  return { title: title.trim(), hook, beats, duration };
}

function carousels(ctx: IdeaContext): CarouselOutline[] {
  const b = bag(ctx);
  const lang = ctx.profile.language;
  if (lang === "hi") {
    return [
      { title: `${b.name}: काम का संस्करण`, slides: [`कवर: ${b.name}`, b.why, `भाव: ${b.emotion}`, `सवाल: ${b.question}`, `${b.audience} के लिए कोण`, "आखिरी स्लाइड: एक अगला कदम"] },
      { title: "शोर हटाओ", slides: ["लोग क्या दोहरा रहे हैं", "स्नैपशॉट वास्तव में क्या कहता है", "क्या छोड़ना है", `${b.audience} के लिए एक लाइन`, "सेव करने लायक बात"] },
      { title: "चेकलिस्ट", slides: ["आधिकारिक बात और अफवाह अलग करो", "एक सवाल चुनो", "एक उदाहरण दो", "संख्या तभी लिखो जब स्नैपशॉट में हो", "साफ निवेदन"] },
    ];
  }
  if (lang === "kn") {
    return [
      { title: `${b.name}: ಉಪಯುಕ್ತ ಆವೃತ್ತಿ`, slides: [`ಕವರ್: ${b.name}`, b.why, `ಭಾವ: ${b.emotion}`, `ಪ್ರಶ್ನೆ: ${b.question}`, `${b.audience} ಗೆ ಕೋನ`, "ಕೊನೆಯ ಸ್ಲೈಡ್: ಮುಂದಿನ ಹೆಜ್ಜೆ"] },
      { title: "ಸದ್ದು ತೆಗೆಯಿರಿ", slides: ["ಜನರು ಏನನ್ನು ಪುನರಾವರ್ತಿಸುತ್ತಾರೆ", "ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ ಏನು ಹೇಳುತ್ತದೆ", "ಏನನ್ನು ಬಿಡಬೇಕು", `${b.audience} ಗೆ ಒಂದು ಸಾಲು`, "ಉಳಿಸುವ ಮಾತು"] },
      { title: "ಪಟ್ಟಿ", slides: ["ಅಧಿಕೃತ ಮಾತು ಮತ್ತು ಊಹೆ ಬೇರೆ", "ಒಂದು ಪ್ರಶ್ನೆ ಆಯ್ಕೆಮಾಡಿ", "ಒಂದು ಉದಾಹರಣೆ", "ಸ್ನ್ಯಾಪ್‌ಶಾಟ್‌ನಲ್ಲಿರುವ ಸಂಖ್ಯೆ ಮಾತ್ರ", "ಸ್ಪಷ್ಟ ಕೇಳಿಕೆ"] },
    ];
  }
  if (lang === "hinglish") {
    return [
      { title: `${b.name}: kaam ka version`, slides: [`Cover: ${b.name}`, b.why, `Emotion: ${b.emotion}`, `Sawal: ${b.question}`, `${b.audience} ke liye angle`, "Last slide: ek next step"] },
      { title: "Noise hatao", slides: ["Log kya dohra rahe hain", "Snapshot actually kya kehta hai", "Kya chhodna hai", `${b.audience} ke liye ek line`, "Save karne layak baat"] },
      { title: "Checklist", slides: ["Official baat aur rumour alag karo", "Ek sawal chuno", "Ek example do", "Number tabhi likho jab snapshot mein ho", "Clear ask"] },
    ];
  }
  return [
    {
      title: `${b.name}: the useful version`,
      slides: [`Cover: ${b.name}`, b.why, `Emotion in the posts: ${b.emotion}`, `Question: ${b.question}`, `Angle for ${b.audience}`, "Last slide: one next step"],
    },
    {
      title: "Strip the noise",
      slides: ["What people are repeating", "What the snapshot actually says", "What to leave out", `One line for ${b.audience}`, "The line worth saving"],
    },
    {
      title: "Checklist",
      slides: ["Separate the official point from the rumour", "Pick one question", "Add one example", "Use a number only if it is in the snapshot", "Close with a clear ask"],
    },
  ];
}

function titles(ctx: IdeaContext): string[] {
  const b = bag(ctx);
  const lang = ctx.profile.language;
  if (lang === "hi") {
    return [
      `${b.name}: ${b.audience} के लिए काम का हिस्सा`,
      `${b.windowLabel} में ${b.name} क्यों बढ़ा`,
      `${b.name} पर पोस्ट ${b.growthPct}% बढ़ीं — इससे क्या समझें`,
      `${b.name} की बात पढ़ ली। कोण यह है।`,
      `${b.name} बिना बढ़ा-चढ़ा के`,
    ];
  }
  if (lang === "kn") {
    return [
      `${b.name}: ${b.audience} ಗೆ ಉಪಯುಕ್ತ ಭಾಗ`,
      `${b.windowLabel}ಯಲ್ಲಿ ${b.name} ಏಕೆ ಏರಿತು`,
      `${b.name} ಪೋಸ್ಟ್‌ಗಳು ${b.growthPct}% ಏರಿವೆ — ಇದರ ಅರ್ಥ`,
      `${b.name} ಓದಿದೆ. ಕೋನ ಇದು.`,
      `${b.name} ಅನ್ನು ಹೆಚ್ಚಿಸದೆ`,
    ];
  }
  if (lang === "hinglish") {
    return [
      `${b.name}: ${b.audience} ke liye useful hissa`,
      `${b.windowLabel} mein ${b.name} kyun badha`,
      `${b.name} posts ${b.growthPct}% up — iska matlab`,
      `${b.name} padh liya. Angle yeh hai.`,
      `${b.name} bina hype ke`,
    ];
  }
  return [
    `${b.name}: the useful part for ${b.audience}`,
    `Why ${b.name} jumped in ${b.windowLabel}`,
    `${b.name} posts are up ${b.growthPct}% — what to make of it`,
    `I read the ${b.name} conversation. Here is the angle.`,
    `${b.name} without the hype`,
  ];
}

function ctas(ctx: IdeaContext): string[] {
  const b = bag(ctx);
  const lang = ctx.profile.language;
  if (lang === "hi") {
    return [
      `${b.audience} में से यह किसके काम का है, रिप्लाई में बताइए।`,
      "इसमें से एक लाइन सेव कर लीजिए।",
      "किसी एक व्यक्ति को भेजिए जिसे सादा संस्करण चाहिए।",
      "अपना असली सवाल लिखिए, मैं उसी पर अगली पोस्ट बनाऊँगा।",
    ];
  }
  if (lang === "kn") {
    return [
      `ಇದು ಯಾವ ${b.audience} ಗೆ ಉಪಯುಕ್ತ, ಎಂದು ಉತ್ತರಿಸಿ.`,
      "ಒಂದು ಸಾಲನ್ನು ಉಳಿಸಿ.",
      "ಸರಳ ಆವೃತ್ತಿ ಬೇಕಾದ ಒಬ್ಬರಿಗೆ ಕಳುಹಿಸಿ.",
      "ನಿಮ್ಮ ನಿಜವಾದ ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ.",
    ];
  }
  if (lang === "hinglish") {
    return [
      `Yeh kis ${b.audience} ke kaam ka hai, reply mein batao.`,
      "Ek line save kar lo.",
      "Ek insaan ko bhejo jise plain version chahiye.",
      "Apna asli sawal likho.",
    ];
  }
  return [
    `Reply with the part ${b.audience} still find confusing.`,
    "Save the one line you would actually post.",
    "Send this to one person who needs the plain version.",
    "Leave the question you still have. The next post can answer that.",
  ];
}

function angle(ctx: IdeaContext): string {
  const b = bag(ctx);
  const lang = ctx.profile.language;
  if (lang === "hi") return `${b.audience} के लिए ${b.niche} कोण: ${b.question}`;
  if (lang === "kn") return `${b.audience} ಗಾಗಿ ${b.niche} ಕೋನ: ${b.question}`;
  if (lang === "hinglish") return `${b.audience} ke liye ${b.niche} angle: ${b.question}`;
  return `For ${b.audience} in ${b.niche}: answer “${b.question}” in a ${b.tone} voice.`;
}

function angles(ctx: IdeaContext): string[] {
  const b = bag(ctx);
  const primary = angle(ctx);
  const lang = ctx.profile.language;
  if (lang === "hi") {
    return [primary, `${b.emotion} को स्वीकार करके साफ जवाब दें।`, "स्नैपशॉट का सार एक उदाहरण के साथ बताएं।"];
  }
  if (lang === "kn") {
    return [primary, `${b.emotion} ಅನ್ನು ಒಪ್ಪಿ, ನಂತರ ಸ್ಪಷ್ಟ ಉತ್ತರ ಕೊಡಿ.`, "ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ ಸಾರಾಂಶವನ್ನು ಒಂದು ಉದಾಹರಣೆಯೊಂದಿಗೆ ಹೇಳಿ."];
  }
  if (lang === "hinglish") {
    return [primary, `${b.emotion} ko maano, phir clear jawab do.`, "Snapshot ka summary ek example ke saath bolo."];
  }
  return [
    primary,
    `Name the ${b.emotion.toLowerCase()} in the posts, then give the practical answer.`,
    "Retell the snapshot summary with one example and no extra statistics.",
  ];
}

function posting(ctx: IdeaContext): string {
  const b = bag(ctx);
  const time = POSTING_WINDOWS[ctx.profile.audience];
  const lang = ctx.profile.language;
  if (lang === "hi") return `${b.audience} के लिए सुझाव: ${time}. यह मापा हुआ सर्वश्रेष्ठ समय नहीं है।`;
  if (lang === "kn") return `${b.audience} ಗಾಗಿ ಸೂಚನೆ: ${time}. ಇದು ಅಳತೆ ಮಾಡಿದ ಅತ್ಯುತ್ತಮ ಸಮಯವಲ್ಲ.`;
  if (lang === "hinglish") return `${b.audience} ke liye suggestion: ${time}. Yeh measured best time nahi hai.`;
  return `Suggested window for ${b.audience}: ${time}. A starting point, not a measured best time.`;
}

function disclaimer(language: Language): string {
  if (language === "hi") return "ये कैश किए गए स्नैपशॉट से बने आइडिया हैं। पहुँच या वायरल होने की गारंटी नहीं है।";
  if (language === "kn") return "ಇವು ಕ್ಯಾಶ್ ಮಾಡಿದ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್‌ನಿಂದ ಬಂದ ಐಡಿಯಾಗಳು. ವೀಕ್ಷಣೆ ಅಥವಾ ವೈರಲ್ ಆಗುವ ಭರವಸೆ ಅಲ್ಲ.";
  if (language === "hinglish") return "Yeh cached snapshot se bane ideas hain. Reach ya viral hone ki guarantee nahi hai.";
  return "These are idea starters from the cached snapshot. They are not a promise of reach or virality.";
}

function emotionLine(ctx: IdeaContext): string {
  const { trend, profile } = ctx;
  const label = EMOTION_META[trend.emotion].label;
  const s = trend.sentiment;
  if (profile.language === "hi") {
    return `${label}. स्नैपशॉट में ${s.positive}% सकारात्मक, ${s.negative}% नकारात्मक, ${s.neutral}% तटस्थ।`;
  }
  if (profile.language === "kn") {
    return `${label}. ಸ್ನ್ಯಾಪ್‌ಶಾಟ್‌ನಲ್ಲಿ ${s.positive}% ಧನಾತ್ಮಕ, ${s.negative}% ಋಣಾತ್ಮಕ, ${s.neutral}% ತಟಸ್ಥ.`;
  }
  if (profile.language === "hinglish") {
    return `${label}. Snapshot mein ${s.positive}% positive, ${s.negative}% negative, ${s.neutral}% neutral.`;
  }
  return `${label}. Snapshot sentiment is ${s.positive}% positive, ${s.negative}% negative, ${s.neutral}% neutral.`;
}

export function allowedPercents(trend: IdeaContext["trend"]): number[] {
  return [trend.growthPct, trend.sentiment.positive, trend.sentiment.negative, trend.sentiment.neutral];
}

export function ungroundedPercents(text: string, allowed: number[]): string[] {
  const ok = new Set(allowed.map((n) => String(n)));
  return [...text.matchAll(/(\d+(?:\.\d+)?)%/g)].map((match) => match[1]).filter((n) => !ok.has(n));
}

export function generateIdeaPack(ctx: IdeaContext): IdeaPack {
  const hooks = selectHooks(ctx);
  const tweet_hooks = hooks.map((text) => ({ text, strength: rateHook(text) }));
  const pack: IdeaPack = {
    trend_summary: ctx.trend.summary,
    why_trending: ctx.trend.why,
    audience_emotion: emotionLine(ctx),
    content_angles: angles(ctx),
    tweet_hooks,
    reel_ideas: reels(ctx, hooks),
    carousel_outline: carousels(ctx),
    youtube_titles: titles(ctx),
    cta: ctas(ctx),
    posting_window: posting(ctx),
    best_angle: angle(ctx),
    disclaimer: disclaimer(ctx.profile.language),
  };
  const bad = ungroundedPercents(JSON.stringify(pack), allowedPercents(ctx.trend));
  if (bad.length) {
    throw new Error(`Idea pack included a percentage that is not in the snapshot: ${bad.join(", ")}`);
  }
  if (/@\w/.test(JSON.stringify(pack))) {
    throw new Error("Idea pack included a social handle that is not in the snapshot.");
  }
  return pack;
}

export function cacheKey(trendId: string, profile: CreatorProfile, spice: Spice): string {
  return [trendId, profile.niche, profile.audience, profile.tone, profile.language, profile.platforms.join("+"), spice].join("|");
}

export function defaultProfile(niche: Niche | null, language: Language | null): CreatorProfile {
  return {
    niche: niche ?? "education",
    audience: "general",
    tone: "educational",
    language: language ?? "en",
    platforms: ["x"],
  };
}

export const PROFILE_FALLBACK: { audience: Audience; tone: Tone } = {
  audience: "general",
  tone: "educational",
};
