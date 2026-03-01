(function () {
  // Only show once per browser session
  if (sessionStorage.getItem('pacific-intro')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  sessionStorage.setItem('pacific-intro', '1');

  /* ── Syncopate font (for the brutalist title text) ─────────────── */
  var fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&display=swap';
  document.head.appendChild(fontLink);

  /* ── Inject styles ─────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '#pac-intro{position:fixed;inset:0;z-index:99999;background:#0a0a0a;color:#e0e0e0;',
    "font-family:'Syncopate',sans-serif;overflow:hidden;display:flex;",
    'align-items:center;justify-content:center;}',

    '#pac-grain{position:absolute;top:0;left:0;width:100%;height:100%;',
    'pointer-events:none;z-index:100;opacity:0.15;filter:url(#pac-grain-f);}',

    '#pac-viewport{perspective:2000px;position:absolute;inset:0;',
    'display:flex;align-items:center;justify-content:center;overflow:hidden;}',

    '#pac-canvas{position:relative;width:min(800px,90vw);height:min(500px,62vh);',
    'transform-style:preserve-3d;will-change:transform;}',

    '.pac-layer{position:absolute;inset:0;border:1px solid rgba(224,224,224,0.1);',
    'background-size:cover;background-position:center;will-change:transform;}',

    '#pac-contours{position:absolute;width:200%;height:200%;top:-50%;left:-50%;',
    'background-image:repeating-radial-gradient(circle at 50% 50%,',
    'transparent 0,transparent 40px,rgba(255,255,255,0.05) 41px,transparent 42px);',
    'transform:translateZ(120px);pointer-events:none;}',

    '#pac-ui{position:absolute;inset:0;',
    'padding:clamp(1.2rem,3.5vw,3.5rem);',
    'display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr auto;',
    'z-index:10;pointer-events:none;}',

    '#pac-title{grid-column:1/-1;align-self:center;',
    'font-size:clamp(2.8rem,9vw,9.5rem);line-height:0.85;',
    'letter-spacing:-0.04em;mix-blend-mode:difference;font-weight:700;',
    'opacity:0;transition:opacity 1.2s ease 1.8s;}',

    '#pac-enter{pointer-events:auto;background:#e0e0e0;color:#0a0a0a;',
    "padding:0.85rem 1.8rem;border:none;cursor:pointer;",
    "font-family:'Syncopate',sans-serif;font-size:0.65rem;font-weight:700;",
    'letter-spacing:0.12em;text-transform:uppercase;',
    'clip-path:polygon(0 0,100% 0,100% 68%,88% 100%,0 100%);',
    'opacity:0;transition:opacity 0.5s,background 0.3s,transform 0.3s;}',

    '#pac-enter:hover{background:#ff3c00;transform:translateY(-4px);}',

    '#pac-scroll{position:absolute;bottom:2rem;left:50%;',
    'width:1px;height:55px;',
    'background:linear-gradient(to bottom,#e0e0e0,transparent);',
    'animation:pac-flow 2s infinite ease-in-out;}',

    '@keyframes pac-flow{',
    '0%,100%{transform:scaleY(0);transform-origin:top;}',
    '50%{transform:scaleY(1);transform-origin:top;}',
    '51%{transform:scaleY(1);transform-origin:bottom;}}',
  ].join('');
  document.head.appendChild(style);

  /* ── Build DOM ─────────────────────────────────────────────────── */
  var overlay = document.createElement('div');
  overlay.id = 'pac-intro';

  overlay.innerHTML =
    // SVG grain filter
    '<svg style="position:absolute;width:0;height:0">' +
    '<filter id="pac-grain-f">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3"/>' +
    '<feColorMatrix type="saturate" values="0"/>' +
    '</filter></svg>' +

    // Grain overlay
    '<div id="pac-grain"></div>' +

    // 3D viewport
    '<div id="pac-viewport">' +
    '<div id="pac-canvas">' +
    '<div class="pac-layer" id="pac-l1"></div>' +
    '<div class="pac-layer" id="pac-l2"></div>' +
    '<div class="pac-layer" id="pac-l3"></div>' +
    '<div id="pac-contours"></div>' +
    '</div></div>' +

    // Interface overlay
    '<div id="pac-ui">' +
    '<div style="font-weight:700;font-size:0.6rem;letter-spacing:0.22em;">PACIFIC_SPORTS</div>' +
    '<div style="text-align:right;font-family:monospace;color:#ff3c00;font-size:0.6rem;line-height:1.9;">' +
    '<div>H\u1ED8I THAO 2026</div>' +
    '<div>B\u00CDNH NG\u1ECD \u00B7 MARCH</div>' +
    '</div>' +
    '<h1 id="pac-title">PACIFIC<br>SPORTS</h1>' +
    '<div style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:flex-end;">' +
    '<div style="font-family:monospace;font-size:0.6rem;line-height:1.9;opacity:0.65;">' +
    '<p>[ PACIFIC 25 N\u0102M ]</p>' +
    '<p>H\u1ED8I THAO M\u1EE8NG XU\u00C2N B\u00CDNH NG\u1ECD</p>' +
    '</div>' +
    '<button id="pac-enter">ENTER \u2192</button>' +
    '</div></div>' +

    // Scroll hint
    '<div id="pac-scroll"></div>';

  document.body.style.overflow = 'hidden';
  document.body.appendChild(overlay);

  /* ── Layer images (site's own photos) ──────────────────────────── */
  var l1 = document.getElementById('pac-l1');
  var l2 = document.getElementById('pac-l2');
  var l3 = document.getElementById('pac-l3');

  l1.style.backgroundImage = "url('/TLT06022.jpg')";
  l1.style.filter = 'grayscale(1) contrast(1.2) brightness(0.5)';

  l2.style.backgroundImage = "url('/TLT07029.jpg')";
  l2.style.filter = 'grayscale(1) contrast(1.1) brightness(0.7)';
  l2.style.opacity = '0.6';
  l2.style.mixBlendMode = 'screen';

  l3.style.backgroundImage = "url('/TLT07071.jpg')";
  l3.style.filter = 'grayscale(1) contrast(1.3) brightness(0.8)';
  l3.style.opacity = '0.4';
  l3.style.mixBlendMode = 'overlay';

  var canvas = document.getElementById('pac-canvas');
  var layers = [l1, l2, l3];

  // Initial translateZ depth per layer
  layers.forEach(function (layer, i) {
    layer.style.transform = 'translateZ(' + (i + 1) * 15 + 'px)';
  });

  /* ── Entrance animation ─────────────────────────────────────────── */
  canvas.style.opacity = '0';
  canvas.style.transform = 'rotateX(90deg) rotateZ(0deg) scale(0.8)';

  setTimeout(function () {
    canvas.style.transition = 'all 2.5s cubic-bezier(0.16, 1, 0.3, 1)';
    canvas.style.opacity = '1';
    canvas.style.transform = 'rotateX(55deg) rotateZ(-25deg) scale(1)';
  }, 300);

  // Reveal title text after canvas is in place
  setTimeout(function () {
    var title = document.getElementById('pac-title');
    if (title) title.style.opacity = '1';
  }, 2200);

  // Show enter button
  setTimeout(function () {
    var btn = document.getElementById('pac-enter');
    if (btn) btn.style.opacity = '1';
  }, 2600);

  /* ── Mouse parallax ─────────────────────────────────────────────── */
  function onMouseMove(e) {
    var x = (window.innerWidth  / 2 - e.pageX) / 25;
    var y = (window.innerHeight / 2 - e.pageY) / 25;
    canvas.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    canvas.style.transform = 'rotateX(' + (55 + y / 2) + 'deg) rotateZ(' + (-25 + x / 2) + 'deg)';
    layers.forEach(function (layer, i) {
      var depth  = (i + 1) * 15;
      var moveX  = x * (i + 1) * 0.2;
      var moveY  = y * (i + 1) * 0.2;
      layer.style.transform = 'translateZ(' + depth + 'px) translate(' + moveX + 'px,' + moveY + 'px)';
    });
  }
  window.addEventListener('mousemove', onMouseMove);

  /* ── Dismiss ─────────────────────────────────────────────────────── */
  var dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    window.removeEventListener('mousemove', onMouseMove);
    document.body.style.overflow = '';
    overlay.style.transition = 'opacity 0.75s ease';
    overlay.style.opacity = '0';
    setTimeout(function () { overlay.remove(); }, 750);
  }

  document.getElementById('pac-enter').addEventListener('click', dismiss);

  // Click anywhere on overlay also works (after 3 s)
  setTimeout(function () {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.id === 'pac-viewport' ||
          e.target.id === 'pac-canvas' || e.target.classList.contains('pac-layer')) {
        dismiss();
      }
    });
  }, 3000);

  // Auto-dismiss after 9 s
  setTimeout(dismiss, 9000);
})();
