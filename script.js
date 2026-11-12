const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let changingTheme = false;
function syncTheme() {
  const light = root.dataset.theme === 'light';
  themeButton.setAttribute('aria-label', 'Switch to ' + (light ? 'dark' : 'light') + ' theme');
  themeButton.title = themeButton.getAttribute('aria-label');
  document.querySelector('meta[name="theme-color"]').content = light ? '#faf9f6' : '#100e0e';
}
syncTheme();
async function toggleTheme(event) {
  if (changingTheme) return;
  const update = () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('arsh-theme', root.dataset.theme); } catch {}
    syncTheme();
  };
  if (!document.startViewTransition || motion.matches) { update(); return; }
  changingTheme = true;
  const rect = themeButton.getBoundingClientRect();
  const x = event?.clientX || rect.left + rect.width / 2;
  const y = event?.clientY || rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  try {
    const transition = document.startViewTransition(update);
    await transition.ready;
    const animation = root.animate(
      { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
      { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
    );
    await animation.finished;
    await transition.finished;
  } catch { syncTheme(); } finally { changingTheme = false; }
}
themeButton.addEventListener('click', toggleTheme);
const dialog = document.querySelector('#commands');
document.querySelector('.command-trigger')?.addEventListener('click', () => dialog.showModal());
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('.command-theme').addEventListener('click', () => { dialog.close(); toggleTheme(); });
dialog.querySelectorAll('a').forEach(a => a.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault(); dialog.open ? dialog.close() : dialog.showModal();
  }
});
const toast = document.querySelector('.toast');
let toastTimer;
document.querySelector('.avatar-button').addEventListener('click', () => {
  clearTimeout(toastTimer); toast.textContent = 'Hey, I’m Arsh. Glad you stopped by 👋';
  toast.classList.add('show'); toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
});
const indexLinks = [...document.querySelectorAll('.index-nav a')];
const anchors = indexLinks.map(a => document.querySelector(a.getAttribute('href')));
let queued = false;
function updateIndex() {
  let selected = 0;
  anchors.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= innerHeight * .35) selected = i; });
  indexLinks.forEach((a, i) => { if (i === selected) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  queued = false;
}
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(updateIndex); } }, { passive: true });
addEventListener('resize', updateIndex);
updateIndex();
