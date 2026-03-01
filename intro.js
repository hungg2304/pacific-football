(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.id = 'intro-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#1a1a1a;display:flex;align-items:center;justify-content:center;overflow:hidden;';

  const canvas = document.createElement('canvas');
  canvas.id = 'intro-canvas';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

  const logoEl = document.createElement('div');
  logoEl.id = 'intro-logo';
  logoEl.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z"/>
      <path d="M9 22V13h6v9"/>
    </svg>
    <span>PACIFIC SPORTS</span>
  `;
  logoEl.style.cssText = 'position:absolute;display:flex;align-items:center;gap:10px;color:white;opacity:0;transform:scale(0.85);transition:opacity 0.7s ease,transform 0.7s ease;font-family:"DM Sans",sans-serif;font-size:13px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;';

  const skipBtn = document.createElement('button');
  skipBtn.textContent = 'SKIP →';
  skipBtn.style.cssText = 'position:absolute;bottom:24px;right:24px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:white;font-size:10px;font-family:"DM Sans",sans-serif;letter-spacing:0.2em;padding:7px 14px;cursor:pointer;opacity:0;transition:opacity 0.4s;text-transform:uppercase;';
  skipBtn.addEventListener('click', finish);

  overlay.appendChild(canvas);
  overlay.appendChild(logoEl);
  overlay.appendChild(skipBtn);
  document.body.appendChild(overlay);

  const ctx = canvas.getContext('2d');
  let W, H, cx, cy;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2; cy = H / 2;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particles
  const COUNT = window.innerWidth < 640 ? 70 : 140;
  const COLORS = ['#C41E3A', '#FF6B35', '#FFD700', '#0088FF', '#FF4500', '#FFAA00', '#FF69B4', '#FFFFFF'];
  const particles = [];

  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2;
    const r = 80 + Math.random() * Math.min(W, H) * 0.28;
    particles.push({
      x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r,
      angle, radius: r,
      spinSpeed: 0.012 + Math.random() * 0.022,
      burstAngle: Math.random() * Math.PI * 2,
      burstSpeed: 4 + Math.random() * 14,
      burstRadius: 0,
      size: 1.5 + Math.random() * 3.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: 'vortex',
    });
  }

  // Ring particles (decorative outer ring)
  const rings = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    rings.push({ angle, r: Math.min(W, H) * 0.38, speed: 0.008 + Math.random() * 0.01, size: 1 + Math.random() * 2, color: COLORS[i % COLORS.length] });
  }

  const T_VORTEX = 650;
  const T_BURST = 1400;
  const T_LOGO = 1500;
  const T_FADEOUT = 2100;
  const T_DONE = 2600;

  let startTime = null;

  function loop(ts) {
    if (!startTime) startTime = ts;
    const t = ts - startTime;

    draw(t);

    if (t >= T_LOGO && logoEl.style.opacity === '0') {
      logoEl.style.opacity = '1';
      logoEl.style.transform = 'scale(1)';
    }
    if (t > 900 && skipBtn.style.opacity === '0') {
      skipBtn.style.opacity = '0.7';
    }

    if (t < T_DONE) requestAnimationFrame(loop);
    else finish();
  }

  function draw(t) {
    // Background trail / fade
    if (t < T_BURST) {
      ctx.fillStyle = t < T_VORTEX ? 'rgba(20,18,26,0.18)' : 'rgba(20,18,26,0.1)';
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.clearRect(0, 0, W, H);
      const fAlpha = t < T_FADEOUT ? 0.92 : Math.max(0, 0.92 - (t - T_FADEOUT) / (T_DONE - T_FADEOUT) * 0.92);
      ctx.fillStyle = `rgba(20,18,26,${fAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Outer ring
    for (const r of rings) {
      r.angle += r.speed;
      const rx = cx + Math.cos(r.angle) * r.r;
      const ry = cy + Math.sin(r.angle) * r.r;
      const alpha = t > T_FADEOUT ? Math.max(0, 1 - (t - T_FADEOUT) / (T_DONE - T_FADEOUT)) : 0.4;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = r.color;
      ctx.beginPath();
      ctx.arc(rx, ry, r.size, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    // Main particles
    for (const p of particles) {
      if (t < T_VORTEX) {
        p.angle += p.spinSpeed;
        p.radius = Math.max(2, p.radius - (p.radius * 0.018));
        p.x = cx + Math.cos(p.angle) * p.radius;
        p.y = cy + Math.sin(p.angle) * p.radius;
      } else if (t < T_BURST) {
        if (p.phase === 'vortex') { p.phase = 'burst'; p.burstRadius = p.radius; }
        p.burstRadius += p.burstSpeed;
        p.x = cx + Math.cos(p.burstAngle) * p.burstRadius;
        p.y = cy + Math.sin(p.burstAngle) * p.burstRadius;
      }
      const alpha = t > T_FADEOUT ? Math.max(0, 1 - (t - T_FADEOUT) / (T_DONE - T_FADEOUT)) : 0.9;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 10; ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    // Central vortex glow (stage 1)
    if (t < T_VORTEX + 200) {
      const ga = Math.min(1, t / 300) * (t < T_VORTEX ? 1 : 1 - (t - T_VORTEX) / 200) * 0.7;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 130);
      g.addColorStop(0, `rgba(255,120,50,${ga})`);
      g.addColorStop(0.35, `rgba(196,30,58,${ga * 0.55})`);
      g.addColorStop(0.7, `rgba(0,100,255,${ga * 0.2})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    // Burst flash
    if (t >= T_VORTEX && t < T_VORTEX + 350) {
      const fa = (1 - (t - T_VORTEX) / 350) * 0.55;
      ctx.fillStyle = `rgba(255,180,60,${fa})`; ctx.fillRect(0, 0, W, H);
    }

    // Shockwave rings at burst
    if (t >= T_VORTEX && t < T_BURST) {
      const bt = t - T_VORTEX;
      for (let i = 0; i < 3; i++) {
        const delay = i * 150;
        if (bt > delay) {
          const rProgress = Math.min(1, (bt - delay) / 500);
          const radius = rProgress * Math.min(W, H) * 0.5;
          const alpha = (1 - rProgress) * 0.5;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = i === 0 ? '#FFD700' : i === 1 ? '#FF6B35' : '#0088FF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  function finish() {
    const el = document.getElementById('intro-overlay');
    if (!el) return;
    el.style.transition = 'opacity 0.5s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }

  requestAnimationFrame(loop);
})();
