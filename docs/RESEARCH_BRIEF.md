# Research brief: NCLEX-RN content

Hand this to the assistant doing content research. Read `CLAUDE.md` and `docs/CONTENT_GUIDE.md` first.

## Goal
Build an accurate, original, well-sourced content library for an NCLEX-RN study app: flashcards, practice questions with rationales, cheat sheets and topic summaries. The output goes into `data/*.js` using the schemas in `docs/CONTENT_GUIDE.md`.

## Sources: three tiers
**Tier 1: the official blueprint (defines what to cover)**
- NCSBN 2026 NCLEX-RN Test Plan (effective April 2026): https://www.ncsbn.org/publications/2026-nclex-rn-test-plan (PDF on nclex.com). Use its Client Needs categories, subcategory topics, activity statements and integrated processes as the coverage checklist.
- NCSBN Next Generation NCLEX resources: the Clinical Judgment Measurement Model and published sample item types (case studies, bow-tie, matrix, drag-and-drop, highlight). Use them for question *formats*, not as content to copy.

**Tier 2: openly licensed textbooks (main factual source; CC BY 4.0, adapt with attribution)**
- OpenStax nursing series (8 books): Fundamentals of Nursing, Medical-Surgical Nursing, Pharmacology for Nurses, Clinical Nursing Skills, Maternal-Newborn Nursing, Psychiatric-Mental Health Nursing, Population Health for Nurses, Nutrition for Nurses. https://openstax.org/subjects/nursing
- Open RN (Chippewa Valley Technical College): Nursing Fundamentals, Nursing Skills, Nursing Pharmacology, Nursing Mental Health & Community Concepts, Nursing Management & Professional Concepts, Nursing Advanced Skills, Health Promotion. https://wtcs.pressbooks.pub/
- StatPearls entries marked CC BY 4.0 (check each one's license).

**Tier 3: public clinical references (verify specific facts)**
- CDC (isolation precautions, immunization schedules, infection control), FDA / DailyMed (drug labels), AHA guidelines (CPR, BP categories), MedlinePlus.

**Allowed for inspiration only (never copy text or questions):** public pages of commercial prep apps (UWorld, Archer, Kaplan, Bootcamp, SimpleNursing, Lecturio) to see which topics, features and formats students value.

## Rules
- Original wording. Every item gets a `source`, a test plan `cat` and `status: 'draft'`.
- Rationales explain why the answer is right **and** why the tempting wrong options are wrong.
- When sources disagree (e.g. lab ranges), choose one consistent source and note it.
- Flag anything uncertain in a `notes` field rather than guessing.
- Don't invent statistics, drug doses or guideline numbers. If it can't be verified in a Tier 1–3 source, leave it out.

## Deliverables, in order
1. **Coverage map** (`docs/coverage.md`): each test plan subcategory → list of topics to cover, with the Tier 2 chapter that supports it.
2. **Topic summaries**: expand `data/topics.js` (key concepts per category, 8–15 points each, with sources).
3. **Flashcards**: about 50 per category to start (400 total), weighted toward high-yield topics.
4. **Questions**: about 40 per category to start (320 total), with roughly 25% select-all-that-apply.
5. **Cheat sheets**: add, for example, electrolyte imbalance signs, common drug classes and suffixes, blood product safety, pediatric vital signs, developmental milestones, therapeutic drug levels, and an NGN item-types explainer.
6. Work in batches by category. After each batch, sanity-check that the app still loads (open `study/quiz.html`).

## Quality bar
Clinically accurate, current (2024 and later guidelines), aligned to entry-level RN practice, and written plainly for a student studying on a phone. All of it still needs final review by a licensed RN or nurse educator before release.
