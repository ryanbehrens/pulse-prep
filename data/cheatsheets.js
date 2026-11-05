// Cheat sheets. Each sheet: { id, title, icon, color, cat, status, sources, blocks: [...] }
// Block types: { type:'table', head:[], rows:[[]] } | { type:'formula', name, expr, note } | { type:'tip', text }
//              | { type:'calc', calc:'drip'|'dose'|'abg'|'convert' }   (interactive calculators, built in cheatsheets/app.js)
// All 'draft' until reviewed. Reference ranges vary by lab and textbook: students should follow their program's values.
DATA.cheatsheets = [
  { id: 'dosage', title: 'Dosage calculation', icon: 'calc', color: '#3fd0ff', cat: 'pharm', status: 'draft',
    sources: [{ title: 'Open RN, Nursing Pharmacology', url: 'https://wtcs.pressbooks.pub/pharmacology/' }],
    blocks: [
      { type: 'formula', name: 'Desired over Have', expr: 'Dose = (D ÷ H) × Q', note: 'D = desired dose, H = dose on hand, Q = quantity it comes in.' },
      { type: 'calc', calc: 'dose' },
      { type: 'formula', name: 'Weight-based dose', expr: 'Dose = mg/kg × weight (kg)', note: 'Convert pounds to kilograms first (÷ 2.2).' },
      { type: 'formula', name: 'IV pump rate', expr: 'mL/hr = total volume (mL) ÷ time (hr)' },
      { type: 'formula', name: 'Gravity drip rate', expr: 'gtt/min = (volume mL × drop factor) ÷ time (min)' },
      { type: 'calc', calc: 'drip' },
      { type: 'tip', text: 'Round only at the end, and double-check any answer that seems unusually large or small.' },
    ] },
  { id: 'convert', title: 'Conversions', icon: 'beaker', color: '#3ddc97', cat: 'pharm', status: 'draft',
    sources: [{ title: 'OpenStax, Pharmacology for Nurses', url: 'https://openstax.org/details/books/pharmacology' }],
    blocks: [
      { type: 'table', head: ['From', 'Equals'], rows: [['1 kg', '2.2 lb'], ['1 g', '1,000 mg'], ['1 mg', '1,000 mcg'], ['1 L', '1,000 mL'], ['1 tsp', '5 mL'], ['1 tbsp', '15 mL'], ['1 oz', '30 mL'], ['1 inch', '2.54 cm']] },
      { type: 'formula', name: 'Temperature', expr: '°F = (°C × 9/5) + 32   ·   °C = (°F − 32) × 5/9' },
      { type: 'calc', calc: 'convert' },
    ] },
  { id: 'abg', title: 'ABG interpretation', icon: 'lungs', color: '#6bb8ff', cat: 'adapt', status: 'draft',
    sources: [{ title: 'OpenStax, Medical-Surgical Nursing', url: 'https://openstax.org/details/books/medical-surgical-nursing' }],
    blocks: [
      { type: 'table', head: ['Value', 'Normal'], rows: [['pH', '7.35–7.45'], ['PaCO₂', '35–45 mmHg'], ['HCO₃⁻', '22–26 mEq/L'], ['PaO₂', '80–100 mmHg']] },
      { type: 'tip', text: 'ROME: Respiratory Opposite (pH and PaCO₂ move in opposite directions), Metabolic Equal (pH and HCO₃⁻ move the same way).' },
      { type: 'calc', calc: 'abg' },
    ] },
  { id: 'vitals', title: 'Adult vital signs', icon: 'activity', color: '#ff6b9a', cat: 'risk', status: 'draft',
    sources: [{ title: 'Open RN, Nursing Skills', url: 'https://wtcs.pressbooks.pub/nursingskills/' }],
    blocks: [
      { type: 'table', head: ['Vital sign', 'Typical adult range'], rows: [['Heart rate', '60–100 /min'], ['Respirations', '12–20 /min'], ['Blood pressure', 'Normal < 120/80 mmHg'], ['Temperature', '36.5–37.5 °C (97.7–99.5 °F)'], ['SpO₂', '95–100%']] },
      { type: 'tip', text: 'Always compare with the client\'s baseline: a change matters more than a single number.' },
    ] },
  { id: 'labs', title: 'Common lab values', icon: 'drop', color: '#f2c46d', cat: 'risk', status: 'draft',
    sources: [{ title: 'OpenStax, Medical-Surgical Nursing', url: 'https://openstax.org/details/books/medical-surgical-nursing' }],
    blocks: [
      { type: 'table', head: ['Lab', 'Typical adult range'], rows: [['Sodium', '135–145 mEq/L'], ['Potassium', '3.5–5.0 mEq/L'], ['Chloride', '98–106 mEq/L'], ['Glucose (fasting)', '70–99 mg/dL'], ['BUN', '10–20 mg/dL'], ['Creatinine', '0.6–1.2 mg/dL'], ['WBC', '5,000–10,000 /mm³'], ['Platelets', '150,000–400,000 /mm³'], ['INR (no anticoagulant)', '0.8–1.1']] },
      { type: 'tip', text: 'Ranges differ slightly between labs and textbooks. Use the values your program teaches.' },
    ] },
  { id: 'insulin', title: 'Insulin timing', icon: 'pill', color: '#b48cff', cat: 'pharm', status: 'draft',
    sources: [{ title: 'OpenStax, Pharmacology for Nurses', url: 'https://openstax.org/details/books/pharmacology' }],
    blocks: [
      { type: 'table', head: ['Type (example)', 'Onset', 'Peak', 'Duration'], rows: [['Rapid (lispro)', '~15 min', '1–2 hr', '3–5 hr'], ['Short (regular)', '30–60 min', '2–4 hr', '5–8 hr'], ['Intermediate (NPH)', '1–2 hr', '4–12 hr', '12–18 hr'], ['Long (glargine)', '1–2 hr', 'No pronounced peak', '~24 hr']] },
      { type: 'tip', text: 'Hypoglycemia risk is highest around the peak. Rapid-acting insulin is given with meals.' },
    ] },
  { id: 'isolation', title: 'Isolation precautions', icon: 'shield', color: '#3ddc97', cat: 'safety', status: 'draft',
    sources: [{ title: 'CDC Isolation Precautions guideline', url: 'https://www.cdc.gov/infection-control/hcp/isolation-precautions/index.html' }],
    blocks: [
      { type: 'table', head: ['Type', 'Examples', 'Key PPE / room'], rows: [['Contact', 'MRSA, C. difficile, scabies', 'Gown + gloves; dedicated equipment'], ['Droplet', 'Influenza, pertussis, bacterial meningitis', 'Surgical mask within close range; private room preferred'], ['Airborne', 'TB, measles, varicella', 'N95 respirator; negative-pressure room, door closed']] },
      { type: 'tip', text: 'Standard precautions apply to every client, every time.' },
    ] },
  { id: 'priority', title: 'Prioritization', icon: 'sparkle', color: '#ff9f6b', cat: 'moc', status: 'draft',
    sources: [{ title: 'Open RN, Nursing Management & Professional Concepts', url: 'https://wtcs.pressbooks.pub/nursingmpc/' }],
    blocks: [
      { type: 'table', head: ['Framework', 'Use it to decide…'], rows: [['ABCs', 'Airway, then breathing, then circulation'], ['Maslow', 'Physiological needs and safety before love, esteem and self-actualization'], ['Acute vs chronic', 'A new or sudden change usually comes before a long-standing problem'], ['Unstable vs stable', 'Unexpected findings come before expected ones']] },
      { type: 'tip', text: 'Ask: "What will hurt this client first if I don\'t act?"' },
    ] },
];
