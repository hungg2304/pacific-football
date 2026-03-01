(function () {
  // Only show once per browser session (not on every page / back-button)
  if (sessionStorage.getItem('pacific-intro')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  sessionStorage.setItem('pacific-intro', '1');

  /* ── Overlay DOM ─────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'intro-overlay';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99999;background:#0a0806;overflow:hidden;cursor:crosshair;';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  overlay.appendChild(canvas);

  // Centre logo
  const logoEl = document.createElement('div');
  logoEl.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">' +
    '<path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z"/>' +
    '<path d="M9 22V13h6v9"/></svg>PACIFIC SPORTS';
  logoEl.style.cssText =
    'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
    'display:flex;align-items:center;gap:10px;color:white;' +
    "font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;" +
    'letter-spacing:0.32em;text-transform:uppercase;pointer-events:none;' +
    'mix-blend-mode:difference;opacity:0;transition:opacity 0.9s ease;';
  overlay.appendChild(logoEl);

  // Enter / skip button
  const enterBtn = document.createElement('button');
  enterBtn.textContent = 'ENTER \u2192';
  enterBtn.style.cssText =
    'position:absolute;bottom:28px;right:28px;' +
    'background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.3);' +
    "color:white;font-size:10px;font-family:'DM Sans',sans-serif;" +
    'letter-spacing:0.25em;padding:8px 18px;cursor:pointer;text-transform:uppercase;' +
    'opacity:0;transition:opacity 0.5s;';
  overlay.appendChild(enterBtn);

  document.body.style.overflow = 'hidden';
  document.body.appendChild(overlay);

  /* ── Dismiss ─────────────────────────────────────────────────────── */
  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    document.body.style.overflow = '';
    overlay.style.transition = 'opacity 0.75s ease';
    overlay.style.opacity = '0';
    setTimeout(function () { overlay.remove(); }, 750);
  }

  enterBtn.addEventListener('click', dismiss);
  setTimeout(function () { logoEl.style.opacity = '1'; }, 800);
  setTimeout(function () { enterBtn.style.opacity = '0.85'; }, 1600);
  setTimeout(dismiss, 6500);

  /* ── Mouse / Touch ───────────────────────────────────────────────── */
  var mX = 0.5, mY = 0.5, mTarget = 0, mCurrent = 0, hasEntered = false;

  overlay.addEventListener('mousemove', function (e) {
    mX = e.clientX / window.innerWidth;
    mY = 1 - e.clientY / window.innerHeight;
    hasEntered = true;
  });
  overlay.addEventListener('mouseenter', function () { mTarget = 1; });
  overlay.addEventListener('mouseleave', function () { mTarget = 0; });
  overlay.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    mX = t.clientX / window.innerWidth;
    mY = 1 - t.clientY / window.innerHeight;
    mTarget = 1; hasEntered = true;
  }, { passive: true });
  overlay.addEventListener('touchend', function () { mTarget = 0; }, { passive: true });

  /* ── Load Three.js, then init WebGL ─────────────────────────────── */
  var threeScript = document.createElement('script');
  threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
  threeScript.onload = initGL;
  threeScript.onerror = function () { setTimeout(dismiss, 1500); };
  document.head.appendChild(threeScript);

  function initGL() {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene  = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.position.z = 1;

    /* ── Vertex Shader ─────────────────────────────────────────────── */
    var vert = [
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = uv;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n');

    /* ── Fragment Shader ───────────────────────────────────────────── */
    var frag = [
      'precision highp float;',
      'uniform sampler2D uTexture;',
      'uniform float     uTime;',
      'uniform vec2      uMouse;',
      'uniform float     uMouseActive;',
      'uniform float     uPixelSize;',
      'uniform float     uWaveSpeed;',
      'uniform float     uWaveFrequency;',
      'uniform float     uWaveAmplitude;',
      'uniform float     uRevealRadius;',
      'uniform float     uRevealSoftness;',
      'uniform float     uMouseRadius;',
      'uniform float     uImageAspect;',
      'uniform float     uScreenAspect;',
      'varying vec2 vUv;',

      // Bayer 4x4 ordered dithering — pure float for max compatibility
      'float bayer(vec2 p) {',
      '  float x = mod(p.x, 4.0);',
      '  float y = mod(p.y, 4.0);',
      '  if (y < 1.0) {',
      '    if (x < 1.0) return  0.0/16.0;',
      '    if (x < 2.0) return  8.0/16.0;',
      '    if (x < 3.0) return  2.0/16.0;',
      '                 return 10.0/16.0;',
      '  }',
      '  if (y < 2.0) {',
      '    if (x < 1.0) return 12.0/16.0;',
      '    if (x < 2.0) return  4.0/16.0;',
      '    if (x < 3.0) return 14.0/16.0;',
      '                 return  6.0/16.0;',
      '  }',
      '  if (y < 3.0) {',
      '    if (x < 1.0) return  3.0/16.0;',
      '    if (x < 2.0) return 11.0/16.0;',
      '    if (x < 3.0) return  1.0/16.0;',
      '                 return  9.0/16.0;',
      '  }',
      '  if (x < 1.0) return 15.0/16.0;',
      '  if (x < 2.0) return  7.0/16.0;',
      '  if (x < 3.0) return 13.0/16.0;',
      '               return  5.0/16.0;',
      '}',

      'void main() {',
      '  vec2 uv = vUv;',

      // Cover-fit
      '  vec2 scale = (uScreenAspect > uImageAspect)',
      '    ? vec2(1.0, uImageAspect / uScreenAspect)',
      '    : vec2(uScreenAspect / uImageAspect, 1.0);',
      '  vec2 texUv = (uv - 0.5) / scale + 0.5;',

      // Continuous wave distortion
      '  float ws = uWaveAmplitude * 0.1;',
      '  vec2 distUv = texUv;',
      '  distUv.x += sin(texUv.y * uWaveFrequency       + uTime * uWaveSpeed      ) * ws;',
      '  distUv.y += sin(texUv.x * uWaveFrequency * 0.7 + uTime * uWaveSpeed * 0.8) * ws * 0.5;',

      // Mouse ripple
      '  if (uMouseActive > 0.01) {',
      '    float d   = distance(uv, uMouse);',
      '    float inf = smoothstep(uMouseRadius, 0.0, d);',
      '    float rip = sin(d * uWaveFrequency * 5.0 - uTime * uWaveSpeed)',
      '                * uWaveAmplitude * 0.05 * inf * uMouseActive;',
      '    distUv += rip;',
      '  }',

      '  vec4  color = texture2D(uTexture, clamp(distUv, 0.001, 0.999));',

      // Grayscale + Bayer dithering -> 3-level B&W
      '  float gray  = dot(color.rgb, vec3(0.299, 0.587, 0.114));',
      '  vec2  px    = floor(gl_FragCoord.xy / uPixelSize);',
      '  float d2    = bayer(px);',
      '  float adj   = gray + (d2 - 0.5) * 0.5;',
      '  float q     = adj < 0.33 ? 0.0 : adj < 0.66 ? 0.5 : 1.0;',
      '  vec3  bw    = vec3(q);',

      // Flashlight color-reveal under cursor
      '  float rd     = distance(uv, uMouse);',
      '  float inner  = uRevealRadius * (1.0 - uRevealSoftness);',
      '  float reveal = (1.0 - smoothstep(inner, uRevealRadius, rd)) * uMouseActive;',

      '  gl_FragColor = vec4(mix(bw, color.rgb, reveal), color.a);',
      '}'
    ].join('\n');

    /* ── Load texture & build scene ──────────────────────────────── */
    new THREE.TextureLoader().load('/TLT06022.jpg', function (tex) {
      var imgAspect = tex.image.width / tex.image.height;
      var scrAspect = window.innerWidth / window.innerHeight;

      var uniforms = {
        uTexture:        { value: tex },
        uTime:           { value: 0 },
        uMouse:          { value: new THREE.Vector2(-10, -10) },
        uMouseActive:    { value: 0 },
        uPixelSize:      { value: 3 },
        uWaveSpeed:      { value: 0.25 },
        uWaveFrequency:  { value: 2.0 },
        uWaveAmplitude:  { value: 0.35 },
        uRevealRadius:   { value: 0.3 },
        uRevealSoftness: { value: 0.75 },
        uMouseRadius:    { value: 0.3 },
        uImageAspect:    { value: imgAspect },
        uScreenAspect:   { value: scrAspect },
      };

      var mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: uniforms })
      );
      scene.add(mesh);

      var clock = new THREE.Clock();
      (function animate() {
        if (!document.getElementById('intro-overlay')) return;
        requestAnimationFrame(animate);
        uniforms.uTime.value        = clock.getElapsedTime();
        mCurrent                   += (mTarget - mCurrent) * 0.06;
        uniforms.uMouseActive.value = mCurrent;
        if (hasEntered) uniforms.uMouse.value.set(mX, mY);
        renderer.render(scene, camera);
      })();
    });

    window.addEventListener('resize', function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      var mesh = scene.children[0];
      if (mesh && mesh.material && mesh.material.uniforms)
        mesh.material.uniforms.uScreenAspect.value = window.innerWidth / window.innerHeight;
    });
  }
})();
