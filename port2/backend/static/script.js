/* ---- THEME TOGGLE ---- */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const stored = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', stored);
themeToggle.textContent = stored === 'dark' ? '☀' : '☾';

themeToggle.addEventListener('click', () => {
  const cur = html.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  themeToggle.textContent = next === 'dark' ? '☀' : '☾';
  localStorage.setItem('theme', next);
});

/* ---- NAVBAR SCROLL ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ---- HAMBURGER ---- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

function closeMobileMenu() {
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('open');
}
window.closeMobileMenu = closeMobileMenu;

/* ---- SCROLL REVEAL ---- */
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.08 });

revealEls.forEach((el) => observer.observe(el));

/* ---- SKILL BARS ---- */
const skillBars = document.querySelectorAll('.skill-bar');
const barObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const pct = e.target.getAttribute('data-pct');
      e.target.style.width = pct + '%';
      barObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

skillBars.forEach((b) => barObs.observe(b));

/* ---- SKILL CIRCLES ---- */
const circles = document.querySelectorAll('.skill-circle-fill');
const circObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const target = parseInt(e.target.getAttribute('data-dash'), 10);
      const r = 35;
      const circ = 2 * Math.PI * r;
      const offset = circ - (target / 220) * circ;
      e.target.style.strokeDasharray = circ;
      e.target.style.strokeDashoffset = circ;
      requestAnimationFrame(() => {
        e.target.style.strokeDashoffset = offset;
      });
      circObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

circles.forEach((c) => circObs.observe(c));

/* ---- VISIT COUNTER PING ---- */
fetch('/api/visit', { method: 'POST' }).catch(() => {});

/* ---- CONTACT FORM ---- */
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('cstat');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = '⚠ Please fill in all required fields.';
    formStatus.className = 'form-status error';
    return;
  }

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    formStatus.textContent = '⚠ Please enter a valid email address.';
    formStatus.className = 'form-status error';
    return;
  }

  const btn = form.querySelector('button[type="submit"] span');
  btn.textContent = 'Sending…';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });
    if (!res.ok) {
      throw new Error('Request failed');
    }
    formStatus.textContent = "✓ Message sent! I'll get back to you soon.";
    formStatus.className = 'form-status success';
    form.reset();
  } catch (err) {
    formStatus.textContent = '⚠ Message failed. Please try again.';
    formStatus.className = 'form-status error';
  } finally {
    btn.textContent = 'Send Message →';
  }
});

/* ---- EPIC ANIMATED BACKGROUND ---- */
(function () {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W; let H; let t = 0;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildDots();
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  const isDark = () => html.getAttribute('data-theme') === 'dark';

  /* DOT GRID */
  const GRID = 55;
  let dots = [];
  function buildDots() {
    dots = [];
    for (let x = 0; x <= W + GRID; x += GRID) {
      for (let y = 0; y <= H + GRID; y += GRID) {
        dots.push({ bx: x, by: y, phase: Math.random() * Math.PI * 2 });
      }
    }
  }

  /* METEORS */
  let meteors = [];
  function makeMeteor() {
    return {
      x: Math.random() * (W || window.innerWidth) * 1.5 - (W || window.innerWidth) * 0.25,
      y: -(Math.random() * (H || window.innerHeight) * 0.5),
      len: Math.random() * 180 + 80,
      speed: Math.random() * 5 + 3,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.55 + 0.2,
      width: Math.random() * 1.5 + 0.4,
      delay: Math.floor(Math.random() * 200),
    };
  }
  function resetMeteor(m) {
    m.len = Math.random() * 180 + 80;
    m.speed = Math.random() * 5 + 3;
    m.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25;
    m.alpha = Math.random() * 0.55 + 0.2;
    m.width = Math.random() * 1.5 + 0.4;
    m.delay = Math.floor(Math.random() * 180);
    m.x = Math.random() * W * 1.5 - W * 0.25;
    m.y = -m.len;
  }
  for (let i = 0; i < 14; i++) meteors.push(makeMeteor());

  /* RINGS */
  const rings = [
    { r: 110, speed: 0.0005, phase: 0, dash: [5, 15] },
    { r: 200, speed: -0.0003, phase: Math.PI / 3, dash: [8, 20] },
    { r: 305, speed: 0.00020, phase: Math.PI / 1.5, dash: [12, 28] },
    { r: 415, speed: -0.00015, phase: Math.PI, dash: [4, 22] },
    { r: 525, speed: 0.0001, phase: Math.PI * 1.5, dash: [16, 32] },
  ];

  resize();

  function draw() {
    t += 0.012;
    ctx.clearRect(0, 0, W, H);
    const fg = isDark() ? '255,255,255' : '0,0,0';

    /* MOUSE GLOW */
    const gx = mouse.x > 0 ? mouse.x : W / 2;
    const gy = mouse.y > 0 ? mouse.y : H / 2;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(W, H) * 0.6);
    glow.addColorStop(0, 'rgba(' + fg + ',0.055)');
    glow.addColorStop(0.45, 'rgba(' + fg + ',0.018)');
    glow.addColorStop(1, 'rgba(' + fg + ',0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    /* BREATHING DOT GRID */
    dots.forEach((d) => {
      const wave = Math.sin(t * 0.8 + d.phase) * 3.5;
      const dx = d.bx - mouse.x; const dy = d.by - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const rep = dist < 130 ? (1 - dist / 130) * 7 : 0;
      const px = d.bx - (dx / (dist || 1)) * rep;
      const py = d.by - (dy / (dist || 1)) * rep + wave;
      const a = 0.05 + Math.abs(Math.sin(t * 0.4 + d.phase)) * 0.12;
      ctx.beginPath();
      ctx.arc(px, py, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + fg + ',' + a + ')';
      ctx.fill();
    });

    /* ROTATING RINGS */
    const cx = W / 2; const cy = H / 2;
    rings.forEach((ring) => {
      ring.phase += ring.speed;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.phase);
      ctx.setLineDash(ring.dash);
      ctx.beginPath();
      ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + fg + ',0.065)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
    ctx.setLineDash([]);

    /* SCAN LINE */
    const scanY = ((t * 28) % (H + 80)) - 40;
    const sg = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
    sg.addColorStop(0, 'rgba(' + fg + ',0)');
    sg.addColorStop(0.5, 'rgba(' + fg + ',0.055)');
    sg.addColorStop(1, 'rgba(' + fg + ',0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 50, W, 100);

    /* METEORS */
    meteors.forEach((m) => {
      if (m.delay-- > 0) return;
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      if (m.y > H + m.len || m.x > W + m.len) resetMeteor(m);

      const tx = m.x - Math.cos(m.angle) * m.len;
      const ty = m.y - Math.sin(m.angle) * m.len;

      if (!isFinite(tx) || !isFinite(ty) || !isFinite(m.x) || !isFinite(m.y)) return;

      const mg = ctx.createLinearGradient(tx, ty, m.x, m.y);
      mg.addColorStop(0, 'rgba(' + fg + ',0)');
      mg.addColorStop(0.65, 'rgba(' + fg + ',' + (m.alpha * 0.45) + ')');
      mg.addColorStop(1, 'rgba(' + fg + ',' + m.alpha + ')');
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(m.x, m.y);
      ctx.strokeStyle = mg;
      ctx.lineWidth = m.width;
      ctx.lineCap = 'round';
      ctx.stroke();

      if (!isFinite(m.x) || !isFinite(m.y)) return;
      const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 7);
      hg.addColorStop(0, 'rgba(' + fg + ',' + m.alpha + ')');
      hg.addColorStop(1, 'rgba(' + fg + ',0)');
      ctx.beginPath();
      ctx.arc(m.x, m.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = hg;
      ctx.fill();
    });

    /* CORNER BRACKETS */
    const bs = 42; const bp = 28;
    [[bp, bp, 1, 1], [W - bp, bp, -1, 1], [bp, H - bp, 1, -1], [W - bp, H - bp, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.strokeStyle = 'rgba(' + fg + ',0.18)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(x + sx * bs, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + sy * bs);
      ctx.stroke();
    });

    requestAnimationFrame(draw);
  }

  draw();
})();

