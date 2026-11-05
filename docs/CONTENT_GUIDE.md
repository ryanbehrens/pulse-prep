# Content guide

All study content lives in `data/`. Each file is a script that assigns to `DATA`, so the site works without a server.

## Rules (non-negotiable)
1. **Original writing only.** Don't copy questions, rationales or explanations from commercial prep products (UWorld, Kaplan, Archer, Bootcamp, Lecturio, etc.) or from copyrighted textbooks. Paraphrase facts in our own words.
2. **Cite a source** for every item (`source` field): NCSBN materials, openly licensed textbooks (OpenStax, Open RN), or public guidelines (CDC, FDA/DailyMed, AHA).
3. **Openly licensed text may be adapted** with attribution (OpenStax and Open RN are CC BY 4.0). Keep attribution in the item's `source`, and list adapted books on an About/credits page before launch.
4. **Tag every item** with a test plan category id: `moc, safety, health, psych, basic, pharm, risk, adapt`.
5. **status** starts as `'draft'`. Only a licensed RN or nurse educator sets `'reviewed'` (optionally add `reviewedBy` and `reviewedOn`).
6. Use NCLEX conventions: "client" (not patient), generic drug names, US units.
7. Reference ranges differ between sources. Pick one consistent source and say "typical adult range".

## Schemas

### data/flashcards.js → `DATA.flashcards`
```js
{ id: 'fc-pharm-005', cat: 'pharm', front: 'Question or prompt', back: 'Answer, 1–3 short sentences',
  source: 'OpenStax, Pharmacology for Nurses', status: 'draft' }
```
ids: `fc-<cat>-<3 digits>`, never reused.

### data/questions.js → `DATA.questions`
```js
{ id: 'q-risk-002', cat: 'risk', type: 'single' | 'sata', status: 'draft',
  stem: 'Question text', options: ['A', 'B', 'C', 'D'], answer: [1],        // indexes of correct options
  rationale: 'Why the right answer is right AND why the main distractors are wrong.',
  source: 'OpenStax, Medical-Surgical Nursing' }
```
- `single`: 4 options, exactly one correct. `sata`: 5–6 options, 2 or more correct.
- Planned later: `type: 'case'` for NGN case studies (6 linked items around one client scenario), following the NCSBN Clinical Judgment Measurement Model.

### data/cheatsheets.js → `DATA.cheatsheets`
```js
{ id: 'labs', title: 'Common lab values', icon: 'drop', color: '#f2c46d', cat: 'risk', status: 'draft',
  sources: [{ title, url }],
  blocks: [ { type: 'table', head: [...], rows: [[...]] },
            { type: 'formula', name, expr, note },
            { type: 'tip', text },
            { type: 'calc', calc: 'dose' | 'drip' | 'abg' | 'convert' } ] }
```
Icons are names from `assets/js/shell.js` (`ICONS`).

### data/topics.js → `DATA.topics`
Keyed by category id (plus `exam`): `{ summary, points: [...], status, sources: [{ title, url }] }`.

## Volume targets (to feel like a complete product)
Roughly in proportion to exam weights: about 1,000 flashcards and 1,500 questions in total, e.g. Management of Care 18%, Pharmacology 16%, Physiological Adaptation 14%, Safety 13%, Reduction of Risk 12%, the other three about 9% each.
