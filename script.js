// ============================================================
// Nour's birthday site — all interactivity lives here.
// Uses Pointer Events throughout so touch (mobile) and mouse
// (desktop) both work through the same code path.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Bottle open ----
  const bottle = document.getElementById('bottle');
  bottle.addEventListener('click', () => {
    if (bottle.classList.contains('open')) return;
    bottle.classList.add('open');
    setTimeout(() => {
      document.querySelector('.letter').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 450);
  });

  // ---- Fade in letter paragraphs on scroll ----
  const paras = document.querySelectorAll('.letter p:not(.letter-open)');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.35 });
    paras.forEach(p => io.observe(p));
  } else {
    // fallback for very old browsers: just show everything
    paras.forEach(p => p.classList.add('in'));
  }
  document.querySelector('.letter-open').classList.add('in');

  // ---- Ambient floating bubbles ----
  const ambient = document.getElementById('ambient');
  function spawnAmbientBubble(){
    const b = document.createElement('div');
    b.className = 'ambient-bubble';
    const size = Math.random() * 16 + 6;
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = Math.random() * 100 + 'vw';
    b.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    b.style.animationDuration = (Math.random() * 8 + 9) + 's';
    ambient.appendChild(b);
    setTimeout(() => b.remove(), 18000);
  }
  if (!prefersReducedMotion) {
    for (let i = 0; i < 5; i++) setTimeout(spawnAmbientBubble, i * 900);
    setInterval(spawnAmbientBubble, 1600);
  }

  // ---- Sand drawing (pointer events = works with touch + mouse) ----
  const sandBox = document.getElementById('sandBox');
  const sandCanvas = document.getElementById('sandCanvas');
  const sctx = sandCanvas.getContext('2d');
  let drawing = false;

  function sizeSandCanvas(){
    const rect = sandBox.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    sandCanvas.width = rect.width * ratio;
    sandCanvas.height = rect.height * ratio;
    sctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  sizeSandCanvas();
  window.addEventListener('resize', sizeSandCanvas);

  function getPos(e){
    const rect = sandCanvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e){
    drawing = true;
    const p = getPos(e);
    sctx.beginPath();
    sctx.moveTo(p.x, p.y);
    sandCanvas.setPointerCapture && sandCanvas.setPointerCapture(e.pointerId);
  }
  function moveDraw(e){
    if (!drawing) return;
    const p = getPos(e);
    sctx.lineTo(p.x, p.y);
    sctx.strokeStyle = '#5C4326';
    sctx.lineWidth = 3;
    sctx.lineCap = 'round';
    sctx.lineJoin = 'round';
    sctx.globalAlpha = 0.55;
    sctx.stroke();
  }
  function endDraw(){ drawing = false; }

  sandCanvas.addEventListener('pointerdown', startDraw);
  sandCanvas.addEventListener('pointermove', moveDraw);
  sandCanvas.addEventListener('pointerup', endDraw);
  sandCanvas.addEventListener('pointercancel', endDraw);
  sandCanvas.addEventListener('pointerleave', endDraw);

  // ---- Tide button ----
  const tideBtn = document.getElementById('tideBtn');
  tideBtn.addEventListener('click', () => {
    if (tideBtn.disabled) return;
    tideBtn.disabled = true;
    sandBox.classList.add('wash');
    setTimeout(() => {
      sctx.clearRect(0, 0, sandCanvas.width, sandCanvas.height);
      document.getElementById('surpriseMsg').classList.add('show');
      bubbleBurst(sandBox);
    }, 2200);
  });

  // ---- Music player ----
  const bgAudio = document.getElementById('bgAudio');
  const musicBtn = document.getElementById('musicBtn');
  let musicPlaying = false;
  let noteTimer = null;

  function spawnNote(){
    const note = document.createElement('span');
    note.className = 'music-note';
    note.textContent = Math.random() > 0.5 ? '♪' : '♫';
    note.style.left = '-6px';
    note.style.bottom = '58px';
    note.style.setProperty('--nx', (Math.random() * 30 - 30) + 'px');
    musicBtn.parentElement.appendChild(note);
    setTimeout(() => note.remove(), 2400);
  }

  musicBtn.addEventListener('click', () => {
    if (!musicPlaying){
      const playPromise = bgAudio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {
          // song.mp3 missing or blocked — fail quietly, button just resets
          musicPlaying = false;
          musicBtn.classList.remove('playing');
        });
      }
      musicPlaying = true;
      musicBtn.classList.add('playing');
      musicBtn.setAttribute('aria-label', 'Pause music');
      if (!prefersReducedMotion) noteTimer = setInterval(spawnNote, 900);
    } else {
      bgAudio.pause();
      musicPlaying = false;
      musicBtn.classList.remove('playing');
      musicBtn.setAttribute('aria-label', 'Play music');
      clearInterval(noteTimer);
    }
  });

  // ---- Bubble burst (used when the tide comes in) ----
  const bcanvas = document.getElementById('bubbles');
  const bctx = bcanvas.getContext('2d');
  function resizeB(){ bcanvas.width = window.innerWidth; bcanvas.height = window.innerHeight; }
  resizeB();
  window.addEventListener('resize', resizeB);

  function bubbleBurst(originEl){
    if (prefersReducedMotion) return;
    const rect = originEl.getBoundingClientRect();
    let particles = [];
    for (let i = 0; i < 40; i++){
      particles.push({
        x: rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.6,
        y: rect.top + rect.height,
        vy: -(Math.random() * 2 + 1.5),
        vx: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 7 + 3,
        life: 140,
        alpha: Math.random() * 0.4 + 0.3
      });
    }
    function frame(){
      bctx.clearRect(0, 0, bcanvas.width, bcanvas.height);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.life -= 1;
        bctx.beginPath();
        bctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        bctx.strokeStyle = `rgba(46,110,134,${p.alpha})`;
        bctx.lineWidth = 1.4;
        bctx.stroke();
      });
      particles = particles.filter(p => p.life > 0);
      if (particles.length > 0) requestAnimationFrame(frame);
      else bctx.clearRect(0, 0, bcanvas.width, bcanvas.height);
    }
    frame();
  }

});
