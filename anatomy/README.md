# 3D Anatomy

Self-contained three.js app. Built files: `index.html`, `app.js` (bundled), `*.data.js` (3D models as base64 GLB, loaded on demand per body system).
Readable source: `source/` (`app.js` viewer, `bones.js` / `muscles.js` / `systems.js` labels, groups and NCLEX pearls, `optimize.mjs` / `split.mjs` / `patch.mjs` model conversion from Z-Anatomy OBJ exports).

Models: Z-Anatomy (CC BY-SA 4.0, based on BodyParts3D). Keep attribution on an About/credits page.

Rebuild after editing source: `npx esbuild anatomy/source/app.js --bundle --format=iife --minify --outfile=anatomy/app.js` (needs `npm i three esbuild`).
