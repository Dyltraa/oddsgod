// ── OddsGod Shared Utilities ──

// Toast notification system
function showToast(type, icon, title, body) {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = `toast t-${type}`;
  el.innerHTML = `<div class="toast-icon">${icon}</div><div><div class="toast-title">${title}</div><div class="toast-body">${body}</div></div>`;
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 4500);
}

// Count-up animation
function countUp(id, target, suffix, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  let v = 0, step = target / (duration / 16);
  const t = setInterval(() => {
    v += step;
    if (v >= target) { v = target; clearInterval(t); }
    el.textContent = Math.floor(v) + suffix;
  }, 16);
}

// Scroll reveal observer
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => obs.observe(el));
}

// Math helpers
function jitter(v, mag) { return +(v + (Math.random() - 0.5) * mag).toFixed(1); }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function fmtSpread(v) { return (v > 0 ? '+' : '') + v; }
function fmtML(v) { return (v > 0 ? '+' : '') + v; }
function arrow(d) { return d > 0 ? ' ↑' : d < 0 ? ' ↓' : ''; }
function dirCls(d) { return d > 0 ? ' up' : d < 0 ? ' dn' : ''; }
function badgeClass(s) { return s === 'NBA' ? 'b-nba' : s === 'NFL' ? 'b-nfl' : 'b-mlb'; }

// Flash row animation
function flashRow(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

// Payout calculator (American odds)
function calcPayout(odds, stake) {
  const o = parseFloat(odds), s = parseFloat(stake);
  if (isNaN(o) || isNaN(s)) return 0;
  return o > 0 ? +(s * o / 100).toFixed(2) : +(s * 100 / Math.abs(o)).toFixed(2);
}

// Live clock
function startClock(id) {
  function tick() {
    const el = document.getElementById(id);
    if (!el) return;
    const n = new Date();
    let h = n.getHours(), m = n.getMinutes(), s = n.getSeconds();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    el.textContent = `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ap}`;
  }
  tick();
  setInterval(tick, 1000);
}

// Particle canvas background
function initParticles(canvasId, count = 90) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dots = [];
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  function r(a, b) { return Math.random() * (b - a) + a; }
  class Dot {
    constructor() { this.reset(); }
    reset() { this.x=r(0,W); this.y=r(0,H); this.vx=r(-0.15,0.15); this.vy=r(-0.15,0.15); this.rad=r(0.5,1.6); this.a=r(0.1,0.45); }
    update() { this.x+=this.vx; this.y+=this.vy; if(this.x<0||this.x>W||this.y<0||this.y>H) this.reset(); }
    draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.rad,0,Math.PI*2); ctx.fillStyle=`rgba(201,168,76,${this.a})`; ctx.fill(); }
  }
  for (let i = 0; i < count; i++) dots.push(new Dot());
  function drawLines() {
    for (let i = 0; i < dots.length; i++) {
      for (let j = i+1; j < dots.length; j++) {
        const dx=dots[i].x-dots[j].x, dy=dots[i].y-dots[j].y, dist=Math.sqrt(dx*dx+dy*dy);
        if (dist < 100) { ctx.beginPath(); ctx.moveTo(dots[i].x,dots[i].y); ctx.lineTo(dots[j].x,dots[j].y); ctx.strokeStyle=`rgba(201,168,76,${0.07*(1-dist/100)})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }
    }
  }
  function loop() { ctx.clearRect(0,0,W,H); dots.forEach(d=>{d.update();d.draw();}); drawLines(); requestAnimationFrame(loop); }
  loop();
}
