/* ============================================================
   VISHAL BIRTHDAY WEBSITE — script.js
   Features: Particles, Mic Blow Detection, Confetti,
             Typing Animation, Scroll Reveal, 3D Tilt,
             Music Toggle, Celebrate Button
   ============================================================ */

'use strict';

/* ================================================================
   1. PARTICLE BACKGROUND
   ================================================================ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.r    = Math.random() * 1.8 + 0.4;
    this.vx   = (Math.random() - 0.5) * 0.35;
    this.vy   = -(Math.random() * 0.5 + 0.1);
    this.life = Math.random();
    this.maxLife = Math.random() * 0.6 + 0.4;
    const type = Math.random();
    if (type < 0.6)      { this.color = `rgba(0,212,255,`; }
    else if (type < 0.85){ this.color = `rgba(255,215,0,`; }
    else                 { this.color = `rgba(255,255,255,`; }
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.life += 0.002;
    if (this.life > this.maxLife || this.y < 0 || this.x < 0 || this.x > W) this.reset();
  };
  Particle.prototype.draw = function () {
    const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.7;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + alpha + ')';
    ctx.fill();
  };

  const COUNT = window.innerWidth < 600 ? 80 : 150;
  for (let i = 0; i < COUNT; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // stagger initial positions
    particles.push(p);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }
  loop();
})();


/* ================================================================
   2. SCROLL REVEAL
   ================================================================ */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => observer.observe(t));
})();


/* ================================================================
   3. 3D TILT ON PHOTO
   ================================================================ */
(function initPhotoTilt() {
  const frame = document.getElementById('photoFrame');
  if (!frame) return;
  frame.addEventListener('mousemove', (e) => {
    const rect = frame.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    frame.style.transform = `perspective(600px) rotateY(${dx * 14}deg) rotateX(${-dy * 14}deg) scale(1.04)`;
  });
  frame.addEventListener('mouseleave', () => {
    frame.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1)';
    frame.style.transition = 'transform 0.5s ease';
  });
  frame.addEventListener('mouseenter', () => {
    frame.style.transition = 'transform 0.1s ease';
  });
})();


/* ================================================================
   4. MUSIC TOGGLE
   ================================================================ */
(function initMusic() {
  const btn   = document.getElementById('musicBtn');
  const audio = document.getElementById('bgMusic');
  if (!btn || !audio) return;

  let playing = false;
  audio.volume = 0.25;

  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      btn.querySelector('.music-icon').textContent = '🔇';
      btn.querySelector('.music-label').textContent = 'Music';
      playing = false;
    } else {
      audio.play().catch(() => {});
      btn.querySelector('.music-icon').textContent = '🎵';
      btn.querySelector('.music-label').textContent = 'Mute';
      playing = true;
    }
  });
})();


/* ================================================================
   5. CONFETTI BURST
   ================================================================ */
function launchConfetti(count = 120) {
  const container = document.getElementById('confettiContainer');
  if (!container) return;

  const colors = ['#00d4ff','#ffd700','#ff4d6d','#00ff88','#a855f7','#ff8c00','#4df9ff'];
  const shapes = ['rect','circle','triangle'];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size  = Math.random() * 8 + 5;
      piece.style.cssText = `
        left:${Math.random() * 100}%;
        top:-20px;
        width:${size}px;
        height:${shape==='circle'?size:size*1.4}px;
        background:${color};
        border-radius:${shape==='circle'?'50%':shape==='triangle'?'0':'3px'};
        clip-path:${shape==='triangle'?'polygon(50% 0%, 0% 100%, 100% 100%)':'none'};
        animation-duration:${Math.random()*2.5+1.5}s;
        animation-delay:${Math.random()*0.8}s;
        opacity:1;
        box-shadow: 0 0 6px ${color};
      `;
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 4500);
    }, i * 8);
  }
}


/* ================================================================
   6. CANDLES & MICROPHONE BLOW DETECTION
   ================================================================ */
(function initCake() {
  const blowBtn    = document.getElementById('blowBtn');
  const relightBtn = document.getElementById('relightBtn');
  const wishMsg    = document.getElementById('wishMessage');
  const micRing    = document.getElementById('micRing');
  const micText    = document.getElementById('micStatusText');

  if (!blowBtn) return;

  const CANDLE_COUNT = 5;
  let isListening    = false;
  let audioCtx       = null;
  let analyser       = null;
  let micStream      = null;
  let animFrame      = null;
  let candlesBlown   = false;

  // ---- Extinguish candles ----
  function extinguishCandles() {
    if (candlesBlown) return;
    candlesBlown = true;

    for (let i = 1; i <= CANDLE_COUNT; i++) {
      setTimeout(() => {
        const flame = document.getElementById('flame' + i);
        const smoke = document.getElementById('smoke' + i);
        if (flame) flame.classList.add('extinguished');
        if (smoke) { smoke.classList.add('active'); setTimeout(() => smoke.classList.remove('active'), 2000); }
      }, (i - 1) * 140);
    }

    setTimeout(() => {
      // show wish message
      if (wishMsg) wishMsg.classList.add('visible');
      // confetti
      launchConfetti(200);
      // celebration sound
      const cel = document.getElementById('celebrationSound');
      if (cel) { cel.volume = 0.5; cel.play().catch(() => {}); }
      // update UI
      if (micRing) { micRing.classList.remove('listening'); micRing.classList.add('blown'); }
      if (micText) micText.textContent = '🎉 Candles blown! Make a wish!';
      blowBtn.style.display = 'none';
      if (relightBtn) relightBtn.style.display = 'inline-flex';
    }, CANDLE_COUNT * 140 + 300);

    stopMic();
  }

  // ---- Relight candles ----
  function relightCandles() {
    candlesBlown = false;
    for (let i = 1; i <= CANDLE_COUNT; i++) {
      const flame = document.getElementById('flame' + i);
      const smoke = document.getElementById('smoke' + i);
      if (flame) flame.classList.remove('extinguished');
      if (smoke) smoke.classList.remove('active');
    }
    if (wishMsg) wishMsg.classList.remove('visible');
    if (micRing) { micRing.classList.remove('blown', 'listening'); }
    if (micText) micText.textContent = 'Press the button & blow! 🎤';
    blowBtn.style.display = 'inline-flex';
    if (relightBtn) relightBtn.style.display = 'none';
    blowBtn.classList.remove('active-mic');
    isListening = false;
  }

  // ---- Stop mic ----
  function stopMic() {
    isListening = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    if (audioCtx)  { audioCtx.close().catch(() => {}); audioCtx = null; }
    if (blowBtn) blowBtn.classList.remove('active-mic');
  }

  // ---- Web Audio API blow detection ----
  async function startMic() {
    if (isListening || candlesBlown) return;

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
      analyser  = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      const source = audioCtx.createMediaStreamSource(micStream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      isListening = true;
      blowBtn.classList.add('active-mic');
      if (micRing) micRing.classList.add('listening');
      if (micText) micText.textContent = '🎤 Listening... blow now!';

      let blowFrames = 0;
      const BLOW_THRESHOLD = 180;   // amplitude threshold
      const BLOW_FRAMES_NEEDED = 6; // consecutive frames above threshold

      function detect() {
        if (!isListening) return;
        analyser.getByteFrequencyData(dataArray);

        // Calculate average amplitude
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        // Blow detection: low-freq energy spike (wind is mostly low freq)
        const lowFreqAvg = Array.from(dataArray.slice(0, 20)).reduce((a, b) => a + b, 0) / 20;

        if (lowFreqAvg > BLOW_THRESHOLD || avg > BLOW_THRESHOLD * 0.65) {
          blowFrames++;
          if (blowFrames >= BLOW_FRAMES_NEEDED) {
            extinguishCandles();
            return;
          }
        } else {
          blowFrames = Math.max(0, blowFrames - 1);
        }
        animFrame = requestAnimationFrame(detect);
      }
      detect();

      // Auto stop after 15 seconds
      setTimeout(() => {
        if (isListening) {
          stopMic();
          if (micText) micText.textContent = "Couldn't detect. Try again! 🎤";
          if (micRing) micRing.classList.remove('listening');
        }
      }, 15000);

    } catch (err) {
      console.warn('Mic access denied or unavailable:', err);
      if (micText) micText.textContent = '⚠️ Mic access denied. Using tap instead!';
      // Fallback: manual tap to blow
      extinguishCandles();
    }
  }

  blowBtn.addEventListener('click', () => {
    if (!isListening && !candlesBlown) startMic();
  });

  if (relightBtn) relightBtn.addEventListener('click', relightCandles);
})();


/* ================================================================
   7. TYPING ANIMATION (Sarcasm section)
   ================================================================ */
(function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const lines = [
    '"HC Verma chapter 1 pe hoon... aaj toh khatam kar dunga"',
    '"Ek aur PYQ... bas ek aur..."',
    '"Sleep is a distraction from IIT"',
    '"12 bajje tak padhunga, pakka"',
    '"Rank improve hogi, I promise"',
    '"Aaj revision, kal new chapter"',
    '"IIT mere baap ka ghar hai 💪"',
  ];

  let lineIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = lines[lineIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        lineIdx  = (lineIdx + 1) % lines.length;
        setTimeout(type, 400);
        return;
      }
    }
    setTimeout(type, deleting ? 45 : 65);
  }

  // Start when section visible
  const section = document.getElementById('sarcasm');
  if (!section) { setTimeout(type, 800); return; }
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { setTimeout(type, 600); obs.disconnect(); }
  }, { threshold: 0.3 });
  obs.observe(section);
})();


/* ================================================================
   8. "CELEBRATE VISHAL" BUTTON
   ================================================================ */
(function initCelebrateBtn() {
  const btn = document.getElementById('celebrateBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    launchConfetti(250);

    // Flash the hero
    const hero = document.getElementById('hero');
    if (hero) {
      hero.style.transition = 'background 0.2s';
      hero.style.background = 'radial-gradient(ellipse at 50% 50%, #0a2a6e 0%, #020714 80%)';
      setTimeout(() => {
        hero.style.background = 'radial-gradient(ellipse at 50% 60%, #0b1e45 0%, #020714 70%)';
      }, 400);
    }

    // Play music
    const audio = document.getElementById('bgMusic');
    if (audio && audio.paused) {
      audio.play().catch(() => {});
      const icon  = document.querySelector('.music-icon');
      const label = document.querySelector('.music-label');
      if (icon)  icon.textContent  = '🎵';
      if (label) label.textContent = 'Mute';
    }

    // Animate button
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => { btn.style.transform = ''; }, 150);

    // Scroll hint
    setTimeout(() => {
      document.getElementById('photo')?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  });
})();


/* ================================================================
   9. FLOATING ELEMENTS (stars around the page)
   ================================================================ */
(function addFloatingStars() {
  const body = document.body;
  const emojis = ['⭐','✨','💫','🌟','⚡','🔥'];
  const count = window.innerWidth < 600 ? 6 : 12;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const size = Math.random() * 18 + 14;
    const left = Math.random() * 96;
    const top  = Math.random() * 300 + 10; // percentage of scroll height (rough)
    const dur  = Math.random() * 6 + 5;
    const delay = Math.random() * -8;

    star.textContent = emoji;
    star.style.cssText = `
      position: fixed;
      left: ${left}vw;
      top: ${20 + Math.random() * 60}vh;
      font-size: ${size}px;
      pointer-events: none;
      z-index: 0;
      opacity: 0.18;
      animation: starDrift ${dur}s ease-in-out ${delay}s infinite alternate;
      user-select: none;
    `;
    body.appendChild(star);
  }

  // Inject star drift keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes starDrift {
      from { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.12; }
      to   { transform: translateY(-30px) rotate(20deg) scale(1.2); opacity: 0.28; }
    }
  `;
  document.head.appendChild(style);
})();


/* ================================================================
   10. SECTION HEADING GLOW ON HOVER
   ================================================================ */
document.querySelectorAll('.section-title').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.filter = 'drop-shadow(0 0 25px rgba(0,212,255,0.9))';
  });
  el.addEventListener('mouseleave', () => {
    el.style.filter = 'drop-shadow(0 0 10px rgba(0,212,255,0.4))';
  });
});


/* ================================================================
   11. BADGE INTERACTIVE RIPPLE
   ================================================================ */
document.querySelectorAll('.badge').forEach(badge => {
  badge.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    const rect   = badge.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute;
      border-radius:50%;
      width:4px; height:4px;
      background: rgba(0,212,255,0.6);
      left:${e.clientX - rect.left}px;
      top:${e.clientY - rect.top}px;
      transform:translate(-50%,-50%);
      animation: rippleOut 0.5s ease-out forwards;
      pointer-events:none;
    `;
    badge.style.position = 'relative';
    badge.style.overflow = 'hidden';
    badge.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Ripple keyframe
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleOut {
    to { transform: translate(-50%,-50%) scale(30); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);


/* ================================================================
   12. PAGE LOAD — STAGGER HERO + INITIAL CONFETTI
   ================================================================ */
window.addEventListener('load', () => {
  setTimeout(() => launchConfetti(60), 1800);
});
