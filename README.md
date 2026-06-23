# OddsGod — Sports Betting Analytics

Black & gold, street-coded sports data dashboard. NFL · NBA · MLB.

## Pages

| File | URL | Description |
|------|-----|-------------|
| `index.html` | `/` | Landing page with animated hero, features, picks preview, pricing |
| `login.html` | `/login` | Login gate with particle background |
| `dashboard.html` | `/dashboard` | Full live dashboard — AI picks, odds, injuries, public/sharp, tracker |

## Stack

- Pure HTML/CSS/JS — zero frameworks, zero build step
- Google Fonts (Bebas Neue, Inter, JetBrains Mono)
- All data is simulated (fake engine built in) — swap for real API when ready

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

Replace the fake data engine in `dashboard.html` with:

- **Odds/Line Movement** → SportsDataIO or The Odds API
- **Injuries** → SportsDataIO player news endpoint  
- **Public vs Sharp** → OddsJam or The Rundown API
- **AI Picks** → Your own model or SportsDataIO AI predictions

## File Structure

```
oddsgod/
├── index.html        ← Landing page
├── login.html        ← Login page
├── dashboard.html    ← Main dashboard
├── css/
│   └── base.css      ← Shared design tokens & utilities
├── js/
│   └── utils.js      ← Shared JS helpers
├── vercel.json       ← Vercel routing config
├── netlify.toml      ← Netlify routing config
└── README.md         ← This file
```

## Roadmap

- [ ] Lock in brand name
- [ ] Buy domain
- [ ] Connect real data APIs (SportsDataIO recommended)
- [ ] Add auth (Clerk or Supabase)
- [ ] Add Stripe for Pro subscriptions
- [ ] Add parlay builder with AI grading
- [ ] Add weather/stadium intel panel
