# OddsGod — Sports Betting Analytics

Black & gold, street-coded sports data dashboard. NFL · NBA · MLB.

## Pages

| File | URL | Description |
|------|-----|-------------|
| `index.html` | `/` | Landing page with animated hero, features, picks preview, pricing |
| `login.html` | `/login` | Login gate with particle background |
| `dashboard.html` | `/dashboard` | Full live dashboard — AI picks, odds, injuries, public/sharp, tracker |
| `team.html` | `/team?id=<slug>` | Team profile — records, season stats, schedule, roster, betting trends |
| `player.html` | `/player?id=<slug>` | Player profile — stats, attribute radar, game log, prop lines |

## Stack

- Pure HTML/CSS/JS — zero frameworks, zero build step
- Google Fonts (Bebas Neue, Inter, JetBrains Mono)
- All data is simulated by a shared engine (`js/data.js`) — swap for real APIs when ready

## Data engine (`js/data.js`)

A single deterministic engine generates **every** team and player so the
dashboard, team pages, and player pages all stay consistent and nothing
dead-ends. Exposed on `window.OG`:

- All **92 teams** (32 NFL · 30 NBA · 30 MLB) with records, ATS splits, season stats
- Full **rosters** (~765 players) with stats, prop lines, injuries
- Today's **slate** (`OG.games`), league-wide **injuries**, **line moves**, **sharp splits**, **props**
- Profile builders `OG.teamProfile(slug)` / `OG.playerProfile(slug)`

Values are seeded from each slug (stable per entity, fresh daily for the slate).
`js/curated-data.js` holds hand-tuned, real-logo overrides for marquee
teams/players; the engine merges them in automatically.

## Deploy to Vercel (recommended)

```bash
# Option 1 — Vercel CLI
npm i -g vercel
cd oddsgod
vercel

# Option 2 — Drag & drop
# Go to vercel.com → New Project → drag the oddsgod folder in
```

## Deploy to Netlify

```bash
# Option 1 — Netlify CLI
npm i -g netlify-cli
cd oddsgod
netlify deploy --prod --dir .

# Option 2 — Drag & drop
# Go to app.netlify.com → drag the oddsgod folder onto the deploy zone
```

## Deploy to GitHub Pages

1. Push folder to a GitHub repo
2. Go to Settings → Pages → Source: main branch / root
3. Site live at `https://yourusername.github.io/oddsgod`

## When You're Ready for Real Data

Everything flows through `js/data.js`, so that's the only file to rewrite —
keep the `OG.*` shape and the pages keep working:

- **Odds/Line Movement** → SportsDataIO or The Odds API
- **Injuries** → SportsDataIO player news endpoint  
- **Public vs Sharp** → OddsJam or The Rundown API
- **AI Picks** → Your own model or SportsDataIO AI predictions

## File Structure

```
oddsgod/
├── index.html         ← Landing page
├── login.html         ← Login page
├── dashboard.html     ← Main dashboard
├── team.html          ← Team profile (any team)
├── player.html        ← Player profile (any player)
├── css/
│   └── base.css       ← Shared design tokens & utilities
├── js/
│   ├── data.js        ← Simulated data engine (all teams/players) → window.OG
│   ├── curated-data.js← Hand-tuned marquee team/player overrides
│   └── utils.js       ← Shared JS helpers
├── vercel.json        ← Vercel routing config
├── netlify.toml       ← Netlify routing config
└── README.md          ← This file
```

## Roadmap

- [ ] Lock in brand name
- [ ] Buy domain
- [ ] Connect real data APIs (SportsDataIO recommended)
- [ ] Add auth (Clerk or Supabase)
- [ ] Add Stripe for Pro subscriptions
- [ ] Add parlay builder with AI grading
- [ ] Add weather/stadium intel panel
