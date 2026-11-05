# Pulse Prep: NCLEX-RN study companion

A mobile-first study app for nursing students preparing for the NCLEX-RN: topics organized by the official test plan, flashcards, mock quizzes, progress tracking, cheat sheets with calculators, and an interactive 3D anatomy explorer.

> To rename the app, change the name in `assets/js/config.js` (and the page `<title>`s).

## Sections
- **Home**: greeting, streak and stats, floating shortcut tiles, 3D anatomy feature, question of the day.
- **Learn**: the 8 NCLEX-RN Client Needs categories with their exam weights, plus "How the NCLEX works".
- **Study**: flashcards (flip and swipe, spaced repetition), mock quizzes (single answer and select-all-that-apply, with rationales), progress by category.
- **Cheat sheets**: dosage formulas, conversions, ABGs, vital signs, labs, insulin, isolation, prioritization, with interactive calculators.
- **3D Body**: the anatomy app in `anatomy/`.

## Run it
- **Quickest:** double-click `index.html`. Everything works offline from the folder (fonts need internet).
- **Like the live site:** in this folder run `npx serve` and open the address it prints.

## Deploy to Vercel
Option A, without Git: install the Vercel CLI (`npm i -g vercel`), run `vercel` in this folder, then `vercel --prod`.
Option B, recommended: put this folder in a GitHub repository, then in Vercel choose **Add New → Project → Import** that repo. Framework preset: **Other**, no build command, output directory: `/` (the default). Every push then redeploys automatically.

There's no build step. `vercel.json` only turns on clean URLs.

## Project structure
```
index.html              Home
learn/                  index.html (categories), topic.html?c=<id>
study/                  index.html (hub), flashcards.html, quiz.html, progress.html
cheatsheets/            index.html, calculators.js
anatomy/                3D anatomy app (self-contained; readable code in anatomy/source/)
assets/css/theme.css    colours, typography, shared components
assets/js/config.js     app name + NCLEX test plan categories
assets/js/shell.js      header, bottom tab bar, icons, helpers
assets/js/store.js      progress saved on the device (localStorage)
assets/img/             images (anatomy-hero.webp)
data/                   all study content (topics, flashcards, questions, cheatsheets)
docs/                   CONTENT_GUIDE.md, RESEARCH_BRIEF.md, DESIGN.md
CLAUDE.md               briefing for AI assistants (start here in a new chat)
```

## Content status
All current content is **starter material marked as Draft**. It must be reviewed by a licensed RN or nurse educator before real students rely on it. Content sources and rules are in `docs/CONTENT_GUIDE.md`.

## Starting a new chat
Tell the assistant: *"Read CLAUDE.md in my NCLEX app folder, then help me with ___."* That file has the map, the conventions and the current status.
