// Shared page shell: header, floating tab bar, icons and small helpers.
// Every page: <body data-root="./ or ../" data-tab="home|learn|study|cheats|anatomy" data-title="Page title">
(function () {
  const root = document.body.dataset.root || './';
  const tab = document.body.dataset.tab || 'home';

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    learn: '<path d="M2 7l10-4 10 4-10 4z"/><path d="M6 9v6c0 1.7 2.7 3 6 3s6-1.3 6-3V9"/><path d="M22 7v6"/>',
    study: '<rect x="3" y="5" width="13" height="16" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/><path d="M7 10h5M7 14h5"/>',
    cheats: '<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 9v11"/>',
    anatomy: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7"/><path d="M8 9.5l4 1.5 4-1.5"/><path d="M12 14l-3 7M12 14l3 7"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 11h6M9 15h4"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.3 7.8-8 9-4.7-1.2-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    sprout: '<path d="M12 21v-8"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6z"/><path d="M12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5z"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    bed: '<path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3h-8v8"/><path d="M3 14h18"/><circle cx="6.5" cy="11" r="1.5"/>',
    pill: '<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="M9.5 8.3l5 7.2"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    flame: '<path d="M12 21c4 0 7-2.7 7-6.5 0-3.5-2.5-5.5-3.5-8.5-1.5 2-2 3-3.5 3.5C12 7 11 4.5 9 3c0 4-4 6-4 11.5C5 18.3 8 21 12 21z"/>',
    cards: '<rect x="2" y="6" width="14" height="15" rx="2"/><path d="M7 3h13a2 2 0 0 1 2 2v12"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    calc: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4"/>',
    beaker: '<path d="M9 3h6M10 3v6L4.5 19A2 2 0 0 0 6.3 22h11.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M7 15h10"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    lungs: '<path d="M12 4v9"/><path d="M9 8C6 8 3 12 3 17c0 2 1 3 3 3 3 0 4-2 4-5V9"/><path d="M15 8c3 0 6 4 6 9 0 2-1 3-3 3-3 0-4-2-4-5V9"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  };
  const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  const tabs = [
    ['home', 'Home', ''], ['learn', 'Learn', 'learn/'], ['study', 'Study', 'study/'],
    ['cheats', 'Cheat sheets', 'cheatsheets/'], ['anatomy', '3D Body', 'anatomy/'],
  ];
  const logo = `<svg viewBox="0 0 24 24" fill="none" stroke="#031220" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2.5-6 5 12 2.5-6h4"/></svg>`;

  // header (skipped on pages that draw their own)
  if (!document.body.hasAttribute('data-no-header')) {
    const h = document.createElement('header');
    h.className = 'app-header';
    h.innerHTML = `<div class="inner">
      <a href="${root}" class="logo" aria-label="Home">${logo}</a>
      <a href="${root}" class="app-name">${APP.name}<small>${APP.tagline}</small></a>
      <span class="header-chip" id="streak-chip" title="Study streak">${icon('flame')}<b id="streak-n">0</b></span>
    </div>`;
    document.body.prepend(h);
  }
  // tab bar
  const nav = document.createElement('nav');
  nav.className = 'tabbar';
  nav.setAttribute('aria-label', 'Main');
  nav.innerHTML = tabs.map(([id, label, href]) =>
    `<a href="${root}${href}" class="${id === tab ? 'on' : ''}" ${id === tab ? 'aria-current="page"' : ''}>${icon(id)}<span>${label}</span></a>`).join('');
  document.body.appendChild(nav);

  // helpers shared by pages
  const cat = id => APP.categories.find(c => c.id === id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const qs = k => new URLSearchParams(location.search).get(k);

  // little celebration
  function confetti(n = 80) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99;overflow:hidden';
    const colors = ['#3fd0ff', '#2b7bff', '#ffffff', '#3ddc97', '#f2c46d'];
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      const size = 6 + Math.random() * 6;
      p.style.cssText = `position:absolute;top:-12px;left:${Math.random() * 100}%;width:${size}px;height:${size * .5}px;background:${colors[i % colors.length]};border-radius:2px;opacity:.95`;
      p.animate([{ transform: `translate(0,0) rotate(0)` }, { transform: `translate(${(Math.random() - .5) * 220}px, ${innerHeight + 40}px) rotate(${720 * Math.random()}deg)` }],
        { duration: 1400 + Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' });
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3200);
  }

  window.UI = { icon, cat, esc, qs, confetti, root };
  document.addEventListener('DOMContentLoaded', () => {
    const n = document.getElementById('streak-n');
    if (n && window.Store) n.textContent = Store.streak();
  });
})();
