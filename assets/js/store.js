// Progress storage. Lives in this browser only (localStorage) for now.
// When accounts are added later, swap these functions for API calls: pages only use Store.*.
(function () {
  const KEY = APP.storageKey;
  const blank = () => ({ days: [], cards: {}, answers: {}, quizzes: [] });
  let s;
  try { s = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { s = blank(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
  const today = () => new Date().toISOString().slice(0, 10);

  function markStudied() {
    const d = today();
    if (!s.days.includes(d)) { s.days.push(d); s.days = s.days.slice(-400); save(); }
  }
  // consecutive days up to today (or yesterday, so the streak survives until you study today)
  function streak() {
    const set = new Set(s.days);
    let n = 0; const d = new Date();
    if (!set.has(today())) d.setDate(d.getDate() - 1);
    while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  // flashcards: Leitner boxes 0..4 (4 = mastered)
  function cardBox(id) { return s.cards[id]?.box ?? 0; }
  function rateCard(id, knewIt) {
    const c = s.cards[id] || { box: 0, seen: 0 };
    c.box = knewIt ? Math.min(4, c.box + 1) : 0; c.seen++; c.last = Date.now();
    s.cards[id] = c; markStudied(); save();
  }
  // quiz answers per category
  function recordAnswer(catId, correct) {
    const a = s.answers[catId] || { right: 0, total: 0 };
    a.total++; if (correct) a.right++;
    s.answers[catId] = a; markStudied(); save();
  }
  function recordQuiz(score, total, label) { s.quizzes.unshift({ date: Date.now(), score, total, label }); s.quizzes = s.quizzes.slice(0, 50); save(); }

  window.Store = {
    streak, markStudied, cardBox, rateCard, recordAnswer, recordQuiz,
    answers: () => s.answers, quizzes: () => s.quizzes, cards: () => s.cards,
    reset() { s = blank(); save(); },
  };
})();
