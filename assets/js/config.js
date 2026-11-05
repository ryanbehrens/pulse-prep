// App-wide settings. Change the app name in ONE place: here.
window.APP = {
  name: 'Pulse Prep',              // final name (keep "NCLEX" out of the name: it is an NCSBN trademark)
  tagline: 'NCLEX-RN study companion',
  storageKey: 'pulseprep.v1',      // localStorage key for progress on this device

  // NCSBN 2026 NCLEX-RN Test Plan (effective April 2026): Client Needs categories and % of items.
  // Source: https://www.ncsbn.org/publications/2026-nclex-rn-test-plan
  categories: [
    { id: 'moc',   name: 'Management of Care',                       group: 'Safe and Effective Care Environment', range: [15, 21], color: '#3fd0ff', icon: 'clipboard' },
    { id: 'safety',name: 'Safety & Infection Prevention and Control', group: 'Safe and Effective Care Environment', range: [10, 16], color: '#3ddc97', icon: 'shield' },
    { id: 'health',name: 'Health Promotion & Maintenance',           group: 'Health Promotion and Maintenance',    range: [6, 12],  color: '#f2c46d', icon: 'sprout' },
    { id: 'psych', name: 'Psychosocial Integrity',                    group: 'Psychosocial Integrity',              range: [6, 12],  color: '#b48cff', icon: 'brain' },
    { id: 'basic', name: 'Basic Care & Comfort',                      group: 'Physiological Integrity',             range: [6, 12],  color: '#ff9f6b', icon: 'bed' },
    { id: 'pharm', name: 'Pharmacological & Parenteral Therapies',    group: 'Physiological Integrity',             range: [13, 19], color: '#ff6b9a', icon: 'pill' },
    { id: 'risk',  name: 'Reduction of Risk Potential',               group: 'Physiological Integrity',             range: [9, 15],  color: '#6bb8ff', icon: 'activity' },
    { id: 'adapt', name: 'Physiological Adaptation',                  group: 'Physiological Integrity',             range: [11, 17], color: '#ff6b6b', icon: 'heart' },
  ],
};
window.DATA = window.DATA || {};
