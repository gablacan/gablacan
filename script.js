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
