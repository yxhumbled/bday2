// ============================================================
// Nour's birthday site all interactivity lives here.
// Uses Pointer Events throughout so touch and mouse both work
// through the same code path.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;
  const body = document.body;

  // ---- Lock the page: nothing scrolls or shows until she taps the bottle ----
  html.classList.add('locked');
  body.classList.add('locked');

  const bottle = document.getElementById('bottle');
  const heroHint = document.getElementById('heroHint');
  const revealWrap = document.getElementById('revealWrap');
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

  function startMusic(){
    if (musicPlaying) return;
    const playPromise = bgAudio.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        // song.mp3 missing or blocked fails quietly button just resets
        musicPlaying = false;
        musicBtn.classList.remove('playing');
      });
    }
    musicPlaying = true;
    musicBtn.classList.add('playing');
    musicBtn.setAttribute('aria-label', 'Pause music');
    if (!prefersReducedMotion) noteTimer = setInterval(spawnNote, 900);
  }

  function stopMusic(){
    bgAudio.pause();
    musicPlaying = false;
    musicBtn.classList.remove('playing');
    musicBtn.setAttribute('aria-label', 'Play music');
    clearInterval(noteTimer);
  }

  bottle.addEventListener('click', () => {
    if (bottle.classList.contains('open')) return;
    bottle.classList.add('open');
    heroHint.classList.add('fade');
    startMusic();

    setTimeout(() => {
      html.classList.remove('locked');
      body.classList.remove('locked');
      revealWrap.classList.add('shown');

      setTimeout(() => {
        document.querySelector('.letter').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }, 500);
  });

  musicBtn.addEventListener('click', () => {
    if (!musicPlaying) startMusic();
    else stopMusic();
  });

  // ---- Fade in letter paragraphs on scroll ----
  const paras = document.querySelectorAll('.letter p:not(.letter-open)');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.35 });
    paras.forEach(p => io.observe(p));
  } else {
    paras.forEach(p => p.classList.add('in'));
  }
  const letterOpen = document.querySelector('.letter-open');
  if (letterOpen) letterOpen.classList.add('in');

  // ---- Ambient floating hearts ----
  const ambient = document.getElementById('ambient');
  const heartChars = ['♡', '❀', '✦'];
  function spawnAmbientHeart(){
    const h = document.createElement('span');
    h.className = 'ambient-heart';
    h.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
    h.style.left = Math.random() * 100 + 'vw';
    h.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    h.style.animationDuration = (Math.random() * 8 + 10) + 's';
    h.style.color = Math.random() > 0.5 ? '#D98BAE' : '#8FC1D9';
    ambient.appendChild(h);
    setTimeout(() => h.remove(), 19000);
  }
  if (!prefersReducedMotion) {
    for (let i = 0; i < 5; i++) setTimeout(spawnAmbientHeart, i * 1000);
    setInterval(spawnAmbientHeart, 1700);
  }

  // ---- Confetti canvas setup (shared by pop finale) ----
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  function resizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function heartBurst(originEl){
    if (prefersReducedMotion) return;
    const rect = originEl.getBoundingClientRect();
    const colors = ['#D98BAE', '#8FC1D9', '#C9A6E0', '#F3C89E'];
    let particles = [];
    for (let i = 0; i < 60; i++){
      particles.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() * -8) - 3,
        size: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 110
      });
    }
    function frame(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.vy += 0.22;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        ctx.save();
        ctx.globalAlpha = Math.max(p.life / 110, 0);
        ctx.fillStyle = p.color;
        drawHeart(ctx, p.x, p.y, p.size);
        ctx.restore();
      });
      particles = particles.filter(p => p.life > 0 && p.y < canvas.height + 40);
      if (particles.length > 0) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    frame();
  }

  function drawHeart(context, x, y, size){
    context.beginPath();
    const topCurveHeight = size * 0.3;
    context.moveTo(x, y + topCurveHeight);
    context.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    context.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
    context.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    context.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    context.closePath();
    context.fill();
  }

  // ---- Pop the bubbles ----
  const bubbleField = document.getElementById('bubbleField');
  const surpriseMsg = document.getElementById('surpriseMsg');
  const signature = document.getElementById('signature');
  const popColors = [
    ['#FBD9E6', '#D98BAE'],
    ['#D9EEF6', '#8FC1D9'],
    ['#E9DDF6', '#C9A6E0'],
    ['#FCE9CF', '#F3C89E']
  ];
  const totalBubbles = 9;
  let poppedCount = 0;

  for (let i = 0; i < totalBubbles; i++){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pop-bubble';
    btn.setAttribute('aria-label', 'Pop bubble');
    const [light, deep] = popColors[i % popColors.length];
    btn.style.background = `radial-gradient(circle at 32% 28%, ${light}, ${deep})`;

    btn.addEventListener('click', () => {
      if (btn.classList.contains('popped')) return;
      btn.classList.add('popped');
      poppedCount += 1;
      spawnHeartPops(btn);
      if (poppedCount === totalBubbles){
        setTimeout(() => {
          surpriseMsg.classList.add('show');
          signature.classList.add('show');
          heartBurst(bubbleField);
        }, 350);
      }
    }, { passive: true });

    bubbleField.appendChild(btn);
  }

  function spawnHeartPops(bubbleEl){
    if (prefersReducedMotion) return;
    const rect = bubbleEl.getBoundingClientRect();
    const fieldRect = bubbleField.getBoundingClientRect();
    for (let i = 0; i < 5; i++){
      const h = document.createElement('span');
      h.className = 'heart-pop';
      h.textContent = '♡';
      h.style.left = (rect.left - fieldRect.left + rect.width / 2) + 'px';
      h.style.top = (rect.top - fieldRect.top + rect.height / 2) + 'px';
      h.style.setProperty('--hx', (Math.random() * 40 - 20) + 'px');
      bubbleField.style.position = 'relative';
      bubbleField.appendChild(h);
      setTimeout(() => h.remove(), 800);
    }
  }

});
