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
