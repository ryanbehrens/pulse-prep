# Design notes

## Look and feel
- Mobile first (design at 390px wide, then let it breathe up to 640px). Dark navy background, white text, signature blue `#3fd0ff` with deeper blue `#2b7bff` for gradients.
- Each test plan category has its own colour (`APP.categories[].color`), used for badges, bars and glows.
- Motion: entrance fade-up (`.rise`), slow floating tiles (`float`), press-down on tap (`:active` scale), confetti for wins (`UI.confetti()`). Reduced-motion users get no animation (handled in theme.css).

## Building blocks (theme.css)
`.page` (centered column) · `.page-head` · `.section` / `.section-title` · `.card` (+ `.tap`) · `.btn` (+ `.primary`, `.block`) · `.chips` / `.chip.on` · `.badge` (+ `.draft`) · `.icon-bubble` · `.bar > i` (progress) · `.grid-2`, `.stack`.

## Navigation
Floating pill tab bar at the bottom (Home, Learn, Study, Cheat sheets, 3D Body), drawn by `assets/js/shell.js`. The 3D anatomy page is full-screen with its own UI and a "Home" pill in its header.

## Adding a new page
1. Create `newsection/index.html`. Copy the `<head>` from `study/index.html` and adjust the title.
2. `<body data-root="../" data-tab="study">` (`data-tab` picks the highlighted tab).
3. Load `../assets/js/config.js`, `../assets/js/store.js`, `../assets/js/shell.js`, any `../data/*.js`, then the page script.
4. If it needs its own tab, add it to the `tabs` list in `shell.js` (five tabs is the comfortable maximum on phones).
