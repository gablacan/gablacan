const root = document.documentElement;
const btn = document.getElementById('theme');
const isDark = () =>
  root.dataset.theme ? root.dataset.theme === 'dark'
  : matchMedia('(prefers-color-scheme: dark)').matches;

btn.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});
document.getElementById('year').textContent = new Date().getFullYear();
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('section:not(.hero) .wrap').forEach(el => io.observe(el));
}

(() => {
  const track = document.getElementById('track');
  if (!track) return;
  const cards = [...track.children];
  const dotsEl = document.getElementById('dots');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  let current = 0;

  const smooth = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  function go(i) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    const c = cards[i];
    track.scrollTo({
      left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2,
      behavior: smooth()
    });
  }

  const dots = cards.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Aller au projet ' + (i + 1));
    b.addEventListener('click', () => go(i));
    dotsEl.appendChild(b);
    return b;
  });

  function update() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0, min = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (d < min) { min = d; best = i; }
    });
    current = best;
    cards.forEach((c, i) => c.classList.toggle('active', i === best));
    dots.forEach((d, i) => d.setAttribute('aria-current', i === best ? 'true' : 'false'));
    prev.disabled = best === 0;
    next.disabled = best === cards.length - 1;
  }

  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(current - 1); }
  });
  window.addEventListener('resize', () => { go(current); update(); });
  update();
})();

(() => {
  const svg = document.getElementById('engine');
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const gas = $('gas'), piston = $('piston'), rod = $('rod'), crank = $('crank'),
        cpin = $('cpin'), ppin = $('ppin'), label = $('phase');

  const CX = 150, CY = 270, R = 34, L = 100, TOP = 102;   // géométrie (unités du dessin)
  const PHASES = [
    ['Admission', 'intake'],
    ['Compression', 'compression'],
    ['Combustion et détente', 'power'],
    ['Échappement', 'exhaust']
  ];
  let lastPhase = -1;

  function draw(a) {
    const px = CX + R * Math.sin(a);
    const py = CY - R * Math.cos(a);
    const y  = py - Math.sqrt(L * L - (R * Math.sin(a)) ** 2);   // position de l'axe du piston

    crank.setAttribute('x2', px); crank.setAttribute('y2', py);
    cpin.setAttribute('cx', px);  cpin.setAttribute('cy', py);
    rod.setAttribute('x1', px);   rod.setAttribute('y1', py);
    rod.setAttribute('x2', CX);   rod.setAttribute('y2', y);
    ppin.setAttribute('cy', y);
    piston.setAttribute('y', y - 12);
    gas.setAttribute('height', Math.max(0, y - 12 - TOP));

    const k = ((Math.floor(a / Math.PI) % 4) + 4) % 4;
    if (k !== lastPhase) {
      lastPhase = k;
      gas.setAttribute('class', 'gas ' + PHASES[k][1]);
      label.textContent = PHASES[k][0];
    }
  }

  // Sans animation si l'utilisateur l'a demandé : on montre une image fixe (détente)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw(Math.PI * 2.6);
    return;
  }

  const CYCLE = 4 * Math.PI;      // un cycle complet = 2 tours de vilebrequin
  const DURATION = 9;             // secondes par cycle : augmente pour ralentir
  let a = 0, last = performance.now(), visible = true;

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); })
    .observe(svg);

  function frame(now) {
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    if (visible) { a = (a + dt * CYCLE / DURATION) % CYCLE; draw(a); }
    requestAnimationFrame(frame);
  }
  draw(0);
  requestAnimationFrame(frame);
})();
