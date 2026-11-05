// Labels, search words, groups and study notes for the Z-Anatomy muscular system.
import { norm } from './bones.js';

export const CONNECTIVE = /fascia(?!e)|bursa|sheath|aponeurosis|retinacul|ligament|linea_alba|intermuscular_septum|_tract$|tendinous_ring|tendinous_arch|^tendon_|calcaneal_tendon|intermediate_tendon|tarsus$|^trochlea|iliopectineal_arch/i;

const ALIASES = [
  [/deltoid/i, 'delts shoulder injection site im'],
  [/biceps_brachii/i, 'biceps arm flexor'],
  [/triceps_brachii/i, 'triceps arm extensor'],
  [/brachialis|brachioradialis|coracobrachialis/i, 'arm elbow flexor'],
  [/pectoralis/i, 'pecs chest'],
  [/latissimus/i, 'lats back'],
  [/trapezius/i, 'traps back neck shoulder'],
  [/rhomboid|levator_scapulae|serratus/i, 'shoulder blade scapula back'],
  [/supraspinatus|infraspinatus|teres_minor|subscapularis/i, 'rotator cuff sits shoulder'],
  [/rectus_femoris|vastus/i, 'quads quadriceps thigh knee extensor'],
  [/biceps_femoris|semitendinosus|semimembranosus/i, 'hamstrings thigh knee flexor'],
  [/adductor_(longus|brevis|magnus|minimus)|gracilis|pectineus/i, 'adductors groin inner thigh'],
  [/gluteus/i, 'glutes buttock butt hip'],
  [/gastrocnemius|soleus|plantaris/i, 'calf leg'],
  [/calcaneal_tendon/i, 'achilles tendon heel calf'],
  [/tibialis|fibularis|peroneus/i, 'shin leg ankle'],
  [/rectus_abdominis/i, 'abs six pack abdomen abdominal'],
  [/abdominal_oblique|transversus_abdominis/i, 'abs obliques abdomen abdominal core'],
  [/psoas|iliacus/i, 'iliopsoas hip flexor'],
  [/diaphragm/i, 'breathing respiration inspiration'],
  [/intercostal/i, 'ribs breathing respiration chest'],
  [/scalenus/i, 'scalenes neck accessory breathing'],
  [/sternocleidomastoid/i, 'scm neck accessory breathing'],
  [/masseter|temporalis|pterygoid/i, 'chewing mastication jaw'],
  [/rectus_muscle|oblique_muscle\b|superior_oblique|inferior_oblique|levator_palpebrae/i, 'eye extraocular eye movement'],
  [/orbicularis_oculi/i, 'eyelid eye blink'],
  [/orbicularis_oris|buccinator|zygomaticus|risorius|depressor|levator_labii|levator_anguli|mentalis/i, 'face facial expression mouth'],
  [/frontalis|occipitalis|corrugator|procerus/i, 'face forehead scalp facial expression'],
  [/coccygeus|levator_ani|anal_sphincter|perine|bulbospongiosus|ischiocavernosus/i, 'pelvic floor kegel'],
  [/erector|iliocostalis|longissimus|spinalis|multifidus|rotatores/i, 'erector spinae back spine'],
  [/pharyngeal|arytenoid|cricothyroid|thyroarytenoid/i, 'throat larynx swallowing voice'],
  [/flexor_.*(digit|pollicis|carpi)|extensor_.*(digit|pollicis|carpi|indicis)|pronator|supinator|palmaris/i, 'forearm wrist hand fingers'],
  [/(lumbrical|interosse|digiti_minimi_of_hand|pollicis_brevis|adductor_pollicis|opponens)/i, 'hand'],
  [/hallucis|digitorum_brevis|plantar|digiti_minimi_of_foot/i, 'foot toes'],
];

const PEARLS = [
  [/deltoid_muscle/i, 'Deltoid IM site: about 2–3 fingerbreadths (2.5–5 cm) below the acromion process. Used for most adult vaccines. Keep volumes small, typically up to 1 mL.'],
  [/^vastus_lateralis/i, 'Preferred IM site for infants and young children: the middle third of the anterolateral thigh.'],
  [/^gluteus_medius/i, 'The ventrogluteal site targets gluteus medius. It is the preferred adult IM site because it is away from the sciatic nerve and major vessels.'],
  [/^gluteus_maximus/i, 'The dorsogluteal site over gluteus maximus is generally avoided for IM injections because of the risk of sciatic nerve injury.'],
  [/^diaphragm$/i, 'The main muscle of inspiration, supplied by the phrenic nerve (C3–C5): "C3, 4, 5 keeps the diaphragm alive." Spinal cord injury at or above this level may require mechanical ventilation.'],
  [/sternocleidomastoid/i, 'An accessory muscle of breathing. Visible use signals respiratory distress. Shrugging and head turning against resistance test cranial nerve XI.'],
  [/scalenus/i, 'An accessory muscle of breathing. Use at rest suggests increased work of breathing.'],
  [/trapezius/i, 'Shoulder shrug against resistance tests cranial nerve XI (spinal accessory).'],
  [/gastrocnemius|^soleus/i, 'Achilles reflex tests S1. Unilateral calf pain, swelling and warmth: assess for DVT (Homans sign is not reliable).'],
  [/calcaneal_tendon/i, 'The Achilles (calcaneal) tendon. The ankle-jerk reflex tests S1.'],
  [/^rectus_femoris|^vastus_(medialis|intermedius)/i, 'The patellar (knee-jerk) reflex tests L2–L4 through the quadriceps.'],
  [/biceps_brachii/i, 'The biceps reflex tests C5–C6.'],
  [/triceps_brachii/i, 'The triceps reflex tests C6–C7.'],
  [/^psoas_major|^iliacus/i, 'Psoas sign: pain with passive extension of the right hip suggests appendicitis.'],
  [/coccygeus|levator_ani/i, 'Pelvic floor muscle training (Kegel exercises) strengthens these muscles and helps stress urinary incontinence.'],
  [/frontalis|orbicularis_oculi/i, 'Facial nerve (CN VII). In Bell palsy the patient cannot wrinkle the forehead or fully close the eye. Protect the cornea with lubricating drops and an eye patch.'],
  [/^lateral_rectus/i, 'Supplied by CN VI (abducens). Remember "LR6 SO4": lateral rectus CN VI, superior oblique CN IV, all others CN III.'],
  [/^superior_oblique/i, 'Supplied by CN IV (trochlear). Remember "LR6 SO4".'],
  [/masseter$/i, 'Trismus (lockjaw) from masseter spasm is a classic early sign of tetanus.'],
  [/^external_intercostal/i, 'External intercostals lift the ribs during inspiration.'],
];

export const MUSCLE_REGIONS = {
  skull: 'Head', neck: 'Neck', spine: 'Back', thorax: 'Thorax', upper: 'Upper limb', pelvis: 'Abdomen & pelvis', lower: 'Lower limb',
};

const LOWER = /femoris|vastus|gluteus|tibialis|fibularis|peroneus|gastrocnemius|soleus|hallucis|of_foot|plantar|adductor_(longus|brevis|magnus|minimus)|gracilis|sartorius|iliotibial|popliteus|tensor_fasciae|pectineus|piriformis|gemellus|obturator|quadratus_femoris|plantaris|patellar|infrapatellar|prepatellar|suprapatellar|anserine|crural|fascia_lata|calcaneal|malleolus|of_leg|digitorum_longus|digitorum_brevis|semimembranosus|semitendinosus|trochanteric/i;
const UPPER = /brachii|brachialis|brachioradialis|carpi|pollicis|of_hand|indicis|digitorum_(superficialis|profundus)|extensor_digitorum$|extensor_digiti_minimi|pronator|supinator|palmar|antebrachial|brachial_fascia|of_arm|deltoid|supraspinatus|infraspinatus|teres|subscapularis|subacromial|subdeltoid|acromial|of_wrist|lumbrical|interosse|metacarpal|bicipitoradial|coracobrachial/i;

// Region needs the mesh position: c = centre {x,y,z}; spineZAt(y) = z of the vertebral column at that height
export function regionOfMuscle(base, c, spineZAt, f) {
  const ax = Math.abs(c.x);
  if (c.y < 0.62 || LOWER.test(base)) return 'lower';
  if (UPPER.test(base) || (ax > 0.17 && c.y > 0.62)) return 'upper';
  const behind = (c.z - spineZAt(c.y)) * f < 0.005;
  if (c.y > 1.62) return 'skull';
  if (c.y > 1.5 && !behind) return 'skull';
  if (c.y > 1.4) return 'neck';
  if (behind) return 'spine';
  if (c.y > 1.12) return 'thorax';
  return 'pelvis';
}

export function describeMuscle(raw) {
  const side = raw.endsWith('.r') ? 'right' : raw.endsWith('.l') ? 'left' : null;
  const base = raw.replace(/\.(l|r)$/, '').replace(/[()]/g, '');
  let label = base.replace(/_muscles?\b/g, '').replace(/_/g, ' ').replace(/\s+-\s+/g, ' / ').replace(/\s+/g, ' ').trim();
  label = label.replace(/^./, c => c.toUpperCase());
  const conn = CONNECTIVE.test(base);
  let words = '';
  for (const [re, w] of ALIASES) if (re.test(base)) words += ' ' + w;
  const pearl = (PEARLS.find(([re]) => re.test(base)) || [])[1] || null;
  return {
    raw, base, side, pearl, system: 'muscle', conn,
    region: null, sub: conn ? 'Connective tissue' : 'Muscle',
    label: side ? `${label} (${side})` : label,
    search: norm(`${label} ${base} ${words} ${conn ? 'fascia connective' : 'muscle muscles'} ${side || ''}`),
  };
}

const R = re => b => b.system === 'muscle' && re.test(b.base);
export const MUSCLE_GROUPS = [
  { label: 'Quadriceps (quads)', words: 'quadriceps quads thigh', test: R(/^(rectus_femoris|vastus_)/i) },
  { label: 'Hamstrings', words: 'hamstrings', test: R(/^(long_head_of_biceps_femoris|short_head_of_biceps_femoris|semitendinosus_muscle|semimembranosus_muscle)/i) },
  { label: 'Rotator cuff (SITS)', words: 'rotator cuff sits', test: R(/^(supraspinatus|infraspinatus|teres_minor|subscapularis)_muscle/i) },
  { label: 'Gluteal muscles', words: 'glutes gluteal buttock', test: R(/^gluteus_(maximus|medius|minimus)_muscle/i) },
  { label: 'Calf (triceps surae)', words: 'calf triceps surae', test: R(/(gastrocnemius$|^soleus_muscle)/i) },
  { label: 'Adductors (groin)', words: 'adductors groin inner thigh', test: R(/^(adductor_(longus|brevis|magnus|minimus)|gracilis_muscle|pectineus)/i) },
  { label: 'Abdominal wall', words: 'abs abdominal wall core', test: R(/^(rectus_abdominis|external_abdominal_oblique|internal_abdominal_oblique|transversus_abdominis)/i) },
  { label: 'Deltoid', words: 'deltoid delts', test: R(/part_of_deltoid_muscle$/i) },
  { label: 'Trapezius', words: 'trapezius traps', test: R(/part_of_trapezius_muscle$/i) },
  { label: 'Pectoralis major', words: 'pecs pectoralis major chest', test: R(/of_pectoralis_major_muscle$/i) },
  { label: 'Biceps brachii', words: 'biceps', test: R(/head_of_biceps_brachii$/i) },
  { label: 'Triceps brachii', words: 'triceps', test: R(/head_of_triceps_brachii$/i) },
  { label: 'Hip flexors (iliopsoas)', words: 'hip flexors iliopsoas', test: R(/^(psoas_major|iliacus_muscle)/i) },
  { label: 'Muscles of breathing', words: 'breathing respiration respiratory accessory muscles', test: R(/^(diaphragm$|external_intercostal|internal_intercostal|innermost_intercostal|scalenus|sternocleidomastoid)/i) },
  { label: 'Accessory muscles of breathing', words: 'accessory muscles breathing respiratory distress', test: R(/^(scalenus|sternocleidomastoid)/i) },
  { label: 'Muscles of mastication', words: 'chewing mastication jaw', test: R(/^(deep_part_of_masseter|superficial_part_of_masseter|temporalis_muscle|medial_pterygoid|.*lateral_pterygoid)/i) },
  { label: 'Extraocular muscles', words: 'extraocular eye muscles', test: R(/^(lateral|medial|superior|inferior)_(rectus|oblique)_muscle$/i) },
  { label: 'Pelvic floor', words: 'pelvic floor levator ani kegel', test: R(/^(coccygeus|iliococcygeus|pubococcygeus)_muscle/i) },
  { label: 'Erector spinae', words: 'erector spinae back', test: R(/^(iliocostalis|longissimus|spinalis)_/i) },
  { label: 'Muscles of the face', words: 'facial expression face', test: b => b.system === 'muscle' && !b.conn && b.region === 'skull' && !/rectus|oblique|levator_palpebrae|masseter|temporalis|pterygoid/i.test(b.base) },
];
