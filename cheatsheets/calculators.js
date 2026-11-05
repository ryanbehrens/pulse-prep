// Interactive calculators used inside cheat sheets. Each takes a container element and fills it.
// For study practice only: never a substitute for facility protocols, pharmacy or provider orders.
window.Calculators = (function () {
  const num = v => (v === '' || isNaN(+v) ? null : +v);
  const fmt = (n, d = 2) => (Math.round(n * 10 ** d) / 10 ** d).toLocaleString();
  function form(el, title, fields, compute) {
    el.innerHTML = `<h3>${UI.icon('calc')}${title}</h3><div class="fields">${fields.map(f =>
      f.options ? `<label>${f.label}<select data-k="${f.k}">${f.options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label>`
        : `<label>${f.label}<input data-k="${f.k}" inputmode="decimal" placeholder="${f.ph || ''}" value="${f.v ?? ''}"></label>`).join('')}</div><div class="out"></div>`;
    const run = () => {
      const vals = {}; el.querySelectorAll('[data-k]').forEach(i => (vals[i.dataset.k] = i.tagName === 'SELECT' ? i.value : num(i.value)));
      el.querySelector('.out').innerHTML = compute(vals);
    };
    el.addEventListener('input', run); run();
  }
  return {
    dose(el) {
      form(el, 'Desired over Have', [
        { k: 'd', label: 'Desired dose (D)', ph: 'e.g. 500', v: 500 }, { k: 'h', label: 'Dose on hand (H)', ph: 'e.g. 250', v: 250 },
        { k: 'q', label: 'Quantity (Q)', ph: 'e.g. 1', v: 1 }, { k: 'u', label: 'Quantity unit', options: [['tablet(s)', 'tablets'], ['mL', 'mL'], ['capsule(s)', 'capsules']] },
      ], v => (v.d && v.h && v.q ? `Give <b>${fmt(v.d / v.h * v.q)}</b> ${v.u}` : 'Enter D, H and Q'));
    },
    drip(el) {
      form(el, 'IV rate', [
        { k: 'vol', label: 'Volume (mL)', v: 1000 }, { k: 'hr', label: 'Time (hours)', v: 8 },
        { k: 'df', label: 'Drop factor (gtt/mL)', options: [['10', '10 (macro)'], ['15', '15 (macro)'], ['20', '20 (macro)'], ['60', '60 (micro)']] },
      ], v => (v.vol && v.hr ? `Pump: <b>${fmt(v.vol / v.hr, 1)}</b> mL/hr · Gravity: <b>${Math.round(v.vol * +v.df / (v.hr * 60))}</b> gtt/min` : 'Enter volume and time'));
    },
    convert(el) {
      const U = { 'lb>kg': [1 / 2.2, 'kg'], 'kg>lb': [2.2, 'lb'], 'mg>mcg': [1000, 'mcg'], 'mcg>mg': [0.001, 'mg'], 'g>mg': [1000, 'mg'], 'oz>mL': [30, 'mL'], 'tsp>mL': [5, 'mL'], 'tbsp>mL': [15, 'mL'] };
      form(el, 'Quick converter', [
        { k: 'x', label: 'Value', v: 154 },
        { k: 'u', label: 'Convert', options: Object.keys(U).map(k => [k, k.replace('>', ' → ')]) },
      ], v => (v.x !== null ? `<b>${fmt(v.x * U[v.u][0])}</b> ${U[v.u][1]}` : 'Enter a value'));
    },
    abg(el) {
      form(el, 'ABG interpreter', [
        { k: 'ph', label: 'pH', v: 7.31 }, { k: 'co2', label: 'PaCO₂ (mmHg)', v: 50 }, { k: 'hco3', label: 'HCO₃⁻ (mEq/L)', v: 25 },
      ], v => {
        if (v.ph === null || v.co2 === null || v.hco3 === null) return 'Enter all three values';
        const acid = v.ph < 7.35, alk = v.ph > 7.45;
        const rAc = v.co2 > 45, rAl = v.co2 < 35, mAc = v.hco3 < 22, mAl = v.hco3 > 26;
        if (!acid && !alk) {
          if ((rAc && mAl) || (rAl && mAc)) return 'pH normal with abnormal CO₂ and HCO₃⁻: <b>fully compensated</b>. Check which side of 7.40 the pH sits on to find the primary problem.';
          return '<b>Normal</b> acid–base balance';
        }
        let primary = '', comp = 'uncompensated';
        if (acid) { if (rAc) { primary = 'Respiratory acidosis'; if (mAl) comp = 'partially compensated'; } else if (mAc) { primary = 'Metabolic acidosis'; if (rAl) comp = 'partially compensated'; } }
        if (alk) { if (rAl) { primary = 'Respiratory alkalosis'; if (mAc) comp = 'partially compensated'; } else if (mAl) { primary = 'Metabolic alkalosis'; if (rAc) comp = 'partially compensated'; } }
        if (!primary) return `pH is ${acid ? 'acidotic' : 'alkalotic'} but neither value explains it: recheck the numbers (possible mixed disorder).`;
        return `<b>${primary}</b><br><span class="muted">${comp}</span>`;
      });
    },
  };
})();
