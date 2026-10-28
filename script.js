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
