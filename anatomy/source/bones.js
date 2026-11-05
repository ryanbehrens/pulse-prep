// Turns Z-Anatomy object names into friendly labels, regions, search aliases and study notes.

const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const FINGERS = ['thumb', 'index finger', 'middle finger', 'ring finger', 'little finger'];
const TOES = ['great toe', 'second toe', 'third toe', 'fourth toe', 'little toe'];

const BONE_SUB = { skull: 'Skull', teeth: 'Teeth', neck: 'Larynx & hyoid', spine: 'Spine', thorax: 'Thorax', upper: 'Upper limb', pelvis: 'Pelvis', lower: 'Lower limb' };

export const REGIONS = [
  { id: 'skull', label: 'Head' },
  { id: 'neck', label: 'Neck' },
  { id: 'thorax', label: 'Thorax' },
  { id: 'pelvis', label: 'Abdomen & pelvis' },
  { id: 'spine', label: 'Spine & back' },
  { id: 'upper', label: 'Arm' },
  { id: 'hand', label: 'Hand' },
  { id: 'lower', label: 'Leg' },
  { id: 'foot', label: 'Foot' },
  { id: 'teeth', label: 'Teeth' },
];

const has = (s, ...words) => words.some(w => s.includes(w));

function regionOf(base) {
  const b = base.toLowerCase();
  if (has(b, 'incisor', 'canine', 'premolar', 'molar')) return 'teeth';
  if (has(b, 'hyoid', 'thyroid_cartilage', 'cricoid', 'arytenoid', 'corniculate')) return 'neck';
  if (has(b, 'vertebra', 'atlas', 'axis_')) return 'spine';
  if (has(b, 'rib', 'sternum', 'xiphoid')) return 'thorax';
  if (has(b, 'hip_bone', 'sacrum', 'coccyx')) return 'pelvis';
  if (has(b, 'of_hand', 'metacarpal', 'capitate', 'hamate', 'lunate', 'pisiform', 'scaphoid', 'trapez', 'triquetrum', 'clavicle', 'scapula', 'humerus', 'radius', 'ulna')) return 'upper';
  if (has(b, 'of_foot', 'metatarsal', 'talus', 'calcaneus', 'navicular', 'cuboid', 'cuneiform', 'femur', 'patella', 'tibia', 'fibula')) return 'lower';
  return 'skull';
}

function prettyBase(b) {
  let m;
  if ((m = b.match(/^Vertebra_([CTL])(\d+)$/))) return `${m[1]}${m[2]} vertebra`;
  if ((m = b.match(/^(Distal|Middle|Proximal)_phalanx_of_(\w+?)_finger_of_(hand|foot)$/))) {
    const i = ORD.indexOf(m[2]);
    const digit = m[3] === 'hand' ? FINGERS[i] : TOES[i];
    return `${m[1]} phalanx of ${digit}`;
  }
  return b.replace(/_tooth$/, '').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
}

// [pattern on base name, extra search words]
const ALIASES = [
  [/^Femur/, 'thigh bone thighbone femoral neck greater trochanter hip'],
  [/^Patella/, 'kneecap knee cap knee'],
  [/^Tibia/, 'shin bone shinbone leg medial malleolus'],
  [/^Fibula/, 'calf bone leg lateral malleolus ankle'],
  [/^Clavicle/, 'collarbone collar bone shoulder'],
  [/^Scapula/, 'shoulder blade shoulder glenoid acromion'],
  [/^Humerus/, 'upper arm arm bone elbow shoulder'],
  [/^Radius/, 'forearm wrist thumb side colles'],
  [/^Ulna/, 'forearm elbow olecranon funny bone'],
  [/^Hip_bone/, 'pelvis pelvic coxal innominate ilium iliac crest ischium pubis pubic acetabulum hip'],
  [/^Sacrum/, 'pelvis lower back tailbone sacral'],
  [/^Coccyx/, 'tailbone tail bone pelvis'],
  [/^Calcaneus/, 'heel bone heel foot'],
  [/^Talus/, 'ankle bone ankle astragalus foot tarsal'],
  [/^(Navicular|Cuboid|.*cuneiform)/, 'tarsal foot midfoot'],
  [/metatarsal/, 'foot'],
  [/^Mandible/, 'jaw jawbone lower jaw chin tmj'],
  [/^Maxilla/, 'upper jaw cheek'],
  [/^Zygomatic/, 'cheekbone cheek bone malar'],
  [/^Frontal_bone/, 'forehead skull cranium'],
  [/^Sinus_of_frontal/, 'frontal sinus sinuses'],
  [/^Occipital/, 'back of head skull cranium foramen magnum'],
  [/^Temporal/, 'temple skull mastoid ear cranium'],
  [/^Parietal/, 'skull crown cranium top of head'],
  [/^Sphenoid/, 'skull sella turcica cranium'],
  [/^Sinus_of_sphenoid/, 'sphenoid sinus sinuses'],
  [/ethmoid/i, 'ethmoid sinus sinuses nose'],
  [/^Nasal_bone/, 'nose bridge of nose'],
  [/^Vomer/, 'nasal septum nose'],
  [/^Lacrimal/, 'tear duct eye orbit'],
  [/^Palatine/, 'hard palate roof of mouth'],
  [/^Inferior_nasal_concha/, 'turbinate nose'],
  [/cartilage.*nasal|nasal.*cartilage|alar/i, 'nose nostril septum'],
  [/^Malleus/, 'hammer ear ossicle middle ear hearing'],
  [/^Incus/, 'anvil ear ossicle middle ear hearing'],
  [/^Stapes/, 'stirrup ear ossicle middle ear hearing'],
  [/^Hyoid/, 'neck throat tongue'],
  [/^Thyroid_cartilage/, 'adams apple larynx voice box throat cricothyroid'],
  [/^Cricoid/, 'larynx airway trachea cricothyroid'],
  [/^(Arytenoid|Corniculate)/, 'larynx vocal cords voice box'],
  [/^Manubrium/, 'sternum breastbone breast bone jugular notch suprasternal'],
  [/^Body_of_sternum/, 'sternum breastbone breast bone chest cpr compressions'],
  [/^Xiphoid/, 'sternum breastbone cpr'],
  [/^Atlas/, 'c1 cervical neck spine vertebra'],
  [/^Axis/, 'c2 dens odontoid cervical neck spine vertebra'],
  [/^Vertebra_C/, 'cervical neck spine backbone'],
  [/^Vertebra_T/, 'thoracic mid back upper back spine backbone'],
  [/^Vertebra_L/, 'lumbar lower back low back spine backbone lumbar puncture'],
  [/_rib$/, 'ribs rib cage chest'],
  [/^Costal_cartilage/, 'rib cartilage ribs chest'],
  [/^(Capitate|Hamate|Lunate|Pisiform|Scaphoid|Trapezium|Trapezoid|Triquetrum)/, 'carpal wrist hand'],
  [/^Scaphoid/, 'snuffbox navicular'],
  [/metacarpal/, 'hand palm knuckle'],
  [/finger_of_hand/, 'finger fingers hand phalanges'],
  [/finger_of_foot/, 'toe toes foot phalanges'],
  [/Sesamoid/, 'foot great toe'],
  [/incisor|canine|molar/, 'tooth teeth dental mouth'],
];

// Short, well-established NCLEX-style study notes.
const PEARLS = [
  [/^Femur/, 'Hip (femoral neck) fracture: the affected leg looks shortened and externally rotated. Femur fractures carry a risk of fat embolism, usually within 24–72 h. Watch for sudden dyspnea, confusion and petechiae.'],
  [/^Hip_bone/, 'The posterior iliac crest is the usual site for bone marrow aspiration. Ventrogluteal IM site: palm on the greater trochanter, index finger toward the anterior superior iliac spine.'],
  [/^Clavicle/, 'The most commonly fractured bone during birth, especially with shoulder dystocia. Check for an asymmetric Moro reflex.'],
  [/^Scaphoid/, 'Tenderness in the anatomical snuffbox after a fall on an outstretched hand suggests scaphoid fracture. Its poor blood supply means a risk of avascular necrosis.'],
  [/^Radius/, 'Colles fracture: distal radius fracture from a fall on an outstretched hand ("dinner-fork" deformity). Monitor neurovascular status distal to the injury.'],
  [/^Humerus/, 'A midshaft humerus fracture can injure the radial nerve, causing wrist drop.'],
  [/^Tibia/, 'Tibial fractures are high-risk for compartment syndrome. Pain out of proportion to the injury and pain on passive stretch are early signs. Report them immediately.'],
  [/^Calcaneus/, 'Newborn heel stick: use the medial or lateral sides of the plantar heel and avoid the center (calcaneus) to prevent osteomyelitis.'],
  [/^Temporal/, 'Battle sign (bruising over the mastoid process) suggests a basilar skull fracture. Check for CSF leaking from the ears or nose (halo sign).'],
  [/^Body_of_sternum/, 'Adult CPR: compress the lower half of the sternum at least 2 in (5 cm), 100–120 per minute, allowing full recoil.'],
  [/^Xiphoid/, 'Keep hands off the xiphoid process during CPR. Pressure on it can lacerate the liver.'],
  [/^(Atlas|Axis|Vertebra_C)/, 'Suspected cervical spine injury: keep the spine aligned and open the airway with a jaw thrust, not a head-tilt chin-lift.'],
  [/^Vertebra_L/, 'Lumbar puncture is done at L3–L4 or L4–L5, below the end of the spinal cord. Position the patient side-lying (fetal) or sitting and leaning forward.'],
  [/^[A-Z][a-z]+_rib$/, 'Rib fractures cause splinting and shallow breathing, which raises the risk of atelectasis and pneumonia. Prioritize pain control and incentive spirometry. Paradoxical chest movement suggests flail chest.'],
  [/^Sacrum/, 'One of the most common sites for pressure injuries. Reposition immobile patients at least every 2 hours.'],
  [/^Mandible/, 'After jaw wiring (maxillomandibular fixation), keep wire cutters at the bedside in case of vomiting or airway obstruction.'],
  [/^Thyroid_cartilage/, 'The cricothyroid membrane, between the thyroid and cricoid cartilages, is the site for emergency cricothyrotomy.'],
];

const RIB_KIND = n => (n <= 7 ? 'True rib' : n <= 10 ? 'False rib' : 'Floating rib');

export function describe(raw) {
  const side = raw.endsWith('.r') ? 'right' : raw.endsWith('.l') ? 'left' : null;
  const base = raw.replace(/\.(l|r)$/, '');
  const region = regionOf(base);
  const label = prettyBase(base);
  let sub = BONE_SUB[region];
  const ribM = base.match(/^([A-Z][a-z]+)_rib$/);
  if (ribM) sub = `${RIB_KIND(ORD.indexOf(ribM[1].toLowerCase()) + 1)} · Thorax`;
  let words = '';
  for (const [re, w] of ALIASES) if (re.test(base)) words += ' ' + w;
  const pearl = (PEARLS.find(([re]) => re.test(base)) || [])[1] || null;
  return {
    raw, base, side, region, sub, pearl, system: 'bone',
    label: side ? `${label} (${side})` : label,
    search: norm(`${label} ${base} ${words} ${side || ''}`),
  };
}

// Named groups the search can select all at once.
export const GROUPS = [].concat([
  { label: 'Skull (cranium & face)', words: 'skull cranium head face', test: b => b.region === 'skull' },
  { label: 'Spine / vertebral column', words: 'spine vertebral column backbone vertebrae', test: b => b.region === 'spine' || /Sacrum|Coccyx/.test(b.base) },
  { label: 'Cervical vertebrae (C1–C7)', words: 'cervical vertebrae neck c spine', test: b => /^(Atlas|Axis|Vertebra_C)/.test(b.base) },
  { label: 'Thoracic vertebrae (T1–T12)', words: 'thoracic vertebrae t spine', test: b => /^Vertebra_T/.test(b.base) },
  { label: 'Lumbar vertebrae (L1–L5)', words: 'lumbar vertebrae l spine lower back', test: b => /^Vertebra_L/.test(b.base) },
  { label: 'Rib cage', words: 'ribs rib cage thorax chest', test: b => b.region === 'thorax' },
  { label: 'True ribs (1–7)', words: 'true ribs', test: b => b.sub.startsWith('True') },
  { label: 'False ribs (8–10)', words: 'false ribs', test: b => b.sub.startsWith('False') },
  { label: 'Floating ribs (11–12)', words: 'floating ribs', test: b => b.sub.startsWith('Floating') },
  { label: 'Sternum', words: 'sternum breastbone', test: b => /Manubrium|Body_of_sternum|Xiphoid/.test(b.base) },
  { label: 'Pelvis', words: 'pelvis pelvic girdle hips', test: b => b.region === 'pelvis' },
  { label: 'Carpal bones (wrist)', words: 'carpals carpal bones wrist', test: b => /^(Capitate|Hamate|Lunate|Pisiform|Scaphoid|Trapezium|Trapezoid|Triquetrum)/.test(b.base) },
  { label: 'Metacarpals', words: 'metacarpals hand palm', test: b => /metacarpal/.test(b.base) },
  { label: 'Phalanges of the hand', words: 'phalanges fingers hand', test: b => /finger_of_hand/.test(b.base) },
  { label: 'Tarsal bones', words: 'tarsals tarsal bones ankle foot', test: b => /^(Talus|Calcaneus|Navicular|Cuboid|.*cuneiform)/.test(b.base) },
  { label: 'Metatarsals', words: 'metatarsals foot', test: b => /metatarsal/.test(b.base) },
  { label: 'Phalanges of the foot', words: 'phalanges toes foot', test: b => /finger_of_foot/.test(b.base) },
  { label: 'Middle ear ossicles', words: 'ossicles ear hearing malleus incus stapes', test: b => /^(Malleus|Incus|Stapes)/.test(b.base) },
  { label: 'Teeth', words: 'teeth tooth dental', test: b => b.region === 'teeth' },
  { label: 'Larynx cartilages', words: 'larynx voice box cartilages', test: b => /cartilage/.test(b.base) && b.region === 'neck' },
  { label: 'Upper limb (arm)', words: 'upper limb arm', test: b => b.region === 'upper' },
  { label: 'Lower limb (leg)', words: 'lower limb leg', test: b => b.region === 'lower' },
].map(g => ({ ...g, test: b => b.system === 'bone' && g.test(b) })));

export function norm(s) {
  return s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

// Every query word must prefix-match some word in the target; favour label hits.
export function score(query, target, label) {
  const q = norm(query).split(' ').filter(Boolean);
  if (!q.length) return 0;
  const words = target.split(' ');
  const lab = norm(label);
  let s = 0;
  for (const w of q) {
    if (!words.some(t => t.startsWith(w))) return 0;
    s += lab.split(' ').some(t => t === w) ? 3 : lab.split(' ').some(t => t.startsWith(w)) ? 2 : 1;
  }
  if (lab.startsWith(norm(query))) s += 3;
  return s - lab.length / 200;
}
