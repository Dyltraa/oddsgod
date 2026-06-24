/* ──────────────────────────────────────────────────────────────
   OddsGod — Simulated Data Engine  (window.OG)
   ----------------------------------------------------------------
   Single source of truth for ALL fake NFL / NBA / MLB data.
   Everything is generated DETERMINISTICALLY from a slug/seed, so the
   same team or player always produces identical numbers across the
   dashboard, team profile, and player profile pages.

   When real data is wired up later, only this file needs to change —
   the pages call OG.* and don't care where the numbers come from.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── seeded RNG (FNV-1a hash → mulberry32) ── */
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function rngFor(seed) { return mulberry32(hashStr(String(seed))); }

  /* ── small helpers ── */
  function ri(r, a, b) { return Math.floor(r() * (b - a + 1)) + a; }
  function rf(r, a, b, d) { const v = r() * (b - a) + a; return d == null ? v : +v.toFixed(d); }
  function pickOne(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
  function pct(w, total) { return total > 0 ? Math.round(w / total * 100) : 0; }
  function fmtSpread(v) { return (v > 0 ? '+' : '') + v; }
  function slugify(s) { return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
  function initials(name) {
    const parts = name.split(' ').filter(Boolean);
    return ((parts[0] || '')[0] || '') + ((parts[parts.length - 1] || '')[0] || '');
  }
  function badgeClass(sport) { return sport === 'NBA' ? 'b-nba' : sport === 'NFL' ? 'b-nfl' : 'b-mlb'; }

  /* ── league config ── */
  const GP = { NFL: 11, NBA: 25, MLB: 83 };

  /* ── team metadata: [city, name, abbr, conference string, venue] ── */
  const META = {
    NFL: [
      ['Buffalo', 'Bills', 'BUF', 'AFC East · American Football Conference', 'Highmark Stadium'],
      ['Miami', 'Dolphins', 'MIA', 'AFC East · American Football Conference', 'Hard Rock Stadium'],
      ['New England', 'Patriots', 'NE', 'AFC East · American Football Conference', 'Gillette Stadium'],
      ['New York', 'Jets', 'NYJ', 'AFC East · American Football Conference', 'MetLife Stadium'],
      ['Baltimore', 'Ravens', 'BAL', 'AFC North · American Football Conference', 'M&T Bank Stadium'],
      ['Cincinnati', 'Bengals', 'CIN', 'AFC North · American Football Conference', 'Paycor Stadium'],
      ['Cleveland', 'Browns', 'CLE', 'AFC North · American Football Conference', 'Huntington Bank Field'],
      ['Pittsburgh', 'Steelers', 'PIT', 'AFC North · American Football Conference', 'Acrisure Stadium'],
      ['Houston', 'Texans', 'HOU', 'AFC South · American Football Conference', 'NRG Stadium'],
      ['Indianapolis', 'Colts', 'IND', 'AFC South · American Football Conference', 'Lucas Oil Stadium'],
      ['Jacksonville', 'Jaguars', 'JAX', 'AFC South · American Football Conference', 'EverBank Stadium'],
      ['Tennessee', 'Titans', 'TEN', 'AFC South · American Football Conference', 'Nissan Stadium'],
      ['Denver', 'Broncos', 'DEN', 'AFC West · American Football Conference', 'Empower Field at Mile High'],
      ['Kansas City', 'Chiefs', 'KC', 'AFC West · American Football Conference', 'Arrowhead Stadium'],
      ['Las Vegas', 'Raiders', 'LV', 'AFC West · American Football Conference', 'Allegiant Stadium'],
      ['Los Angeles', 'Chargers', 'LAC', 'AFC West · American Football Conference', 'SoFi Stadium'],
      ['Dallas', 'Cowboys', 'DAL', 'NFC East · National Football Conference', 'AT&T Stadium'],
      ['New York', 'Giants', 'NYG', 'NFC East · National Football Conference', 'MetLife Stadium'],
      ['Philadelphia', 'Eagles', 'PHI', 'NFC East · National Football Conference', 'Lincoln Financial Field'],
      ['Washington', 'Commanders', 'WAS', 'NFC East · National Football Conference', 'Northwest Stadium'],
      ['Chicago', 'Bears', 'CHI', 'NFC North · National Football Conference', 'Soldier Field'],
      ['Detroit', 'Lions', 'DET', 'NFC North · National Football Conference', 'Ford Field'],
      ['Green Bay', 'Packers', 'GB', 'NFC North · National Football Conference', 'Lambeau Field'],
      ['Minnesota', 'Vikings', 'MIN', 'NFC North · National Football Conference', 'U.S. Bank Stadium'],
      ['Atlanta', 'Falcons', 'ATL', 'NFC South · National Football Conference', 'Mercedes-Benz Stadium'],
      ['Carolina', 'Panthers', 'CAR', 'NFC South · National Football Conference', 'Bank of America Stadium'],
      ['New Orleans', 'Saints', 'NO', 'NFC South · National Football Conference', 'Caesars Superdome'],
      ['Tampa Bay', 'Buccaneers', 'TB', 'NFC South · National Football Conference', 'Raymond James Stadium'],
      ['Arizona', 'Cardinals', 'ARI', 'NFC West · National Football Conference', 'State Farm Stadium'],
      ['Los Angeles', 'Rams', 'LAR', 'NFC West · National Football Conference', 'SoFi Stadium'],
      ['San Francisco', '49ers', 'SF', 'NFC West · National Football Conference', "Levi's Stadium"],
      ['Seattle', 'Seahawks', 'SEA', 'NFC West · National Football Conference', 'Lumen Field']
    ],
    NBA: [
      ['Boston', 'Celtics', 'BOS', 'Atlantic Division · Eastern Conference', 'TD Garden'],
      ['Brooklyn', 'Nets', 'BKN', 'Atlantic Division · Eastern Conference', 'Barclays Center'],
      ['New York', 'Knicks', 'NYK', 'Atlantic Division · Eastern Conference', 'Madison Square Garden'],
      ['Philadelphia', '76ers', 'PHI', 'Atlantic Division · Eastern Conference', 'Wells Fargo Center'],
      ['Toronto', 'Raptors', 'TOR', 'Atlantic Division · Eastern Conference', 'Scotiabank Arena'],
      ['Chicago', 'Bulls', 'CHI', 'Central Division · Eastern Conference', 'United Center'],
      ['Cleveland', 'Cavaliers', 'CLE', 'Central Division · Eastern Conference', 'Rocket Mortgage FieldHouse'],
      ['Detroit', 'Pistons', 'DET', 'Central Division · Eastern Conference', 'Little Caesars Arena'],
      ['Indiana', 'Pacers', 'IND', 'Central Division · Eastern Conference', 'Gainbridge Fieldhouse'],
      ['Milwaukee', 'Bucks', 'MIL', 'Central Division · Eastern Conference', 'Fiserv Forum'],
      ['Atlanta', 'Hawks', 'ATL', 'Southeast Division · Eastern Conference', 'State Farm Arena'],
      ['Charlotte', 'Hornets', 'CHA', 'Southeast Division · Eastern Conference', 'Spectrum Center'],
      ['Miami', 'Heat', 'MIA', 'Southeast Division · Eastern Conference', 'Kaseya Center'],
      ['Orlando', 'Magic', 'ORL', 'Southeast Division · Eastern Conference', 'Kia Center'],
      ['Washington', 'Wizards', 'WAS', 'Southeast Division · Eastern Conference', 'Capital One Arena'],
      ['Denver', 'Nuggets', 'DEN', 'Northwest Division · Western Conference', 'Ball Arena'],
      ['Minnesota', 'Timberwolves', 'MIN', 'Northwest Division · Western Conference', 'Target Center'],
      ['Oklahoma City', 'Thunder', 'OKC', 'Northwest Division · Western Conference', 'Paycom Center'],
      ['Portland', 'Trail Blazers', 'POR', 'Northwest Division · Western Conference', 'Moda Center'],
      ['Utah', 'Jazz', 'UTA', 'Northwest Division · Western Conference', 'Delta Center'],
      ['Golden State', 'Warriors', 'GSW', 'Pacific Division · Western Conference', 'Chase Center'],
      ['Los Angeles', 'Clippers', 'LAC', 'Pacific Division · Western Conference', 'Intuit Dome'],
      ['Los Angeles', 'Lakers', 'LAL', 'Pacific Division · Western Conference', 'Crypto.com Arena'],
      ['Phoenix', 'Suns', 'PHX', 'Pacific Division · Western Conference', 'Footprint Center'],
      ['Sacramento', 'Kings', 'SAC', 'Pacific Division · Western Conference', 'Golden 1 Center'],
      ['Dallas', 'Mavericks', 'DAL', 'Southwest Division · Western Conference', 'American Airlines Center'],
      ['Houston', 'Rockets', 'HOU', 'Southwest Division · Western Conference', 'Toyota Center'],
      ['Memphis', 'Grizzlies', 'MEM', 'Southwest Division · Western Conference', 'FedExForum'],
      ['New Orleans', 'Pelicans', 'NOP', 'Southwest Division · Western Conference', 'Smoothie King Center'],
      ['San Antonio', 'Spurs', 'SAS', 'Southwest Division · Western Conference', 'Frost Bank Center']
    ],
    MLB: [
      ['Baltimore', 'Orioles', 'BAL', 'AL East · American League', 'Oriole Park at Camden Yards'],
      ['Boston', 'Red Sox', 'BOS', 'AL East · American League', 'Fenway Park'],
      ['New York', 'Yankees', 'NYY', 'AL East · American League', 'Yankee Stadium'],
      ['Tampa Bay', 'Rays', 'TB', 'AL East · American League', 'Tropicana Field'],
      ['Toronto', 'Blue Jays', 'TOR', 'AL East · American League', 'Rogers Centre'],
      ['Chicago', 'White Sox', 'CWS', 'AL Central · American League', 'Rate Field'],
      ['Cleveland', 'Guardians', 'CLE', 'AL Central · American League', 'Progressive Field'],
      ['Detroit', 'Tigers', 'DET', 'AL Central · American League', 'Comerica Park'],
      ['Kansas City', 'Royals', 'KC', 'AL Central · American League', 'Kauffman Stadium'],
      ['Minnesota', 'Twins', 'MIN', 'AL Central · American League', 'Target Field'],
      ['Houston', 'Astros', 'HOU', 'AL West · American League', 'Daikin Park'],
      ['Los Angeles', 'Angels', 'LAA', 'AL West · American League', 'Angel Stadium'],
      ['Athletics', 'Athletics', 'ATH', 'AL West · American League', 'Sutter Health Park'],
      ['Seattle', 'Mariners', 'SEA', 'AL West · American League', 'T-Mobile Park'],
      ['Texas', 'Rangers', 'TEX', 'AL West · American League', 'Globe Life Field'],
      ['Atlanta', 'Braves', 'ATL', 'NL East · National League', 'Truist Park'],
      ['Miami', 'Marlins', 'MIA', 'NL East · National League', 'loanDepot park'],
      ['New York', 'Mets', 'NYM', 'NL East · National League', 'Citi Field'],
      ['Philadelphia', 'Phillies', 'PHI', 'NL East · National League', 'Citizens Bank Park'],
      ['Washington', 'Nationals', 'WSH', 'NL East · National League', 'Nationals Park'],
      ['Chicago', 'Cubs', 'CHC', 'NL Central · National League', 'Wrigley Field'],
      ['Cincinnati', 'Reds', 'CIN', 'NL Central · National League', 'Great American Ball Park'],
      ['Milwaukee', 'Brewers', 'MIL', 'NL Central · National League', 'American Family Field'],
      ['Pittsburgh', 'Pirates', 'PIT', 'NL Central · National League', 'PNC Park'],
      ['St. Louis', 'Cardinals', 'STL', 'NL Central · National League', 'Busch Stadium'],
      ['Arizona', 'Diamondbacks', 'AZ', 'NL West · National League', 'Chase Field'],
      ['Colorado', 'Rockies', 'COL', 'NL West · National League', 'Coors Field'],
      ['Los Angeles', 'Dodgers', 'LAD', 'NL West · National League', 'Dodger Stadium'],
      ['San Diego', 'Padres', 'SD', 'NL West · National League', 'Petco Park'],
      ['San Francisco', 'Giants', 'SF', 'NL West · National League', 'Oracle Park']
    ]
  };

  /* ── name pools for generated players ── */
  const FIRST = ['Jalen', 'Marcus', 'Devin', 'Tyler', 'Cameron', 'Brandon', 'Jordan', 'Trey', 'Malik', 'Darius',
    'Xavier', 'Caleb', 'Mason', 'Carter', 'Hunter', 'Cooper', 'Jaxon', 'Bryce', 'Isaiah', 'Elijah',
    'Damian', 'Terrence', 'Kobe', 'Zion', 'Jamal', 'Anthony', 'Chris', 'Kevin', 'Derek', 'Andre',
    'Victor', 'Julian', 'Maxwell', 'Gavin', 'Owen', 'Dominic', 'Tariq', 'Rashad', 'Deshawn', 'Amari',
    'Kai', 'Nico', 'Diego', 'Santiago', 'Mateo', 'Hideki', 'Yusei', 'Bogdan', 'Goran', 'Dario'];
  const LAST = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
    'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson',
    'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright',
    'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips',
    'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed',
    'Cook', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Howard', 'Ward', 'Torres',
    'Peterson', 'Gray', 'Ramirez', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Barnes',
    'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Foster', 'Russell', 'Griffin', 'Hayes'];

  const ROSTER_POS = {
    NBA: ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'C'],
    NFL: ['QB', 'RB', 'WR', 'WR', 'TE', 'WR', 'LB', 'CB'],
    MLB: ['SP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']
  };

  const INJURY_NOTES = {
    NBA: ['Ankle', 'Knee', 'Hamstring', 'Rest', 'Calf', 'Wrist', 'Back', 'Illness', 'Hip', 'Shoulder'],
    NFL: ['Knee', 'Shoulder', 'Hamstring', 'Ankle', 'Concussion', 'Groin', 'Quad', 'Ribs', 'Hip', 'Foot'],
    MLB: ['Hamstring', 'Forearm', 'Wrist', 'Oblique', 'Shoulder', 'Back', 'Elbow', 'Knee', 'Hip', 'Illness']
  };

  const DATES10 = ['Jun 18', 'Jun 15', 'Jun 12', 'Jun 10', 'Jun 7', 'Jun 4', 'Jun 1', 'May 29', 'May 26', 'May 23'];

  /* ══════════════════════════════════════════════════════════════
     CORE TEAM NUMBERS  (shared by summary row + profile page)
     ══════════════════════════════════════════════════════════════ */
  const _coreCache = {};
  function teamCore(slug) {
    if (_coreCache[slug]) return _coreCache[slug];
    const m = META_BY_SLUG[slug];
    if (!m) return null;
    const r = rngFor('core:' + slug);
    const sport = m.sport, gp = GP[sport];
    const strength = r();                                   // 0..1 talent level (stable)

    const winPct = clamp(0.30 + 0.42 * strength + (r() - 0.5) * 0.08, 0.18, 0.86);
    const w = clamp(Math.round(gp * winPct), 0, gp), l = gp - w;

    const atsPct0 = clamp(0.42 + (strength - 0.5) * 0.28 + (r() - 0.5) * 0.18, 0.30, 0.72);
    const atsW = clamp(Math.round(gp * atsPct0), 0, gp), atsL = gp - atsW;

    const overPct = clamp(0.45 + (r() - 0.5) * 0.26, 0.32, 0.66);
    const ouO = clamp(Math.round(gp * overPct), 0, gp), ouU = gp - ouO;

    const homeGp = Math.ceil(gp / 2), awayGp = gp - homeGp;
    const homeAtsW = clamp(Math.round(homeGp * clamp(atsPct0 + 0.06, 0, 1)), 0, homeGp);
    const homeAtsL = homeGp - homeAtsW;
    const awayAtsW = clamp(atsW - homeAtsW, 0, awayGp), awayAtsL = awayGp - awayAtsW;
    const homeW = clamp(Math.round(homeGp * clamp(winPct + 0.08, 0, 1)), 0, homeGp), homeL = homeGp - homeW;
    const awayW = clamp(w - homeW, 0, awayGp), awayL = awayGp - awayW;

    // recent form / streak
    const rf2 = rngFor('form:' + slug);
    const last = [];
    for (let i = 0; i < 10; i++) last.push(rf2() < winPct ? 'W' : 'L');
    let streakCh = last[0], streakN = 1;
    for (let i = 1; i < last.length; i++) { if (last[i] === streakCh) streakN++; else break; }
    const streak = streakCh + streakN;

    // sport-specific aggregate stats
    let s = {};
    if (sport === 'NBA') {
      const ppg = rf(r, 105 + strength * 16, 109 + strength * 16, 1);
      const oppg = rf(r, 118 - strength * 11, 121 - strength * 11, 1);
      s = {
        ppg, oppg, pace: rf(r, 96, 104, 1), threes: rf(r, 11, 18, 1),
        rebMargin: rf(r, (strength - 0.5) * 8 - 1, (strength - 0.5) * 8 + 1, 1),
        astTo: rf(r, 1.6 + strength * 0.6, 1.8 + strength * 0.6, 2),
        tpp: rf(r, 34, 39, 1), margin: +(ppg - oppg).toFixed(1), avgTotal: +(ppg + oppg).toFixed(1)
      };
    } else if (sport === 'NFL') {
      const ppg = rf(r, 17 + strength * 13, 19 + strength * 13, 1);
      const oppg = rf(r, 27 - strength * 9, 29 - strength * 9, 1);
      s = {
        ppg, oppg, ydsG: Math.round(rf(r, 290 + strength * 95, 305 + strength * 95)),
        toMargin: Math.round(rf(r, (strength - 0.5) * 14 - 1, (strength - 0.5) * 14 + 1)),
        thirdDown: Math.round(rf(r, 33 + strength * 13, 35 + strength * 13)),
        rzTd: Math.round(rf(r, 50 + strength * 20, 53 + strength * 20)),
        margin: +(ppg - oppg).toFixed(1), avgTotal: +(ppg + oppg).toFixed(1)
      };
    } else {
      const rpg = rf(r, 3.8 + strength * 1.9, 4.0 + strength * 1.9, 1);
      s = {
        rpg, era: rf(r, 4.7 - strength * 1.6, 4.5 - strength * 1.6, 2),
        avg: rf(r, 0.238 + strength * 0.028, 0.242 + strength * 0.028, 3),
        hr: Math.round(rf(r, 70 + strength * 65, 80 + strength * 65)),
        whip: rf(r, 1.40 - strength * 0.32, 1.36 - strength * 0.32, 2),
        ops: rf(r, 0.690 + strength * 0.120, 0.700 + strength * 0.120, 3),
        runDiff: rf(r, (strength - 0.5) * 2.4 - 0.3, (strength - 0.5) * 2.4 + 0.3, 1),
        avgTotal: rf(r, 7.6, 9.4, 1)
      };
    }

    const core = {
      slug, sport, strength, gp, w, l, winPct,
      atsW, atsL, atsPct: pct(atsW, gp),
      ouO, ouU,
      homeAtsW, homeAtsL, awayAtsW, awayAtsL, homeW, homeL, awayW, awayL,
      streak, last, stats: s
    };
    _coreCache[slug] = core;
    return core;
  }

  /* ══════════════════════════════════════════════════════════════
     PLAYERS  (rosters generated once at load → registry by slug)
     ══════════════════════════════════════════════════════════════ */
  function genPlayerStats(r, sport, pos, strength) {
    if (sport === 'NBA') {
      const big = (pos === 'C' || pos === 'PF' || pos === 'F');
      const guard = (pos === 'PG' || pos === 'G' || pos === 'SG');
      return {
        ppg: rf(r, 5 + strength * 23, 7 + strength * 23, 1),
        rpg: rf(r, big ? 4 + strength * 8 : 2 + strength * 4, big ? 5 + strength * 8 : 3 + strength * 4, 1),
        apg: rf(r, guard ? 2 + strength * 7 : 1 + strength * 3, guard ? 3 + strength * 7 : 1.5 + strength * 3, 1),
        fg: Math.round(rf(r, 42 + strength * 13, 45 + strength * 13)),
        tp: Math.round(rf(r, 30 + strength * 12, 33 + strength * 12)),
        per: rf(r, 9 + strength * 19, 11 + strength * 19, 1),
        ts: Math.round(rf(r, 52 + strength * 14, 55 + strength * 14)),
        mpg: Math.round(rf(r, 22 + strength * 14, 26 + strength * 12))
      };
    }
    if (sport === 'NFL') {
      if (pos === 'QB') return {
        passYds: Math.round(rf(r, 180 + strength * 150, 210 + strength * 150)),
        tdg: rf(r, 1 + strength * 2, 1.3 + strength * 2, 1),
        comp: Math.round(rf(r, 58 + strength * 12, 60 + strength * 12)),
        qbr: rf(r, 70 + strength * 42, 78 + strength * 42, 1),
        intRate: rf(r, 2.3 - strength * 1.6, 2.0 - strength * 1.6, 1),
        rating: rf(r, 78 + strength * 38, 84 + strength * 38, 1)
      };
      if (pos === 'RB') return {
        rushYds: Math.round(rf(r, 35 + strength * 85, 50 + strength * 85)),
        ypc: rf(r, 3.4 + strength * 2.0, 3.7 + strength * 2.0, 1),
        rec: rf(r, 1 + strength * 4, 1.5 + strength * 4, 1),
        tds: rf(r, strength * 1.0, strength * 1.3, 1),
        carries: Math.round(rf(r, 9 + strength * 14, 12 + strength * 14))
      };
      if (pos === 'WR' || pos === 'TE') return {
        recYds: Math.round(rf(r, 25 + strength * 85, 40 + strength * 85)),
        rec: rf(r, 2 + strength * 6, 2.5 + strength * 6, 1),
        tds: rf(r, strength * 0.8, strength * 1.1, 1),
        tgts: rf(r, 4 + strength * 7, 5 + strength * 7, 1)
      };
      return { // LB / CB / DEF
        tkl: rf(r, 4 + strength * 6, 5 + strength * 6, 1),
        sks: rf(r, strength * 1.6, strength * 1.9, 1),
        ints: rf(r, strength * 0.6, strength * 0.8, 1)
      };
    }
    // MLB
    if (pos === 'SP' || pos === 'RP') return {
      era: rf(r, 5.2 - strength * 2.5, 4.9 - strength * 2.5, 2),
      k9: rf(r, 6 + strength * 6, 6.6 + strength * 6, 1),
      whip: rf(r, 1.52 - strength * 0.45, 1.46 - strength * 0.45, 2),
      w: ri(r, 1, 4 + Math.round(strength * 10)),
      l: ri(r, 1, 8),
      ip: Math.round(rf(r, 60 + strength * 80, 80 + strength * 80))
    };
    return { // hitter
      avg: rf(r, 0.220 + strength * 0.072, 0.232 + strength * 0.072, 3),
      hr: ri(r, 0, Math.round(2 + strength * 36)),
      rbi: ri(r, 8, Math.round(20 + strength * 80)),
      ops: rf(r, 0.620 + strength * 0.250, 0.650 + strength * 0.250, 3),
      sb: ri(r, 0, Math.round(strength * 28)),
      runs: ri(r, 10, Math.round(25 + strength * 70))
    };
  }

  // roster-row display values (3 stat columns used on the team page)
  function rosterDisplay(sport, pos, st) {
    if (sport === 'NBA') return { ppg: '' + st.ppg, rpg: '' + st.rpg, apg: '' + st.apg };
    if (sport === 'NFL') {
      if (pos === 'QB') return { ppg: st.passYds + ' Yds', rpg: st.tdg + ' TD/G', apg: st.comp + '% Cmp' };
      if (pos === 'RB') return { ppg: st.rushYds + ' Yds', rpg: st.ypc + ' YPC', apg: st.tds + ' TD' };
      if (pos === 'WR' || pos === 'TE') return { ppg: st.recYds + ' Yds', rpg: st.rec + ' Rec', apg: st.tds + ' TD' };
      return { ppg: st.tkl + ' Tkl', rpg: st.sks + ' Sk', apg: st.ints + ' INT' };
    }
    if (pos === 'SP' || pos === 'RP') return { ppg: '' + st.era, rpg: st.k9 + ' K9', apg: st.w + '-' + st.l };
    return { ppg: ('' + st.avg).replace(/^0/, ''), rpg: st.hr + ' HR', apg: st.rbi + ' RBI' };
  }

  function genRoster(slug) {
    const m = META_BY_SLUG[slug];
    const core = teamCore(slug);
    const sport = m.sport;
    const positions = ROSTER_POS[sport];
    const r = rngFor('roster:' + slug);
    const used = {};
    const out = [];
    positions.forEach((pos, i) => {
      // build a unique name
      let name, key, guard = 0;
      do {
        name = pickOne(r, FIRST) + ' ' + pickOne(r, LAST);
        key = name; guard++;
      } while (used[key] && guard < 12);
      used[key] = 1;
      // first listed player at a position is the "star" → higher strength
      const tilt = i === 0 ? 0.78 : i < 3 ? 0.55 : 0.4;
      const pStrength = clamp(tilt + (r() - 0.5) * 0.4 + (core.strength - 0.5) * 0.3, 0.05, 0.98);
      const st = genPlayerStats(r, sport, pos, pStrength);
      const disp = rosterDisplay(sport, pos, st);
      // injury
      const ir = rngFor('inj:' + slug + ':' + name);
      const roll = ir();
      const status = roll < 0.05 ? 'out' : roll < 0.13 ? 'questionable' : roll < 0.18 ? 'probable' : 'ok';
      const note = status === 'ok' ? 'None' : pickOne(ir, INJURY_NOTES[sport]);
      const updated = ri(ir, 4, 320); // minutes ago
      const pslug = slugify(name) + '-' + m.abbr.toLowerCase();
      out.push({
        name, slug: pslug, initials: initials(name).toUpperCase(),
        pos, num: ri(r, 0, 55), age: ri(r, 21, 37),
        sport, teamSlug: slug, teamAbbr: m.abbr, teamName: m.name,
        strength: pStrength, stats: st,
        ppg: disp.ppg, rpg: disp.rpg, apg: disp.apg,
        inj: status, injNote: note, injUpdated: updated
      });
    });
    return out;
  }

  /* ══════════════════════════════════════════════════════════════
     BUILD GLOBAL REGISTRIES
     ══════════════════════════════════════════════════════════════ */
  const META_BY_SLUG = {};
  const ALL_TEAMS = [];
  Object.keys(META).forEach(sport => {
    META[sport].forEach(row => {
      const [city, name, abbr, conf, venue] = row;
      const full = (city && city !== name) ? city + ' ' + name : name;
      const slug = slugify(full);
      const meta = { city, name: full, short: name, abbr, sport, conf, venue, slug };
      META_BY_SLUG[slug] = meta;
      ALL_TEAMS.push(meta);
    });
  });

  /* curated overrides (loaded by curated-data.js BEFORE this file) */
  const CURATED_TEAMS = (window.OG_CURATED_TEAMS) || {};
  const CURATED_PLAYERS = (window.OG_CURATED_PLAYERS) || {};

  // team summary rows (for tables / pickers) — curated when available, else derived from core
  function teamSummary(m) {
    const cur = CURATED_TEAMS[m.slug];
    if (cur && cur.records) {
      const recVal = lbl => (cur.records.find(x => x.lbl === lbl) || {}).val || '';
      const ats = recVal('ATS');
      const atsHero = (cur.heroStats || []).find(x => x.lbl === 'ATS%');
      let atsPct = atsHero ? parseInt(atsHero.val, 10) : 0;
      if (!atsPct && ats.indexOf('-') >= 0) { const [w, l] = ats.split('-').map(Number); atsPct = pct(w, w + l); }
      let streak = '—';
      if (cur.gameLog && cur.gameLog.length) {
        const f = cur.gameLog[0][2][0]; let n = 0;
        for (const row of cur.gameLog) { if (row[2][0] === f) n++; else break; }
        streak = f + n;
      }
      return {
        slug: m.slug, name: m.name, abbr: m.abbr, sport: m.sport, conf: m.conf, venue: m.venue,
        wl: recVal('Overall'), ats: ats, atsPct: atsPct, ou: recVal('O/U'),
        homeAts: recVal('Home'), awayAts: recVal('Away'), streak: streak, strength: 0.6
      };
    }
    const c = teamCore(m.slug);
    return {
      slug: m.slug, name: m.name, abbr: m.abbr, sport: m.sport, conf: m.conf, venue: m.venue,
      wl: c.w + '-' + c.l, ats: c.atsW + '-' + c.atsL, atsPct: c.atsPct,
      ou: c.ouO + '-' + c.ouU, homeAts: c.homeAtsW + '-' + c.homeAtsL,
      awayAts: c.awayAtsW + '-' + c.awayAtsL, streak: c.streak,
      strength: c.strength
    };
  }
  const TEAM_SUMMARIES = ALL_TEAMS.map(teamSummary);

  // player registry
  const PLAYER_BY_SLUG = {};
  const TEAM_ROSTER = {};
  ALL_TEAMS.forEach(m => {
    const roster = genRoster(m.slug);
    TEAM_ROSTER[m.slug] = roster;
    roster.forEach(p => { PLAYER_BY_SLUG[p.slug] = p; });
  });
  const ALL_PLAYERS = Object.values(PLAYER_BY_SLUG);

  /* ══════════════════════════════════════════════════════════════
     LINES / SPREADS  helpers
     ══════════════════════════════════════════════════════════════ */
  function americanFromProb(p) {
    p = clamp(p, 0.05, 0.95);
    return p >= 0.5 ? -Math.round((p / (1 - p)) * 100) : Math.round(((1 - p) / p) * 100);
  }
  // spread of HOME team (negative = favored) from the two cores
  function matchupLines(home, away) {
    const hc = teamCore(home.slug), ac = teamCore(away.slug), sport = home.sport;
    const diff = hc.strength - ac.strength; // >0 home better
    let spread, ou, hProb;
    if (sport === 'NBA') {
      spread = -Math.round((diff * 16 + 2.6) * 2) / 2;
      ou = Math.round((hc.stats.avgTotal / 2 + ac.stats.avgTotal / 2) * 2) / 2;
      hProb = clamp(0.5 + diff * 0.9 + 0.04, 0.1, 0.9);
    } else if (sport === 'NFL') {
      spread = -Math.round((diff * 11 + 1.8) * 2) / 2;
      ou = Math.round((hc.stats.avgTotal / 2 + ac.stats.avgTotal / 2) * 2) / 2;
      hProb = clamp(0.5 + diff * 0.85 + 0.03, 0.1, 0.9);
    } else {
      spread = -1.5; // baseball run line
      ou = Math.round((hc.stats.avgTotal / 2 + ac.stats.avgTotal / 2) * 2) / 2;
      hProb = clamp(0.5 + diff * 0.55 + 0.03, 0.2, 0.82);
    }
    if (spread === 0) spread = sport === 'NBA' ? -1 : -1;
    return {
      spread,                              // home spread
      ou,
      mlHome: americanFromProb(hProb),
      mlAway: americanFromProb(1 - hProb),
      hProb,
      favored: spread < 0 ? home.abbr : away.abbr
    };
  }

  /* ══════════════════════════════════════════════════════════════
     TODAY'S SLATE  (deterministic by date)
     ══════════════════════════════════════════════════════════════ */
  function buildSlate() {
    const dateKey = new Date().toISOString().slice(0, 10);
    const counts = { NBA: 4, NFL: 3, MLB: 3 };
    const times = ['1:05 PM', '1:10 PM', '4:25 PM', '7:10 PM', '7:30 PM', '8:00 PM', '8:20 PM', '9:00 PM', '9:40 PM', '10:00 PM'];
    const games = [];
    let gi = 1;
    Object.keys(counts).forEach(sport => {
      const r = rngFor('slate:' + sport + ':' + dateKey);
      const pool = ALL_TEAMS.filter(t => t.sport === sport).slice();
      // shuffle
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      for (let k = 0; k < counts[sport] && pool.length >= 2; k++) {
        const away = pool.pop(), home = pool.pop();
        const ln = matchupLines(home, away);
        const gr = rngFor('game:' + home.slug + ':' + away.slug + ':' + dateKey);
        const conf = ri(gr, 58, 90);
        // pick the AI side
        let pick, pickSide;
        const wantTotal = gr() < 0.25;
        if (wantTotal) {
          const over = gr() < 0.55;
          pick = (over ? 'OVER ' : 'UNDER ') + ln.ou; pickSide = over ? 'OVER' : 'UNDER';
        } else {
          const takeHome = ln.hProb >= 0.5 ? gr() < 0.6 : gr() < 0.45;
          if (takeHome) { pick = home.abbr + ' ' + fmtSpread(ln.spread); pickSide = home.abbr; }
          else { pick = away.abbr + ' ' + fmtSpread(-ln.spread); pickSide = away.abbr; }
        }
        const weather = home.sport === 'MLB' || ['Buffalo', 'Chicago', 'Green Bay', 'Pittsburgh', 'Cleveland', 'Denver', 'Cincinnati', 'Boston', 'Baltimore', 'Seattle', 'Philadelphia', 'New York', 'San Francisco', 'Kansas City', 'New England', 'Washington', 'Tennessee', 'Carolina', 'Jacksonville']
          .indexOf(META_BY_SLUG[home.slug].city) >= 0
          ? pickOne(gr, ['72°F ⛅', '58°F 🌧', '65°F 🌤', '49°F 🌬', '81°F ☀️', '60°F 🌫'])
          : 'Indoor';
        games.push({
          id: 'g' + (gi++), sport,
          home: home.abbr, away: away.abbr,
          homeSlug: home.slug, awaySlug: away.slug,
          homeName: home.name, awayName: away.name,
          time: pickOne(rngFor('t:' + home.slug + dateKey), times),
          venue: home.venue, weather,
          spread: ln.spread, ml: ln.mlHome, mlAway: ln.mlAway, ou: ln.ou,
          favored: ln.favored, pick, pickSide, conf,
          pub: ri(gr, 22, 80), shp: ri(gr, 25, 88)
        });
      }
    });
    return games;
  }
  const SLATE = buildSlate();

  /* derived dashboard collections ────────────────────────────── */

  // AI explainer factors + narrative for a slate game
  function explainerFor(g) {
    const r = rngFor('explain:' + g.id + g.homeSlug);
    const factorPool = {
      NBA: ['Pace Rating', 'Net Rating Edge', 'Rebound Margin', 'Home Advantage', 'Rest Differential', 'Sharp Money %', 'ATS Trend (10g)', 'Pace-adjusted DEF'],
      NFL: ['Line Movement', 'Pass Rush Edge', 'DEF Matchup', 'Turnover Margin', 'Sharp Money %', 'ATS Road Trend', 'QB Rating Edge', 'Red Zone TD%'],
      MLB: ['Pitching Edge', 'Edge vs Market', 'Sharp Money %', 'Recent Form', 'Bullpen ERA', 'Park Factor', 'Lineup Depth', 'Platoon Splits']
    }[g.sport];
    const picked = factorPool.slice().sort(() => r() - 0.5).slice(0, 5);
    const factors = picked.map((label, i) => {
      const dir = i === 4 ? 'neg' : 'pos';
      const val = dir === 'pos' ? ri(r, 60, 90) : ri(r, 28, 45);
      return { label, val, dir };
    });
    const fav = g.favored === g.home ? g.homeName : g.awayName;
    const dog = g.favored === g.home ? g.awayName : g.homeName;
    const explain = `The model is backing <strong>${g.pick}</strong> with ${g.conf >= 78 ? 'high' : 'moderate'} conviction. ` +
      `${fav} grades out ahead of ${dog} on the key betting metrics this slate, and the line has been ` +
      `${g.pub > g.shp ? 'bet up by the public' : 'shaped by sharp money'} into the current number. ` +
      `Our edge model flags value at <strong>${g.pick}</strong> versus the market consensus.`;
    const risks = [
      'Line has already moved — some value may be priced in',
      g.sport === 'MLB' ? 'Bullpen usage and weather can swing the total' : 'Watch the injury report before lock',
      g.pub > 65 ? 'Heavy public action — fade risk if line is a trap' : 'Lower liquidity game — number can move fast'
    ];
    return { explain, factors, risks };
  }

  // injuries feed (league-wide, sorted by recency, impact from strength)
  function buildInjuries() {
    const list = ALL_PLAYERS.filter(p => p.inj !== 'ok');
    list.sort((a, b) => a.injUpdated - b.injUpdated);
    return list.map(p => ({
      name: p.name, slug: p.slug, team: p.teamAbbr, teamSlug: p.teamSlug, pos: p.pos,
      sport: p.sport, status: p.inj, note: p.injNote, age: p.injUpdated,
      impact: p.strength > 0.7 ? 'HIGH' : p.strength > 0.45 ? 'MED' : 'LOW'
    }));
  }
  const INJURIES = buildInjuries();

  // line-move history derived from slate
  function buildLineMoves() {
    const out = [];
    const types = ['Spread', 'ML', 'Total'];
    const trig = ['Sharp', 'Steam', 'Public', 'Sharp'];
    SLATE.forEach(g => {
      const r = rngFor('lm:' + g.id);
      const n = ri(r, 1, 2);
      for (let i = 0; i < n; i++) {
        const type = pickOne(r, types);
        let open, cur, move;
        if (type === 'Spread') { const o = g.spread + (ri(r, -3, 3) * 0.5); cur = g.spread; open = o; move = (cur - open); }
        else if (type === 'Total') { const o = g.ou + (ri(r, -4, 4) * 0.5); cur = g.ou; open = o; move = (cur - open); }
        else { const o = g.ml + ri(r, -25, 25); cur = g.ml; open = o; move = (cur - open); }
        out.push({
          game: g.away + ' vs ' + g.home, sport: g.sport, type,
          open: type === 'ML' ? fmtSpread(Math.round(open)) : '' + open,
          current: type === 'ML' ? fmtSpread(Math.round(cur)) : '' + cur,
          move: (move > 0 ? '+' : '') + (type === 'ML' ? Math.round(move) : (+move.toFixed(1))),
          trigger: pickOne(r, trig), time: ri(r, 8, 180) + 'm ago'
        });
      }
    });
    return out;
  }
  const LINE_MOVES = buildLineMoves();

  // steam / reverse-line moves (sharp view)
  function buildSteam() {
    return SLATE.slice(0, 6).map(g => {
      const r = rngFor('steam:' + g.id);
      const kind = pickOne(r, ['Steam', 'Sharp', 'Reverse']);
      return {
        game: g.away + ' vs ' + g.home, side: g.pick, type: kind,
        move: g.sport === 'MLB' ? fmtSpread(g.ml + ri(r, -20, -5)) + '→' + fmtSpread(g.ml) :
          (g.spread - (ri(r, 1, 4) * 0.5)) + '→' + g.spread,
        pub: g.pub, shp: g.shp,
        tag: kind === 'Steam' ? 'tag-steam' : kind === 'Reverse' ? 'tag-reverse' : 'tag-sharp'
      };
    });
  }
  const STEAM_MOVES = buildSteam();

  // player props derived from the more notable players on slate teams
  const PROP_LABELS = { PTS: 'Points', REB: 'Rebounds', AST: 'Assists', '3PM': '3-Pointers', PRA: 'Pts+Reb+Ast', PASS: 'Pass Yards', RUSH: 'Rush Yards', REC: 'Rec Yards', RECS: 'Receptions', HR: 'Home Runs', H: 'Hits', RBI: 'RBIs', TB: 'Total Bases', K: 'Strikeouts' };
  function americanPair(r) {
    const a = ri(r, -135, 115); const b = -110 - (a + 110);
    const f = v => (v > 0 ? '+' : '') + v;
    return f(a) + '/' + f(clamp(b, -160, 140));
  }
  function propsForPlayer(p) {
    const r = rngFor('props:' + p.slug);
    const st = p.stats; const out = [];
    function mk(type, line) {
      const lean = r() < 0.55 ? 'over' : 'under';
      out.push({
        player: p.name, playerSlug: p.slug, team: p.teamAbbr, teamSlug: p.teamSlug, pos: p.pos, sport: p.sport,
        type, line: +line.toFixed(1), odds: americanPair(r),
        lean, leanConf: ri(r, 58, 86), inj: p.inj !== 'ok',
        hitRate: ri(r, 3, 9) + '/10 ' + (lean === 'over' ? 'OVER' : 'UNDER')
      });
    }
    if (p.sport === 'NBA') {
      mk('PTS', st.ppg + (r() - 0.5)); mk('REB', st.rpg + (r() - 0.5)); mk('AST', st.apg + (r() - 0.5));
      mk('PRA', st.ppg + st.rpg + st.apg + (r() - 0.5)); mk('3PM', Math.max(0.5, Math.round((st.tp / 22) * 10) / 10 + 0.5));
    } else if (p.sport === 'NFL') {
      if (p.pos === 'QB') { mk('PASS', st.passYds + 0.5); }
      else if (p.pos === 'RB') { mk('RUSH', st.rushYds + 0.5); mk('RECS', st.rec + 0.5); }
      else if (p.pos === 'WR' || p.pos === 'TE') { mk('REC', st.recYds + 0.5); mk('RECS', st.rec + 0.5); }
      else { mk('TB', 1.5); }
    } else {
      if (p.pos === 'SP' || p.pos === 'RP') { mk('K', Math.max(2.5, Math.round(st.k9 / 9 * 6) + 0.5)); }
      else { mk('H', 1.5); mk('TB', 1.5); mk('HR', 0.5); mk('RBI', 0.5); }
    }
    return out;
  }
  function buildProps() {
    const slateSlugs = {};
    SLATE.forEach(g => { slateSlugs[g.homeSlug] = 1; slateSlugs[g.awaySlug] = 1; });
    const pool = ALL_PLAYERS.filter(p => slateSlugs[p.teamSlug] && p.strength > 0.45 &&
      !(p.sport === 'NFL' && (p.pos === 'LB' || p.pos === 'CB')));
    let props = [];
    pool.forEach(p => { props = props.concat(propsForPlayer(p)); });
    return props;
  }
  const PROPS = buildProps();

  /* ══════════════════════════════════════════════════════════════
     PROFILE BUILDERS (team.html / player.html)
     ══════════════════════════════════════════════════════════════ */
  function genGameLog(slug) {
    const m = META_BY_SLUG[slug], core = teamCore(slug), sport = m.sport;
    const r = rngFor('log:' + slug);
    const oppPool = ALL_TEAMS.filter(t => t.sport === sport && t.slug !== slug);
    const rows = [];
    for (let i = 0; i < 10; i++) {
      const opp = pickOne(r, oppPool);
      const home = r() < 0.5;
      let ts, os;
      if (sport === 'NBA') { ts = ri(r, 100, 129); os = ri(r, 98, 125); }
      else if (sport === 'NFL') { ts = ri(r, 10, 38); os = ri(r, 7, 35); }
      else { ts = ri(r, 0, 9); os = ri(r, 0, 8); }
      if (ts === os) ts += 1;
      const win = ts > os;
      const margin = ts - os;
      let spreadVal;
      if (sport === 'NBA') spreadVal = (ri(r, -12, 8)) ; // team spread (neg favored)
      else if (sport === 'NFL') spreadVal = (ri(r, -10, 7));
      else spreadVal = (r() < 0.5 ? -1.5 : 1.5);
      if (sport !== 'MLB' && r() < 0.5) spreadVal += 0.5 * (r() < 0.5 ? 1 : -1);
      const covered = (margin + spreadVal) > 0;
      const total = ts + os;
      const ouLine = sport === 'MLB' ? +(total + (ri(r, -2, 2))).toFixed(0) : (sport === 'NBA' ? total + ri(r, -8, 8) : total + ri(r, -6, 6));
      const overHit = total > ouLine;
      rows.push([
        DATES10[i],
        (home ? 'vs ' : '@ ') + opp.abbr,
        (win ? 'W ' : 'L ') + ts + '-' + os,
        '' + ts, '' + os,
        (covered ? '✓ ' : '✗ ') + fmtSpread(+spreadVal.toFixed(1)),
        ouLine + ' ' + (overHit ? 'O' : 'U'),
        m.abbr + ' ' + fmtSpread(+spreadVal.toFixed(1))
      ]);
    }
    return rows;
  }

  function teamProfile(slug) {
    if (CURATED_TEAMS[slug]) return CURATED_TEAMS[slug];
    const m = META_BY_SLUG[slug];
    if (!m) return null;
    const c = teamCore(slug), s = c.stats, sport = m.sport;
    const r = rngFor('profile:' + slug);

    // next game = a division-ish rival from the slate if present, else any rival
    const slateGame = SLATE.find(g => g.homeSlug === slug || g.awaySlug === slug);
    let ng;
    if (slateGame) {
      const isHome = slateGame.homeSlug === slug;
      const oppAbbr = isHome ? slateGame.away : slateGame.home;
      const sp = isHome ? slateGame.spread : -slateGame.spread;
      ng = {
        opponent: oppAbbr,
        location: (isHome ? 'vs ' : '@ ') + slateGame.venue,
        time: slateGame.time + ' ET',
        spread: m.abbr + ' ' + fmtSpread(sp),
        ml: fmtSpread(isHome ? slateGame.ml : slateGame.mlAway),
        ou: '' + slateGame.ou
      };
    } else {
      const opp = pickOne(r, ALL_TEAMS.filter(t => t.sport === sport && t.slug !== slug));
      const ln = matchupLines(m, opp);
      ng = { opponent: opp.abbr, location: 'vs ' + m.venue, time: '7:30 PM ET', spread: m.abbr + ' ' + fmtSpread(ln.spread), ml: fmtSpread(ln.mlHome), ou: '' + ln.ou };
    }

    const heroStats = sport === 'MLB'
      ? [{ val: c.w + '-' + c.l, lbl: 'Record' }, { val: c.atsPct + '%', lbl: 'ATS%' }, { val: fmtSpread(s.runDiff), lbl: 'Run Diff' }, { val: '' + s.avgTotal, lbl: 'Avg Total' }]
      : [{ val: c.w + '-' + c.l, lbl: 'Record' }, { val: c.atsPct + '%', lbl: 'ATS%' }, { val: fmtSpread(s.margin), lbl: 'Avg Margin' }, { val: '' + s.avgTotal, lbl: 'Avg Total' }];

    const records = [
      { val: c.w + '-' + c.l, lbl: 'Overall' }, { val: c.atsW + '-' + c.atsL, lbl: 'ATS' },
      { val: c.ouO + '-' + c.ouU, lbl: 'O/U' }, { val: c.homeW + '-' + c.homeL, lbl: 'Home' },
      { val: c.awayW + '-' + c.awayL, lbl: 'Away' }
    ];

    let seasonStats;
    const good = v => v ? 'var(--green)' : 'var(--red)';
    if (sport === 'NBA') seasonStats = [
      { lbl: 'Points Per Game', val: '' + s.ppg, sub: s.ppg > 115 ? 'Top 10 offense' : 'Mid-tier', color: 'var(--gold)' },
      { lbl: 'Points Allowed', val: '' + s.oppg, sub: s.oppg < 112 ? 'Top 10 defense' : 'Below avg', color: good(s.oppg < 113) },
      { lbl: 'Rebound Margin', val: fmtSpread(s.rebMargin), sub: s.rebMargin > 0 ? 'Wins the glass' : 'Out-rebounded', color: good(s.rebMargin > 0) },
      { lbl: 'Assist/TO Ratio', val: '' + s.astTo, sub: s.astTo > 1.9 ? 'Top 10 NBA' : 'Average', color: 'var(--white)' },
      { lbl: '3PT %', val: s.tpp + '%', sub: 'League context', color: 'var(--muted2)' },
      { lbl: 'Pace', val: '' + s.pace, sub: s.pace > 100 ? 'Above average' : 'Slow', color: 'var(--muted2)' }
    ];
    else if (sport === 'NFL') seasonStats = [
      { lbl: 'Points Per Game', val: '' + s.ppg, sub: s.ppg > 25 ? 'Top 10 offense' : 'Mid-tier', color: 'var(--gold)' },
      { lbl: 'Points Allowed', val: '' + s.oppg, sub: s.oppg < 21 ? 'Top 5 defense' : 'Below avg', color: good(s.oppg < 22) },
      { lbl: 'Yards Per Game', val: '' + s.ydsG, sub: s.ydsG > 360 ? 'Top 10 offense' : 'Average', color: 'var(--white)' },
      { lbl: 'Turnover Margin', val: fmtSpread(s.toMargin), sub: s.toMargin > 0 ? 'Wins the TO battle' : 'Negative', color: good(s.toMargin > 0) },
      { lbl: '3rd Down Conv%', val: s.thirdDown + '%', sub: s.thirdDown > 42 ? 'Top 10 NFL' : 'Average', color: 'var(--muted2)' },
      { lbl: 'Red Zone TD%', val: s.rzTd + '%', sub: s.rzTd > 60 ? 'Top 10 NFL' : 'Below avg', color: s.rzTd > 60 ? 'var(--gold)' : 'var(--muted2)' }
    ];
    else seasonStats = [
      { lbl: 'Runs Per Game', val: '' + s.rpg, sub: s.rpg > 5 ? 'Top 10 MLB' : 'Mid-tier', color: 'var(--gold)' },
      { lbl: 'ERA', val: '' + s.era, sub: s.era < 3.6 ? 'Top 10 MLB' : 'Below avg', color: good(s.era < 3.8) },
      { lbl: 'Batting Average', val: ('' + s.avg).replace(/^0/, ''), sub: s.avg > 0.258 ? 'Top 10 MLB' : 'Average', color: 'var(--white)' },
      { lbl: 'Home Runs', val: '' + s.hr, sub: 'Season total', color: 'var(--gold)' },
      { lbl: 'WHIP', val: '' + s.whip, sub: s.whip < 1.2 ? 'Top 10 MLB' : 'Below avg', color: good(s.whip < 1.25) },
      { lbl: 'OPS', val: ('' + s.ops).replace(/^0/, ''), sub: s.ops > 0.75 ? 'Top 10 MLB' : 'Average', color: 'var(--gold)' }
    ];

    const mkRec = (label, w, l) => ({ label, val: w + '-' + l, pct: pct(w, w + l), pos: pct(w, w + l) >= 50 });
    const betRecord = [
      mkRec('Overall ATS', c.atsW, c.atsL), mkRec('Home ATS', c.homeAtsW, c.homeAtsL),
      mkRec('Away ATS', c.awayAtsW, c.awayAtsL),
      { label: 'Favorite ATS', val: Math.round(c.atsW * 0.6) + '-' + Math.round(c.atsL * 0.55), pct: clamp(c.atsPct + ri(r, -4, 6), 25, 78), pos: true },
      { label: 'Underdog ATS', val: Math.round(c.atsW * 0.4) + '-' + Math.round(c.atsL * 0.45), pct: clamp(c.atsPct + ri(r, -6, 8), 25, 78), pos: true },
      { label: 'Over/Under', val: c.ouO + '-' + c.ouU, pct: pct(c.ouO, c.gp), pos: pct(c.ouO, c.gp) >= 50 }
    ];

    const logHeaders = sport === 'MLB'
      ? ['Date', 'Opponent', 'Result', 'R', 'RA', 'ATS', 'Total', 'Line']
      : ['Date', 'Opponent', 'Result', 'Pts', 'Opp', 'ATS', 'Total', 'Spread'];

    const roster = TEAM_ROSTER[slug].map(p => ({
      name: p.name, initials: p.initials, pos: p.pos, slug: p.slug,
      ppg: p.ppg, rpg: p.rpg, apg: p.apg, inj: p.inj
    }));

    const ats10 = c.last.slice(0, 10).filter((x, i) => rngFor('a' + slug + i)() < c.atsPct / 100 + 0.05).length;
    const trendStats = [
      { lbl: 'ATS Last 10', val: ats10 + '-' + (10 - ats10), sub: (ats10 * 10) + '% cover', color: ats10 >= 5 ? 'var(--green)' : 'var(--red)' },
      { lbl: c.streak[0] === 'W' ? 'Win Streak' : 'Loss Streak', val: c.streak, sub: 'Current', color: c.streak[0] === 'W' ? 'var(--green)' : 'var(--red)' },
      { lbl: 'Home ATS', val: c.homeAtsW + '-' + c.homeAtsL, sub: pct(c.homeAtsW, c.homeAtsW + c.homeAtsL) + '% at home', color: 'var(--gold)' },
      { lbl: 'O/U Rate', val: pct(c.ouO, c.gp) + '%', sub: 'Over rate', color: 'var(--white)' }
    ];
    const trendBars = [
      { label: 'ATS Cover Rate', val: c.atsPct, pos: c.atsPct >= 50 },
      { label: 'Over Rate', val: pct(c.ouO, c.gp), pos: pct(c.ouO, c.gp) >= 50 },
      { label: 'Home ATS Rate', val: pct(c.homeAtsW, c.homeAtsW + c.homeAtsL), pos: pct(c.homeAtsW, c.homeAtsW + c.homeAtsL) >= 50 },
      { label: 'Away ATS Rate', val: pct(c.awayAtsW, c.awayAtsW + c.awayAtsL), pos: pct(c.awayAtsW, c.awayAtsW + c.awayAtsL) >= 50 },
      { label: 'Win % as Favorite', val: clamp(Math.round(c.winPct * 100) + ri(r, -3, 8), 20, 90), pos: true },
      { label: 'Cover vs .500+ Teams', val: clamp(c.atsPct + ri(r, -10, 6), 25, 75), pos: c.atsPct >= 50 }
    ];
    const sit = (label) => {
      const p = clamp(c.atsPct + ri(r, -18, 18), 18, 82);
      const tr = p >= 60 ? '↑ Strong' : p <= 42 ? '↓ Fade' : '→ Neutral';
      const w = Math.round((p / 100) * 11), l = 11 - w;
      return [label, w + '-' + l, p + '%', tr];
    };
    const situational = ['As Home Favorite', 'As Away Favorite', 'As Underdog', 'After a Win', 'After a Loss', 'Vs .500+ Teams', 'In Division', sport === 'NBA' ? '2nd Night of B2B' : sport === 'NFL' ? 'In Primetime' : 'Day Games'].map(sit);

    return {
      name: m.name, abbr: m.abbr, logoUrl: '', sport, conf: m.conf,
      heroStats, records, seasonStats, nextGame: ng, betRecord,
      logHeaders, gameLog: genGameLog(slug), roster, trendStats, trendBars, situational
    };
  }

  function playerProfile(slug) {
    if (CURATED_PLAYERS[slug]) return CURATED_PLAYERS[slug];
    const p = PLAYER_BY_SLUG[slug];
    if (!p) return null;
    const st = p.stats, sport = p.sport, pos = p.pos;
    const r = rngFor('pprofile:' + slug);
    const injMap = {
      out: { status: 'out', note: p.injNote, detail: `Listed as OUT (${p.injNote}). Expected to miss time; monitor before lock.`, impact: `Line impact: ${p.teamAbbr} number expected to move with ${p.name} sidelined. Fade exposure on team total.` },
      questionable: { status: 'questionable', note: p.injNote, detail: `Limited in practice (${p.injNote}). Game-time decision.`, impact: `If OUT, expect the ${p.teamAbbr} spread and ${p.name} props to shift. Sharp action likely.` },
      probable: { status: 'probable', note: p.injNote, detail: `Probable (${p.injNote}). Expected to play.`, impact: 'Minimal line impact expected. Props hold.' },
      ok: { status: 'probable', note: 'None', detail: 'Fully healthy. Expected to play full role.', impact: 'No line impact from injury.' }
    };
    const injury = injMap[p.inj] || injMap.ok;

    let heroStats, seasonStats, radar, logHeaders, gameLog, props;
    const good = v => v ? 'var(--green)' : 'var(--white)';

    if (sport === 'NBA') {
      heroStats = [{ val: '' + st.ppg, lbl: 'PPG' }, { val: '' + st.rpg, lbl: 'RPG' }, { val: '' + st.apg, lbl: 'APG' }, { val: st.fg + '%', lbl: 'FG%' }];
      seasonStats = [
        { lbl: 'Points Per Game', val: '' + st.ppg, sub: st.ppg > 22 ? 'Star scorer' : 'Role contributor', color: 'var(--gold)' },
        { lbl: 'Rebounds Per Game', val: '' + st.rpg, sub: 'Season avg', color: 'var(--white)' },
        { lbl: 'Assists Per Game', val: '' + st.apg, sub: 'Season avg', color: 'var(--green)' },
        { lbl: 'FG %', val: st.fg + '%', sub: 'Field goal', color: 'var(--white)' },
        { lbl: '3PT %', val: st.tp + '%', sub: 'From deep', color: 'var(--green)' },
        { lbl: 'PER', val: '' + st.per, sub: st.per > 20 ? 'All-Star level' : 'Solid', color: 'var(--gold)' }
      ];
      radar = [
        { label: 'Scoring', val: Math.round(40 + st.ppg * 2) }, { label: 'Playmaking', val: Math.round(40 + st.apg * 5) },
        { label: 'Rebounding', val: Math.round(40 + st.rpg * 3.5) }, { label: 'Efficiency', val: st.ts },
        { label: 'Volume', val: Math.round(st.mpg * 2.4) }, { label: 'Clutch', val: ri(r, 55, 95) }
      ].map(x => ({ label: x.label, val: clamp(x.val, 30, 99) }));
      logHeaders = ['Date', 'Matchup', 'Result', 'PTS', 'REB', 'AST', 'FG%', 'MIN'];
      gameLog = DATES10.map((d, i) => {
        const opp = pickOne(r, ALL_TEAMS.filter(t => t.sport === 'NBA' && t.slug !== p.teamSlug));
        const win = r() < 0.5; const ts = ri(r, 100, 128), os = ri(r, 98, 124);
        return [d, (r() < 0.5 ? 'vs ' : '@ ') + opp.abbr, (win ? 'W ' : 'L ') + ts + '-' + os,
          '' + Math.max(0, Math.round(st.ppg + (r() - 0.5) * 14)), '' + Math.max(0, Math.round(st.rpg + (r() - 0.5) * 7)),
          '' + Math.max(0, Math.round(st.apg + (r() - 0.5) * 6)), Math.round(st.fg + (r() - 0.5) * 22) + '%', '' + ri(r, 28, 40)];
      });
      props = [
        { name: 'Points', line: +(st.ppg + 0.5).toFixed(1) }, { name: 'Rebounds', line: +(st.rpg + 0.5).toFixed(1) },
        { name: 'Assists', line: +(st.apg + 0.5).toFixed(1) }, { name: 'Pts+Reb+Ast', line: +(st.ppg + st.rpg + st.apg + 0.5).toFixed(1) },
        { name: '3-Pointers', line: Math.max(0.5, Math.round(st.tp / 22) + 0.5) }
      ];
    } else if (sport === 'NFL') {
      if (pos === 'QB') {
        heroStats = [{ val: '' + st.passYds, lbl: 'Pass Yds' }, { val: '' + st.tdg, lbl: 'TD/G' }, { val: '' + st.qbr, lbl: 'QBR' }, { val: st.comp + '%', lbl: 'Comp%' }];
        seasonStats = [
          { lbl: 'Pass Yards/Game', val: '' + st.passYds, sub: st.passYds > 270 ? 'Top 10 NFL' : 'Game manager', color: 'var(--gold)' },
          { lbl: 'TD / Game', val: '' + st.tdg, sub: 'Season avg', color: 'var(--green)' },
          { lbl: 'QBR', val: '' + st.qbr, sub: st.qbr > 100 ? 'Elite' : 'Solid', color: 'var(--gold)' },
          { lbl: 'Completion %', val: st.comp + '%', sub: 'Accuracy', color: 'var(--white)' },
          { lbl: 'INT Rate', val: st.intRate + '%', sub: 'Ball security', color: 'var(--green)' },
          { lbl: 'Passer Rating', val: '' + st.rating, sub: 'Season', color: 'var(--gold)' }
        ];
        radar = [{ label: 'Arm Strength', val: ri(r, 70, 96) }, { label: 'Accuracy', val: clamp(st.comp + 20, 50, 99) }, { label: 'Decision', val: clamp(Math.round(st.qbr), 50, 99) }, { label: 'Mobility', val: ri(r, 55, 92) }, { label: 'Pocket', val: ri(r, 55, 95) }, { label: 'Clutch', val: ri(r, 55, 97) }];
        logHeaders = ['Date', 'Opponent', 'Result', 'Pass Yds', 'TDs', 'INTs', 'QBR', 'Rating'];
        gameLog = DATES10.map((d, i) => { const opp = pickOne(r, ALL_TEAMS.filter(t => t.sport === 'NFL' && t.slug !== p.teamSlug)); const win = r() < 0.5; const ts = ri(r, 13, 38), os = ri(r, 10, 34); return [d, (r() < 0.5 ? 'vs ' : '@ ') + opp.abbr, (win ? 'W ' : 'L ') + ts + '-' + os, '' + Math.max(80, Math.round(st.passYds + (r() - 0.5) * 120)), '' + ri(r, 0, 4), '' + ri(r, 0, 2), '' + +(st.qbr + (r() - 0.5) * 30).toFixed(1), '' + +(st.rating + (r() - 0.5) * 28).toFixed(1)]; });
        props = [{ name: 'Pass Yards', line: st.passYds + 0.5 }, { name: 'Touchdowns', line: 1.5 }, { name: 'Completions', line: Math.round(st.passYds / 11) + 0.5 }, { name: 'Pass Attempts', line: Math.round(st.passYds / 7) + 0.5 }, { name: 'Interceptions', line: 0.5 }];
      } else if (pos === 'RB') {
        heroStats = [{ val: '' + st.rushYds, lbl: 'Rush Yds' }, { val: '' + st.ypc, lbl: 'YPC' }, { val: '' + st.carries, lbl: 'Carries' }, { val: '' + st.tds, lbl: 'TD/G' }];
        seasonStats = [{ lbl: 'Rush Yards/Game', val: '' + st.rushYds, sub: st.rushYds > 80 ? 'Workhorse' : 'Committee', color: 'var(--gold)' }, { lbl: 'Yards/Carry', val: '' + st.ypc, sub: 'Efficiency', color: 'var(--white)' }, { lbl: 'Carries/Game', val: '' + st.carries, sub: 'Volume', color: 'var(--white)' }, { lbl: 'Receptions/G', val: '' + st.rec, sub: 'Receiving role', color: 'var(--green)' }, { lbl: 'TD/Game', val: '' + st.tds, sub: 'Scoring', color: 'var(--gold)' }, { lbl: 'Touches/G', val: '' + Math.round(st.carries + st.rec), sub: 'Total usage', color: 'var(--white)' }];
        radar = [{ label: 'Speed', val: ri(r, 60, 96) }, { label: 'Power', val: ri(r, 55, 95) }, { label: 'Vision', val: ri(r, 55, 94) }, { label: 'Hands', val: ri(r, 45, 92) }, { label: 'Volume', val: clamp(st.carries * 4, 30, 99) }, { label: 'Explosiveness', val: clamp(Math.round(st.ypc * 16), 40, 99) }];
        logHeaders = ['Date', 'Opponent', 'Result', 'Rush Yds', 'Car', 'YPC', 'Rec', 'TD'];
        gameLog = DATES10.map((d) => { const opp = pickOne(r, ALL_TEAMS.filter(t => t.sport === 'NFL' && t.slug !== p.teamSlug)); const win = r() < 0.5; const ts = ri(r, 13, 38), os = ri(r, 10, 34); const car = ri(r, 8, 24); return [d, (r() < 0.5 ? 'vs ' : '@ ') + opp.abbr, (win ? 'W ' : 'L ') + ts + '-' + os, '' + Math.max(5, Math.round(st.rushYds + (r() - 0.5) * 70)), '' + car, '' + +(st.ypc + (r() - 0.5) * 2).toFixed(1), '' + ri(r, 0, 5), '' + ri(r, 0, 2)]; });
        props = [{ name: 'Rush Yards', line: st.rushYds + 0.5 }, { name: 'Rush Attempts', line: st.carries + 0.5 }, { name: 'Receptions', line: st.rec + 0.5 }, { name: 'Rush+Rec Yds', line: st.rushYds + 18.5 }, { name: 'Anytime TD', line: 0.5 }];
      } else if (pos === 'WR' || pos === 'TE') {
        heroStats = [{ val: '' + st.recYds, lbl: 'Rec Yds' }, { val: '' + st.rec, lbl: 'Rec/G' }, { val: '' + st.tgts, lbl: 'Tgt/G' }, { val: '' + st.tds, lbl: 'TD/G' }];
        seasonStats = [{ lbl: 'Rec Yards/Game', val: '' + st.recYds, sub: st.recYds > 70 ? 'WR1 usage' : 'Rotational', color: 'var(--gold)' }, { lbl: 'Receptions/G', val: '' + st.rec, sub: 'Volume', color: 'var(--white)' }, { lbl: 'Targets/G', val: '' + st.tgts, sub: 'Opportunity', color: 'var(--green)' }, { lbl: 'TD/Game', val: '' + st.tds, sub: 'Scoring', color: 'var(--gold)' }, { lbl: 'Yards/Rec', val: '' + (st.rec > 0 ? +(st.recYds / st.rec).toFixed(1) : 0), sub: 'ADOT', color: 'var(--white)' }, { lbl: 'Catch Rate', val: ri(r, 58, 78) + '%', sub: 'Reliability', color: 'var(--white)' }];
        radar = [{ label: 'Speed', val: ri(r, 60, 97) }, { label: 'Hands', val: ri(r, 55, 96) }, { label: 'Route', val: ri(r, 55, 95) }, { label: 'YAC', val: ri(r, 50, 94) }, { label: 'Volume', val: clamp(Math.round(st.tgts * 9), 30, 99) }, { label: 'Red Zone', val: ri(r, 45, 95) }];
        logHeaders = ['Date', 'Opponent', 'Result', 'Rec Yds', 'Rec', 'Tgt', 'TD', 'Long'];
        gameLog = DATES10.map((d) => { const opp = pickOne(r, ALL_TEAMS.filter(t => t.sport === 'NFL' && t.slug !== p.teamSlug)); const win = r() < 0.5; const ts = ri(r, 13, 38), os = ri(r, 10, 34); return [d, (r() < 0.5 ? 'vs ' : '@ ') + opp.abbr, (win ? 'W ' : 'L ') + ts + '-' + os, '' + Math.max(0, Math.round(st.recYds + (r() - 0.5) * 70)), '' + ri(r, 1, 9), '' + ri(r, 2, 12), '' + ri(r, 0, 2), ri(r, 9, 58) + 'y']; });
        props = [{ name: 'Receiving Yards', line: st.recYds + 0.5 }, { name: 'Receptions', line: st.rec + 0.5 }, { name: 'Longest Reception', line: 18.5 }, { name: 'Anytime TD', line: 0.5 }];
      } else {
        heroStats = [{ val: '' + st.tkl, lbl: 'Tkl/G' }, { val: '' + st.sks, lbl: 'Sacks/G' }, { val: '' + st.ints, lbl: 'INT/G' }, { val: '' + ri(r, 1, 9), lbl: 'PD' }];
        seasonStats = [{ lbl: 'Tackles/Game', val: '' + st.tkl, sub: 'Run defense', color: 'var(--gold)' }, { lbl: 'Sacks/Game', val: '' + st.sks, sub: 'Pass rush', color: 'var(--green)' }, { lbl: 'INT/Game', val: '' + st.ints, sub: 'Ball skills', color: 'var(--white)' }, { lbl: 'Pass Defended', val: '' + ri(r, 2, 12), sub: 'Coverage', color: 'var(--white)' }, { lbl: 'Forced Fumbles', val: '' + ri(r, 0, 4), sub: 'Splash plays', color: 'var(--gold)' }, { lbl: 'Snap %', val: ri(r, 60, 98) + '%', sub: 'Workload', color: 'var(--white)' }];
        radar = [{ label: 'Tackling', val: ri(r, 60, 95) }, { label: 'Coverage', val: ri(r, 50, 95) }, { label: 'Pass Rush', val: ri(r, 50, 95) }, { label: 'Speed', val: ri(r, 60, 96) }, { label: 'Instincts', val: ri(r, 55, 95) }, { label: 'Durability', val: ri(r, 55, 95) }];
        logHeaders = ['Date', 'Opponent', 'Result', 'Tkl', 'Sk', 'INT', 'PD', 'FF'];
        gameLog = DATES10.map((d) => { const opp = pickOne(r, ALL_TEAMS.filter(t => t.sport === 'NFL' && t.slug !== p.teamSlug)); const win = r() < 0.5; const ts = ri(r, 13, 38), os = ri(r, 10, 34); return [d, (r() < 0.5 ? 'vs ' : '@ ') + opp.abbr, (win ? 'W ' : 'L ') + ts + '-' + os, '' + ri(r, 2, 12), '' + ri(r, 0, 2), '' + ri(r, 0, 1), '' + ri(r, 0, 3), '' + ri(r, 0, 1)]; });
        props = [{ name: 'Tackles + Assists', line: st.tkl + 0.5 }, { name: 'Solo Tackles', line: Math.round(st.tkl * 0.7) + 0.5 }, { name: 'Sacks', line: 0.5 }];
      }
    } else { // MLB
      if (pos === 'SP' || pos === 'RP') {
        heroStats = [{ val: '' + st.era, lbl: 'ERA' }, { val: '' + st.k9, lbl: 'K/9' }, { val: '' + st.whip, lbl: 'WHIP' }, { val: st.w + '-' + st.l, lbl: 'W-L' }];
        seasonStats = [{ lbl: 'ERA', val: '' + st.era, sub: st.era < 3.6 ? 'Ace-level' : 'Mid-rotation', color: st.era < 3.6 ? 'var(--green)' : 'var(--white)' }, { lbl: 'K per 9', val: '' + st.k9, sub: 'Swing & miss', color: 'var(--gold)' }, { lbl: 'WHIP', val: '' + st.whip, sub: st.whip < 1.2 ? 'Elite control' : 'Average', color: st.whip < 1.2 ? 'var(--green)' : 'var(--white)' }, { lbl: 'Record', val: st.w + '-' + st.l, sub: 'Decisions', color: 'var(--white)' }, { lbl: 'Innings', val: '' + st.ip, sub: 'Workload', color: 'var(--white)' }, { lbl: 'K Total', val: '' + Math.round(st.ip * st.k9 / 9), sub: 'Season', color: 'var(--gold)' }];
        radar = [{ label: 'Velocity', val: ri(r, 60, 97) }, { label: 'Command', val: clamp(Math.round((1.5 - st.whip) * 160), 40, 99) }, { label: 'Stuff', val: clamp(Math.round(st.k9 * 8), 40, 99) }, { label: 'Stamina', val: ri(r, 55, 95) }, { label: 'Poise', val: ri(r, 55, 95) }, { label: 'Durability', val: ri(r, 50, 95) }];
        logHeaders = ['Date', 'Opponent', 'Result', 'IP', 'K', 'ER', 'H', 'ERA'];
        gameLog = DATES10.map((d) => { const opp = pickOne(r, ALL_TEAMS.filter(t => t.sport === 'MLB' && t.slug !== p.teamSlug)); const win = r() < 0.5; return [d, (r() < 0.5 ? 'vs ' : '@ ') + opp.abbr, (win ? 'W' : 'L'), ri(r, 4, 7) + '.0', '' + ri(r, 3, 11), '' + ri(r, 0, 5), '' + ri(r, 2, 9), '' + +(st.era + (r() - 0.5) * 2).toFixed(2)]; });
        props = [{ name: 'Strikeouts', line: Math.max(2.5, Math.round(st.k9 / 9 * 6) + 0.5) }, { name: 'Outs Recorded', line: 17.5 }, { name: 'Earned Runs', line: 2.5 }, { name: 'Hits Allowed', line: 5.5 }];
      } else {
        heroStats = [{ val: ('' + st.avg).replace(/^0/, ''), lbl: 'AVG' }, { val: '' + st.hr, lbl: 'HR' }, { val: '' + st.rbi, lbl: 'RBI' }, { val: ('' + st.ops).replace(/^0/, ''), lbl: 'OPS' }];
        seasonStats = [{ lbl: 'Batting Average', val: ('' + st.avg).replace(/^0/, ''), sub: st.avg > 0.27 ? 'Top hitter' : 'Average', color: 'var(--gold)' }, { lbl: 'Home Runs', val: '' + st.hr, sub: 'Season total', color: 'var(--gold)' }, { lbl: 'RBI', val: '' + st.rbi, sub: 'Run production', color: 'var(--green)' }, { lbl: 'OPS', val: ('' + st.ops).replace(/^0/, ''), sub: st.ops > 0.8 ? 'Elite' : 'Solid', color: 'var(--white)' }, { lbl: 'Stolen Bases', val: '' + st.sb, sub: 'Speed', color: 'var(--white)' }, { lbl: 'Runs', val: '' + st.runs, sub: 'Scored', color: 'var(--white)' }];
        radar = [{ label: 'Contact', val: clamp(Math.round(st.avg * 320), 40, 99) }, { label: 'Power', val: clamp(st.hr * 2 + 30, 30, 99) }, { label: 'Discipline', val: ri(r, 50, 95) }, { label: 'Speed', val: clamp(st.sb * 3 + 30, 30, 99) }, { label: 'Defense', val: ri(r, 50, 95) }, { label: 'Clutch', val: ri(r, 50, 95) }];
        logHeaders = ['Date', 'Opponent', 'Result', 'AB', 'H', 'HR', 'RBI', 'AVG'];
        gameLog = DATES10.map((d) => { const opp = pickOne(r, ALL_TEAMS.filter(t => t.sport === 'MLB' && t.slug !== p.teamSlug)); const win = r() < 0.5; const ab = ri(r, 3, 5), h = ri(r, 0, ab); return [d, (r() < 0.5 ? 'vs ' : '@ ') + opp.abbr, (win ? 'W ' : 'L ') + ri(r, 1, 9) + '-' + ri(r, 0, 8), '' + ab, '' + h, '' + ri(r, 0, 2), '' + ri(r, 0, 4), ('' + +(h / ab).toFixed(3)).replace(/^0/, '')]; });
        props = [{ name: 'Hits', line: 1.5 }, { name: 'Total Bases', line: 1.5 }, { name: 'Home Run', line: 0.5 }, { name: 'RBIs', line: 0.5 }, { name: 'Runs + RBIs', line: 1.5 }];
      }
    }

    // attach over/under/conf/odds/hitrate to each prop deterministically
    props = props.map((pr, i) => {
      const pr2 = rngFor('pp:' + slug + ':' + i);
      const lean = pr2() < 0.55 ? 'over' : 'under';
      return Object.assign(pr, {
        lean, conf: ri(pr2, 56, 88), odds: americanPair(pr2),
        hitRate: ri(pr2, 3, 9) + '/10 ' + (lean === 'over' ? 'OVER' : 'UNDER')
      });
    });

    const trendStats = [
      { lbl: 'L10 Form', val: ri(r, 4, 8) + '/10', sub: 'Props hit', color: 'var(--gold)' },
      { lbl: 'Over Rate', val: ri(r, 40, 80) + '%', sub: 'Primary prop', color: 'var(--green)' },
      { lbl: 'Status', val: injury.status === 'out' ? 'OUT' : injury.status === 'questionable' ? 'Q' : 'Active', sub: injury.note, color: injury.status === 'out' ? 'var(--red)' : injury.status === 'questionable' ? '#F59E0B' : 'var(--green)' },
      { lbl: 'Usage', val: ri(r, 55, 92) + '%', sub: 'Role share', color: 'var(--white)' }
    ];
    const trendBars = props.slice(0, 5).map(pr => ({ label: pr.name + ' OVER', val: parseInt(pr.hitRate) * 10, pos: parseInt(pr.hitRate) >= 5 }))
      .concat([{ label: 'Team Win Rate', val: clamp(Math.round(teamCore(p.teamSlug).winPct * 100), 20, 90), pos: teamCore(p.teamSlug).winPct >= 0.5 }]);

    return {
      name: p.name, initials: p.initials, photoUrl: '', team: p.teamName, teamSlug: p.teamSlug,
      pos, sport, injury, heroStats, seasonStats, radar, logHeaders, gameLog, props, trendStats, trendBars
    };
  }

  /* ══════════════════════════════════════════════════════════════
     PUBLIC API
     ══════════════════════════════════════════════════════════════ */
  window.OG = {
    // raw collections
    teams: TEAM_SUMMARIES,
    players: ALL_PLAYERS,
    games: SLATE,
    injuries: INJURIES,
    lineMoves: LINE_MOVES,
    steamMoves: STEAM_MOVES,
    props: PROPS,
    propLabels: PROP_LABELS,
    // lookups
    teamsBySport: function (sport) { return sport && sport !== 'ALL' ? TEAM_SUMMARIES.filter(t => t.sport === sport) : TEAM_SUMMARIES; },
    rosterOf: function (slug) { return TEAM_ROSTER[slug] || []; },
    teamMeta: function (slug) { return META_BY_SLUG[slug] || null; },
    teamCore,
    // profile builders (used by team.html / player.html)
    teamProfile,
    playerProfile,
    explainerFor,
    // utils
    slugify, badgeClass, fmtSpread,
    hasCuratedTeam: function (slug) { return !!CURATED_TEAMS[slug]; },
    hasCuratedPlayer: function (slug) { return !!CURATED_PLAYERS[slug]; }
  };
})();
