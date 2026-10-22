# TrendPulse

TrendPulse helps creators see what is rising on X, understand the angle, and leave with a hook. The home list is a large ranked feed, not a radar. Opening it reads a shared cache. It does not call X.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- SQLite for users, snapshots, ideas, usage, and the ingestion queue
- Argon2id passwords, hashed session tokens, AES-256-GCM for alert destinations and authenticator secrets
- Optional X API v2 worker and an optional OpenAI-compatible model

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

In development, the sign-in screen offers a demo creator and an admin:

- `demo@trendpulse.dev` / `PulseDemo!2026`
- `admin@trendpulse.dev` / `PulseAdmin!2026`

Set `DEMO_LOGIN=false` to hide them. They are not created when `NODE_ENV` is production.

## What the first version does

1. A creator picks a niche, audience, tone, platforms, and language.
2. The list shows up to 20 cached topics for place, niche, language, and time range.
3. A topic opens volume, sentiment, questions, and sample posts.
4. Generate content ideas drafts 10 hooks, 5 reel ideas, 3 carousels, and 5 titles from that snapshot.
5. Hooks can be saved, marked to create / posted / performed well, and exported.
6. Admin usage shows cache hits, idea drafts, the worker budget, and a button to run ingestion.

Ideas are acceleration. The product does not promise virality. Percentages in a draft have to appear in the stored snapshot.

## X and the model

Leave `X_BEARER_TOKEN` empty and the app serves the demo snapshot. With a token, **Run ingestion** in admin queues one job that calls `GET /2/trends/by/woeid/{woeid}` for Global, India, Mumbai, Delhi, and Bengaluru, then recent search for the top five names in each region that returns data. Page views never call X.

Recent search is counted against a 450-request / 15-minute budget. A 429 parks the job until the window resets.

`LLM_API_KEY` turns on an OpenAI-compatible JSON draft. The response is rejected if it adds a percentage or a social handle that is not in the snapshot, and the local draft is used instead.

## Plans

Limits are enforced on the server. Payments are not connected.

| Plan | Deep dives / day | Fresh idea packs / day | Export |
| --- | --- | --- | --- |
| Free | 5 | 3 | none |
| Creator | unlimited | 30 | CSV |
| Pro | unlimited | 120 | CSV, JSON, Notion |
| Agency | unlimited | 400 | CSV, JSON, Notion |

Cached idea packs do not spend a generation. Rewriting one hook uses the local drafter and does not spend one either.

## Scripts

```bash
npm run dev
npm run build
npm test
npm run lint
```
