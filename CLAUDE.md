# Briefing for AI assistants working on this project

Read this first, then only the files for the page you're asked to work on.

## What this is
**Pulse Prep** (final name; repo `pulse-prep`) is a mobile-first NCLEX-RN study web app. Static site: plain HTML, CSS and JavaScript, with **no build step and no framework**. It's hosted on Vercel and also works when `index.html` is opened straight from a folder.

## Owner preferences
- Mobile first. Modern and playful, not text-heavy: animation, cards, gradients, haptic-feeling taps.
- Colour theme: deep navy/black background, white text, signature blue `#3fd0ff`. All tokens live in `assets/css/theme.css`.
- Speed matters. Work only on the page you're asked about. Keep testing proportional: for small tweaks, one quick phone-size screenshot is enough. Say what you tested.
- The owner is not a developer. Explain results in plain words and avoid jargon.

## Map
| Path | What it is | Touch it when… |
|---|---|---|
| `index.html` | Home: greeting, floating tiles, 3D feature card, question of the day | home page work |
| `learn/` | Topics by NCLEX test plan category (`index.html` list, `topic.html?c=<id>` detail) | Learn section |
| `study/` | `index.html` hub, `flashcards.html`, `quiz.html`, `progress.html` | Study section |
| `cheatsheets/` | Reference sheets + `calculators.js` (dose, drip, ABG, converter) | Cheat sheets |
| `anatomy/` | **Self-contained 3D anatomy app** (three.js). See `anatomy/README.md` | only if explicitly asked |
| `assets/css/theme.css` | Design tokens and shared components | global look |
| `assets/js/config.js` | App name, test plan categories (ids, % ranges, colours) | renaming, categories |
| `assets/js/shell.js` | Header, floating bottom tab bar, icons (`UI.icon`), helpers (`UI.*`), confetti | nav or icons |
| `assets/js/store.js` | Progress saved in localStorage (`Store.*`) | progress features / future accounts |
| `data/*.js` | All study content: `topics`, `flashcards`, `questions`, `cheatsheets` | content work |
| `docs/CONTENT_GUIDE.md` | Content schemas and rules | before adding content |
| `docs/RESEARCH_BRIEF.md` | Brief for gathering NCLEX content | content research |
| `docs/DESIGN.md` | UI patterns and how to make a new page | new pages |

## Conventions
- Each page sets `<body data-root="../" data-tab="study">` and loads, in order: `config.js`, `store.js`, `shell.js`, then `data/*.js` it needs, then its own inline script. Use **relative paths** (`../assets/...`) so the site works from a folder and on Vercel.
- Content files are classic scripts that set `DATA.<name> = [...]` (not JSON fetched over the network), so pages also work when opened from disk.
- Never copy questions or explanations from commercial prep products (UWorld, Kaplan, Archer, etc.). Write original content from the NCSBN test plan and openly licensed sources, and cite them. See `docs/CONTENT_GUIDE.md`.
- Every content item has `status: 'draft' | 'reviewed'`. Drafts show a "Draft" badge until a licensed RN or nurse educator reviews them.
- Category ids: `moc, safety, health, psych, basic, pharm, risk, adapt` (defined in `config.js`).

## The anatomy page (don't rebuild unless asked)
`anatomy/index.html` + `anatomy/app.js` (bundled, minified) + `anatomy/*.data.js` (compressed 3D models, base64). Its readable source is in `anatomy/source/`. To change it, edit `anatomy/source/*.js` and rebuild:
`npx esbuild anatomy/source/app.js --bundle --format=iife --minify --outfile=anatomy/app.js` (needs `npm i three esbuild` once). Mirror any `index.html` change in both `anatomy/index.html` and `anatomy/source/index.html`.

## Status (Nov 2026)
- Done: anatomy app (10 systems, search, isolate, parts list, lighting, mobile tools). Shell, home, Learn, Study (flashcards / quiz / progress), Cheat sheets with calculators.
- Content: **drafts only** (248 flashcards, 10 questions, 8 cheat sheets, category summaries). The next step is content research per `docs/RESEARCH_BRIEF.md`.
- Ideas queued: logo; user accounts and cloud progress; anatomy quiz mode; NGN case-study questions; exam countdown.
