import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { describe, REGIONS, GROUPS as BONE_GROUPS, score } from './bones.js';
import { describeMuscle, regionOfMuscle, MUSCLE_GROUPS, MUSCLE_REGIONS } from './muscles.js';
import { norm } from './bones.js';
import ALL_NAMES from './all_names.json';
import { SYSTEMS, describeExtra, colorFor, EXTRA_GROUPS } from './systems.js';
const MUSCLE_NAMES = ALL_NAMES.muscle;
const EXTRA_IDS = Object.keys(SYSTEMS);

const $ = s => document.querySelector(s);
const stage = $('#stage');
const GROUPS = [...BONE_GROUPS, ...MUSCLE_GROUPS, ...EXTRA_GROUPS];

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const isTouch = matchMedia('(pointer: coarse)').matches;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.3;
const key = new THREE.DirectionalLight(0xfff4e6, 2.3);
const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x2a2018, 0.35);
key.castShadow = true;
key.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
key.shadow.bias = -0.0012;
key.shadow.normalBias = 0.012;
key.shadow.radius = 3;
scene.add(key, key.target, hemi);

const camera = new THREE.PerspectiveCamera(35, 1, 0.005, 50);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.zoomToCursor = true;
controls.minDistance = 0.04;
controls.maxDistance = 5;
controls.screenSpacePanning = true;

const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
// depth shading (ambient occlusion): darkens creases so detail reads without zooming
const ao = new GTAOPass(scene, camera, 1, 1);
ao.output = GTAOPass.OUTPUT.Default;
ao.blendIntensity = 1;
ao.updateGtaoMaterial({ radius: 0.05, distanceExponent: 1.2, thickness: 1.5, scale: 2.2, samples: 16, distanceFallOff: 1 });
ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 });
ao.enabled = true;
composer.addPass(ao);
const outline = new OutlinePass(new THREE.Vector2(1, 1), scene, camera);
Object.assign(outline, { edgeStrength: 5, edgeGlow: 0.9, edgeThickness: 2.2, pulsePeriod: 0 });
outline.visibleEdgeColor.set(0x3fd0ff);
outline.hiddenEdgeColor.set(0x16607e);
composer.addPass(outline);
composer.addPass(new OutputPass());

let ready = false;
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(w, h);
  outline.setSize(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  ao.setSize(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  camera.aspect = w / h;
  if (ready) updateOffset(); else camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ---------- materials ----------
const mk = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.58, metalness: 0, ...extra });
const BASE = {
  bone: mk(0xdccaa9, { roughness: 0.68 }), tooth: mk(0xf6f1e4, { roughness: 0.3 }), cart: mk(0xaecbd3, { roughness: 0.4 }),
  muscle: mk(0xb04a40, { roughness: 0.5 }), conn: mk(0xe2dccf, { roughness: 0.45 }),
};
const variant = fn => Object.fromEntries(Object.entries(BASE).map(([k, m]) => { const d = m.clone(); fn(d); return [k, d]; }));
const DIM = variant(d => { d.transparent = true; d.opacity = 0.09; d.depthWrite = false; });
DIM.muscle.opacity = 0.045; DIM.conn.opacity = 0.03;
const HOVER = variant(d => { d.emissive.set(0x1b4c5e); d.emissiveIntensity = 0.6; });
const matCache = new Map();
function matsFor(color, { opacity = 1 } = {}) {
  const key = color + ':' + opacity;
  if (matCache.has(key)) return matCache.get(key);
  const base = mk(color, { roughness: 0.55 });
  if (opacity < 1) { base.transparent = true; base.opacity = opacity; base.depthWrite = false; }
  const dim = base.clone(); dim.transparent = true; dim.opacity = Math.min(0.08, opacity * 0.1); dim.depthWrite = false;
  const hover = base.clone(); hover.emissive.set(0x1b4c5e); hover.emissiveIntensity = 0.6;
  const m = { base, dim, hover };
  matCache.set(key, m);
  return m;
}
const attachMat = (color, hl) => mk(color, { roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
  ...(hl ? { depthTest: false, emissive: new THREE.Color(color), emissiveIntensity: 0.45 } : {}) });
const ATT = { origin: attachMat(0xe5484d), insertion: attachMat(0x3f7dff) };
const ATT_HL = { origin: attachMat(0xff5a5f, true), insertion: attachMat(0x5a90ff, true) };
const ATT_DIM = { origin: ATT.origin.clone(), insertion: ATT.insertion.clone() };
for (const d of Object.values(ATT_DIM)) { d.transparent = true; d.opacity = 0.15; d.depthWrite = false; }
const SEL = mk(0xeaf8ff, { emissive: new THREE.Color(0x14a9e8), emissiveIntensity: 0.5, roughness: 0.4 });
// distinct tints so members of a selected group can be told apart
const SEL_TINTS = [0xeaf8ff, 0xffe3c2, 0xc8f5dc, 0xe6d6ff, 0xfff2b0, 0xffd0dc, 0xc6e4ff, 0xe2f7c0].map(c => mk(c, { emissive: new THREE.Color(0x14a9e8), emissiveIntensity: 0.25, roughness: 0.45 }));
const SOFT = ['muscle', 'conn'];
function setMuscleOpacity(v) {
  for (const set of [BASE, HOVER]) for (const k of SOFT) {
    set[k].opacity = v; set[k].transparent = v < 0.99; set[k].depthWrite = v > 0.6; set[k].needsUpdate = true;
  }
}

// ---------- state ----------
// entries: every searchable structure, loaded or not. mesh is filled in once its system loads.
const entries = [];
for (const raw of MUSCLE_NAMES) entries.push({ info: describeMuscle(raw), mesh: null });
for (const sys of EXTRA_IDS) for (const raw of ALL_NAMES[sys] || []) entries.push({ info: describeExtra(raw, sys), mesh: null });
const meshes = [];
const loaded = { bone: false, muscle: false, attach: false, ...Object.fromEntries(EXTRA_IDS.map(k => [k, false])) };
const attachMeshes = [];
const layers = { bone: true, muscle: false, cart: false, conn: false, attach: false, ...Object.fromEntries(EXTRA_IDS.map(k => [k, false])) };
let muscleOpacity = 1;
let selected = new Set();
let hovered = null;
let fade = true;
let shadows = true, aoWanted = true, moveMode = false, pointerOn = false;
let locked = null;
const shownRegions = new Set(REGIONS.map(r => r.id));
let side = 'both';           // both | left | right (patient's side)
let glow = 1;                // highlight glow 0..1
const selBase = new THREE.Color(), SEL_WHITE = new THREE.Color(0xeaf8ff);
let limits = { wrist: 0.84, ankle: 0.09 };
// a structure can belong to a main region plus a sub-region (e.g. arm + hand)
const regionsOf = info => info.regions || [info.region];
const regionShown = info => regionsOf(info).some(r => shownRegions.has(r));
function addSubRegion(m) {
  const info = m.userData.info;
  const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
  info.regions = [info.region];
  if (info.region === 'upper' && c.y < limits.wrist) info.regions.push('hand');
  if (info.region === 'lower' && c.y < limits.ankle) info.regions.push('foot');
}
let home = null;
const bodyCenter = new THREE.Vector3(), front = new THREE.Vector3(0, 0, 1);
let spineZ = 0;
let spineTable = [];
const spineZAt = y => { let best = null; for (const p of spineTable) if (!best || Math.abs(p[0] - y) < Math.abs(best[0] - y)) best = p; return best ? best[1] : spineZ; };

const userHidden = new Set();          // parts unticked in the Parts list
const keyOf = info => info.system + ':' + info.raw;
let isolate = false;
const isShown = m => {
  if (userHidden.has(keyOf(m.userData.info))) return false;
  const u = m.userData;
  return layers[u.info.system] && regionShown(u.info) && (side === 'both' || !u.info.side || u.info.side === side) && (u.kind !== 'cart' || layers.cart) && (u.kind !== 'conn' || layers.conn);
};

function refresh() {
  for (const m of meshes) {
    m.visible = isShown(m);
    if (!m.visible) selected.delete(m);
  }
  if (!selected.size) isolate = false;
  if (isolate) for (const m of meshes) if (!selected.has(m)) m.visible = false;
  $('#isolate').classList.toggle('on', isolate);
  $('#isolate-label').textContent = isolate ? 'Show all' : 'Isolate';
  if (partsOpen) syncParts();
  const hl = new Set();
  for (const m of selected) for (const a of m.userData.attach || []) hl.add(a);
  for (const a of attachMeshes) {
    const t = a.userData.kind;
    const on = layers.attach && layers.bone && regionShown(a.userData.info) && (side === 'both' || !a.userData.info.side || a.userData.info.side === side);
    a.visible = hl.has(a) || on;
    a.material = hl.has(a) ? ATT_HL[t] : selected.size && fade ? ATT_DIM[t] : ATT[t];
    a.renderOrder = hl.has(a) ? 10 : 3;
  }
  const nO = [...hl].filter(a => a.userData.kind === 'origin').length, nI = hl.size - nO;
  $('#attach-legend').hidden = !hl.size;
  if (hl.size) $('#attach-legend').innerHTML = `<i class="dot o"></i>Origin${nO > 1 ? 's' : ''} (${nO}) <i class="dot i"></i>Insertion${nI > 1 ? 's' : ''} (${nI}) <span>shown on the bones</span>`;
  const selList = [...selected];
  for (const m of meshes) {
    const k = m.userData.kind;
    const mt = m.userData.mats;
    m.castShadow = shadows && m.visible && !(selected.size && fade && !selected.has(m)) && m.userData.info.system !== 'region' && k !== 'conn';
    m.receiveShadow = shadows;
    m.material = selected.has(m) ? (selected.size > 1 ? SEL_TINTS[selList.indexOf(m) % SEL_TINTS.length] : SEL) : selected.size && fade ? (mt ? mt.dim : DIM[k]) : m === hovered ? (mt ? mt.hover : HOVER[k]) : (mt ? mt.base : BASE[k]);
  }
  outline.selectedObjects = [...selected];
  const first = selList[0];
  selBase.copy(first ? (first.userData.mats ? first.userData.mats.base.color : (BASE[first.userData.kind] || BASE.bone).color) : BASE.bone.color);
  for (const c of document.querySelectorAll('.chip[data-r]')) c.classList.toggle('on', shownRegions.has(c.dataset.r));
  $('#chip-all').classList.toggle('on', shownRegions.size === REGIONS.length);
  $('#fade').classList.toggle('on', fade);
  for (const b of document.querySelectorAll('#side button')) b.classList.toggle('on', b.dataset.s === side);
  const regs = REGIONS.filter(r => shownRegions.has(r.id));
  const summ = [regs.length === REGIONS.length ? '' : regs.length <= 2 ? regs.map(r => r.label).join(' + ') : `${regs.length} regions`, side === 'both' ? '' : side === 'left' ? 'Left' : 'Right'].filter(Boolean).join(' · ');
  $('#qs-sum').textContent = summ;
  $('#qs-btn').classList.toggle('active', !!summ);
  $('#layers-btn').classList.toggle('on', layersPanel.classList.contains('shown'));
  $('#move').classList.toggle('on', moveMode);
  $('#ptr-btn').classList.toggle('on', pointerOn);
  $('#L-shadow').checked = shadows; $('#L-ao').checked = ao.enabled;
  ao.enabled = aoWanted && !(selected.size && fade);
  for (const k of Object.keys(layers)) $('#L-' + k).checked = layers[k];
  $('#opwrap').hidden = !layers.muscle;
  $('#lock-label').textContent = locked ? 'Unlock' : 'Focus & lock';
  $('#lock').classList.toggle('primary', !!locked);
  $('#lockbar').hidden = !locked;
  if (locked) $('#lock-what').textContent = locked;
  $('#count').textContent = `${entries.length.toLocaleString()} structures · 10 systems`;
}

// ---------- loading (models ship as <script> files so the app also opens from a local folder) ----------
const pending = {};
function loadScript(src) {
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => fail(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}
function loadSystem(sys) {
  if (pending[sys]) return pending[sys];
  return (pending[sys] = (async () => {
    await loadScript(`${sys}.data.js`);
    const b64 = window.__ANATOMY[sys];
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    delete window.__ANATOMY[sys];
    const gltf = await new Promise((ok, fail) => new GLTFLoader().parse(bytes.buffer, '', ok, fail));
    addSystem(sys, gltf.scene);
    loaded[sys] = true;
  })());
}
function addSystem(sys, root) {
  const list = [];
  if (sys === 'attach') return addAttach(root);
  root.traverse(o => {
    if (!o.isMesh) return;
    const raw = o.userData.id || o.parent?.userData.id || o.name;
    if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
    let info;
    if (sys === 'bone') {
      info = describe(raw);
      o.userData.kind = /cartilage/i.test(raw) ? 'cart' : info.region === 'teeth' ? 'tooth' : 'bone';
      entries.push({ info, mesh: o });
    } else if (sys === 'muscle') {
      const e = entries.find(e => e.info.raw === raw && !e.mesh) || (entries.push({ info: describeMuscle(raw), mesh: null }), entries.at(-1));
      info = e.info;
      e.mesh = o;
      o.userData.kind = info.conn ? 'conn' : 'muscle';
    } else {
      // a few head vessels were exported with the heart: file them under blood vessels
      const rs = sys === 'heart' && /^(Cavernous_sinus|Basilar_venous_plexus|Anterior_communicating_artery)/.test(raw) ? 'vessel' : sys;
      const e = entries.find(e => e.info.system === rs && e.info.raw === raw && !e.mesh) || (entries.push({ info: describeExtra(raw, rs), mesh: null }), entries.at(-1));
      info = e.info;
      e.mesh = o;
      o.userData.kind = info.conn ? 'conn' : 'tissue';
      o.userData.mats = matsFor(colorFor(info.system, info.base, list.length), { opacity: sys === 'region' ? 0.6 : info.conn ? 0.5 : 1 });
    }
    o.userData.info = info;
    o.renderOrder = sys === 'region' ? 5 : sys === 'muscle' ? 2 : 1;
    list.push(o);
  });
  scene.add(root);
  root.updateMatrixWorld(true);
  if (sys !== 'bone') {
    const c = new THREE.Vector3();
    for (const m of list) {
      new THREE.Box3().setFromObject(m).getCenter(c);
      m.userData.info.region = regionOfMuscle(m.userData.info.base, c, spineZAt, Math.sign(front.z) || 1);
      const reg = MUSCLE_REGIONS[m.userData.info.region];
      addSubRegion(m);
      m.userData.info.sub = sys !== 'muscle' ? `${SYSTEMS[m.userData.info.system].label} · ${reg}` : m.userData.info.conn ? `Connective tissue · ${reg}` : `${reg} muscle`;
    }
  }
  meshes.push(...list);
  linkAttach();
}

// Z-Anatomy attachment patches are named like "Sternocleidomastoid_muscle.o1r": o = origin, e = insertion, then side.
const mkey = s => s.toLowerCase().replace(/[()]/g, '').replace(/_muscles?\b/g, '').replace(/_+$/, '');
function addAttach(root) {
  scene.add(root);
  root.updateMatrixWorld(true);
  const c = new THREE.Vector3();
  root.traverse(o => {
    if (!o.isMesh) return;
    const raw = o.userData.id || o.parent?.userData.id || o.name;
    const m = raw.match(/^(.*)\.(o|e)(\d*)([lr]?)$/);
    if (!m) return;
    const kind = m[2] === 'o' ? 'origin' : 'insertion';
    const side = m[4] === 'r' ? 'right' : m[4] === 'l' ? 'left' : null;
    const name = m[1].replace(/[()]/g, '');
    const pretty = name.replace(/_muscles?\b/g, '').replace(/_/g, ' ').trim();
    new THREE.Box3().setFromObject(o).getCenter(c);
    o.userData.kind = kind;
    o.userData.key = mkey(name);
    o.userData.info = {
      raw, base: name, side, system: 'attach', pearl: null,
      label: `${kind === 'origin' ? 'Origin' : 'Insertion'} of ${pretty.charAt(0).toLowerCase() + pretty.slice(1)}${side ? ` (${side})` : ''}`,
      sub: kind === 'origin' ? 'Muscle origin' : 'Muscle insertion',
      region: regionOfMuscle(name, c, spineZAt, Math.sign(front.z) || 1),
    };
    o.visible = false;
    addSubRegion(o);
    attachMeshes.push(o);
  });
  linkAttach();
}
// attachments Z-Anatomy tags at group level -> member muscles
const ATT_ALIAS = {
  iliopsoas: /^(psoas_major|iliacus)$/,
  erector_spinae: /^(iliocostalis|longissimus|spinalis)_/,
  quadriceps_femoris: /^(rectus_femoris|vastus_(lateralis|medialis|intermedius))$/,
  triceps_surae: /(gastrocnemius$|^soleus$)/,
  levator_ani: /^(iliococcygeus|pubococcygeus|pubo-analis|puborectalis)$/,
  common_flexor_tendon: /^(flexor_carpi_radialis|palmaris_longus|humeral_head_of_flexor_carpi_ulnaris|humero-ulnar_head_of_flexor_digitorum_superficialis|superficial_head_of_pronator_teres)$/,
  common_extensor_tendon: /^(extensor_carpi_radialis_brevis|extensor_digitorum|extensor_digiti_minimi|humeral_head_of_extensor_carpi_ulnaris)$/,
};
function linkAttach() {
  if (!attachMeshes.length) return;
  for (const mu of meshes) {
    if (mu.userData.info.system !== 'muscle') continue;
    const k = mkey(mu.userData.info.base), side = mu.userData.info.side;
    mu.userData.attach = attachMeshes.filter(a => {
      const ak = a.userData.key;
      return (k === ak || k.endsWith('_' + ak) || (ATT_ALIAS[ak] && ATT_ALIAS[ak].test(k))) && (!side || !a.userData.info.side || side === a.userData.info.side);
    });
    for (const a of mu.userData.attach) (a.userData.owners ||= new Set()).add(mu);
  }
}

async function ensureLayer(sys) {
  if (layers[sys] && loaded[sys]) return;
  layers[sys] = true;
  if (!loaded[sys]) {
    const lab = $('#load-' + sys) || { textContent: '' };
    lab.textContent = 'loading…';
    $('#busy-text').textContent = `Loading ${sys === 'attach' ? 'origins & insertions' : sys === 'muscle' ? 'muscles' : SYSTEMS[sys].label.toLowerCase()}…`;
    $('#busy').hidden = false;
    try { await loadSystem(sys); if (sys === 'vessel') await loadSystem('heart'); lab.textContent = ''; }
    catch (err) { console.error(err); lab.textContent = 'failed to load'; layers[sys] = false; }
    $('#busy').hidden = true;
  }
  refresh();
}

// ---------- camera ----------
let tween = null;
let lastRadius = 0.1;
controls.addEventListener('start', () => (tween = null));
function flyTo(pos, tgt, ms = 950) {
  tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: tgt, start: performance.now(), ms };
}
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const info = $('#info');

// Left rail of tool buttons sits under the top block; panels and camera framing avoid it.
function placeUI() {
  const narrow = innerWidth < 720;
  const rail = $('#tools'), lay = $('#layers');
  const top = $('#top').getBoundingClientRect().bottom + 10;
  rail.style.top = top + 'px';
  if (narrow) {
    const r = rail.getBoundingClientRect();
    lay.style.top = top + 'px';
    lay.style.left = r.right + 8 + 'px';
    lay.style.maxHeight = innerHeight - top - 10 + 'px';
  } else { lay.style.top = ''; lay.style.left = ''; lay.style.maxHeight = ''; }
}
const placeMobileUI = placeUI;
function freeArea() {
  placeUI();
  const H = stage.clientHeight, W = stage.clientWidth;
  let top = 0, bottom = H, left = 0, right = W;
  if (innerWidth < 720) {
    top = $('#top').getBoundingClientRect().bottom + 6;
    left = $('#tools').getBoundingClientRect().right + 4;
    if (!info.hidden) bottom = info.getBoundingClientRect().top - 6;
  }
  return { top, bottom, left, right, H, W };
}
function updateOffset() {
  const { top, bottom, left, right, H, W } = freeArea();
  const sy = H / 2 - (top + bottom) / 2, sx = W / 2 - (left + right) / 2;
  if (Math.abs(sy) < 1 && Math.abs(sx) < 1) camera.clearViewOffset();
  else camera.setViewOffset(W, H, sx, sy, W, H);
  camera.updateProjectionMatrix();
}
function fitDist(radius, factor) {
  const { top, bottom, left, right, H, W } = freeArea();
  const vf = THREE.MathUtils.degToRad(camera.fov);
  const vfFree = 2 * Math.atan(Math.tan(vf / 2) * Math.max(0.25, (bottom - top) / H));
  const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect * Math.max(0.4, (right - left) / W));
  return Math.max((radius / Math.sin(Math.min(vfFree, hf) / 2)) * factor, 0.06);
}
function frame(list) {
  updateOffset();
  const box = new THREE.Box3();
  list.forEach(m => box.expandByObject(m));
  const s = box.getBoundingSphere(new THREE.Sphere());
  const dist = fitDist(s.radius, list.length === 1 ? 1.9 : 1.15);
  const cur = camera.position.clone().sub(controls.target).normalize();
  const out = new THREE.Vector3(s.center.x - bodyCenter.x, 0, s.center.z - bodyCenter.z);
  // groups spanning both sides: keep the current viewing side
  if (out.length() < 0.015 || box.max.x - box.min.x > 0.2) out.copy(front).multiplyScalar(Math.sign(cur.dot(front)) || 1);
  out.normalize();
  const dir = cur.multiplyScalar(0.4).add(out.multiplyScalar(0.6)).add(new THREE.Vector3(0, 0.12, 0)).normalize();
  lastRadius = s.radius;
  flyTo(s.center.clone().add(dir.multiplyScalar(dist)), s.center.clone());
}

// ---------- selection ----------
function select(list, { zoom = false, title = null } = {}) {
  for (const m of list) {
    if (!regionShown(m.userData.info)) shownRegions.add(m.userData.info.region);
    if (side !== 'both' && m.userData.info.side && m.userData.info.side !== side) side = 'both';
    if (m.userData.kind === 'cart') layers.cart = true;
    if (m.userData.kind === 'conn') layers.conn = true;
    layers[m.userData.info.system] = true;
  }
  selected = new Set(list);
  refresh();
  showInfo(list, title);
  if (!loaded.attach && list.some(m => m.userData.info.system === 'muscle')) loadSystem('attach').then(refresh).catch(console.error);
  if (zoom && list.length) {
    frame(list);
    if (locked) { locked = title || list[0].userData.info.label; controls.minDistance = Math.max(0.04, lastRadius * 0.85); refresh(); }
  }
}
function clearSel() { selected = new Set(); refresh(); showInfo([]); }

function showInfo(list, title) {
  if (!list.length) { info.hidden = true; updateOffset(); return; }
  info.hidden = false;
  const one = list.length === 1 ? list[0].userData.info : null;
  $('#info-title').textContent = title || one.label;
  $('#info-sub').textContent = one ? [one.sub, one.side && `${one.side} side`].filter(Boolean).join(' · ') : `${list.length} structures selected`;
  $('#info-raw').textContent = one ? `Model ID: ${one.raw}` : '';
  const pearls = new Set(list.map(m => m.userData.info.pearl));
  const pearl = one ? one.pearl : pearls.size === 1 ? [...pearls][0] : null;
  $('#pearl').hidden = !pearl;
  if (pearl) $('#pearl-text').textContent = pearl;
  updateOffset();
}
$('#info-zoom').onclick = () => {
  if (!selected.size) return;
  frame([...selected]);
  if (locked) { locked = $('#info-title').textContent; refresh(); }
};
$('#info-close').onclick = clearSel;
$('#isolate').onclick = () => { isolate = !isolate; refresh(); };

// ---------- picking ----------
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function pick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(meshes.filter(m => m.visible).concat(attachMeshes.filter(a => a.visible)), false);
  if (selected.size && fade) { const h = hits.find(h => selected.has(h.object)); if (h) return h.object; }
  // see-through muscles: clicks go to the bone underneath
  if (layers.muscle && muscleOpacity < 0.6) { const h = hits.find(h => h.object.userData.info.system === 'bone'); if (h) return h.object; }
  return hits[0]?.object || null;
}
let down = null, lastTap = 0;
const tip = $('#tip');
renderer.domElement.addEventListener('pointerdown', e => (down = { x: e.clientX, y: e.clientY }));
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
  const m = pick(e);
  const now = performance.now();
  const dbl = now - lastTap < 320;
  lastTap = now;
  selectPicked(m, dbl);
});
let moveQueued = null;
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || e.buttons) { tip.hidden = true; return; }
  moveQueued = e;
});
renderer.domElement.addEventListener('pointerleave', () => { moveQueued = null; hovered = null; tip.hidden = true; refresh(); });
function hoverAt(x, y, tipX, tipY) {
  const m = pick({ clientX: x, clientY: y });
  if (m !== hovered) { hovered = m; refresh(); }
  tip.hidden = !m;
  if (m) {
    tip.textContent = m.userData.info.label;
    const w = tip.offsetWidth;
    tip.style.transform = `translate(${Math.min(Math.max(6, tipX), innerWidth - w - 6)}px, ${Math.max(6, tipY)}px)`;
  }
  return m;
}
function doHover() {
  const e = moveQueued; moveQueued = null;
  const m = hoverAt(e.clientX, e.clientY, e.clientX + 14, e.clientY + 14);
  renderer.domElement.style.cursor = m ? 'pointer' : moveMode ? 'move' : 'grab';
}
function selectPicked(m, dbl) {
  if (m && m.userData.info.system === 'attach') {
    ensureLayer('muscle').then(() => {
      const owners = [...(m.userData.owners || [])];
      const name = m.userData.info.label.replace(/^(Origin|Insertion) of /, '').replace(/^./, c => c.toUpperCase());
      select(owners.length ? owners : [m], { zoom: dbl, title: owners.length > 1 ? name : null });
    });
  } else if (m) select([m], { zoom: dbl });
  else if (!dbl) clearSel();
}

// ---------- pointer tool: a draggable arrow; its tip picks, tap the tail to select ----------
const ptr = $('#ptr'), ptrHandle = $('#ptr-handle');
const PTR_OFF = { x: 46, y: 62 };          // tail grip position relative to the arrow tip
let ptrPos = { x: innerWidth / 2, y: innerHeight / 2 }, ptrDrag = null, ptrLastTap = 0;
function placePointer() {
  ptrPos.x = Math.min(Math.max(4, ptrPos.x), innerWidth - PTR_OFF.x - 20);
  ptrPos.y = Math.min(Math.max(4, ptrPos.y), innerHeight - PTR_OFF.y - 20);
  ptr.style.transform = `translate(${ptrPos.x}px, ${ptrPos.y}px)`;
  const m = hoverAt(ptrPos.x, ptrPos.y, ptrPos.x - 20, ptrPos.y - 40);
  ptr.classList.toggle('hit', !!m);
}
ptrHandle.addEventListener('pointerdown', e => {
  e.preventDefault(); e.stopPropagation();
  ptrHandle.setPointerCapture(e.pointerId);
  ptrDrag = { sx: e.clientX, sy: e.clientY, px: ptrPos.x, py: ptrPos.y, moved: false };
});
ptrHandle.addEventListener('pointermove', e => {
  if (!ptrDrag) return;
  const dx = e.clientX - ptrDrag.sx, dy = e.clientY - ptrDrag.sy;
  if (Math.hypot(dx, dy) > 5) ptrDrag.moved = true;
  ptrPos = { x: ptrDrag.px + dx, y: ptrDrag.py + dy };
  placePointer();
});
ptrHandle.addEventListener('pointerup', e => {
  if (!ptrDrag) return;
  const tap = !ptrDrag.moved;
  ptrDrag = null;
  if (!tap) return;
  const now = performance.now(), dbl = now - ptrLastTap < 350;
  ptrLastTap = now;
  selectPicked(pick({ clientX: ptrPos.x, clientY: ptrPos.y }), dbl);
});
function setPointer(on) {
  pointerOn = on;
  ptr.hidden = !on;
  if (on) placePointer(); else { tip.hidden = true; hovered = null; }
  refresh();
}
$('#ptr-btn').onclick = () => setPointer(!pointerOn);

// ---------- move (hand) mode: one finger / left-drag slides the model instead of rotating ----------
function setMove(on) {
  if (on && locked) { locked = null; controls.enablePan = true; controls.zoomToCursor = true; controls.minDistance = 0.04; }
  moveMode = on;
  controls.mouseButtons.LEFT = on ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
  controls.mouseButtons.RIGHT = on ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
  controls.touches.ONE = on ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
  renderer.domElement.style.cursor = on ? 'move' : 'grab';
  refresh();
}
$('#move').onclick = () => setMove(!moveMode);

// ---------- search ----------
const input = $('#q'), list = $('#results');
let results = [], active = 0;
const SWATCH = { bone: '#e9dcc3', muscle: '#c2574c', ...Object.fromEntries(EXTRA_IDS.map(k => [k, SYSTEMS[k].swatch])) };
const groupEntries = g => entries.filter(e => g.test(e.info));
const lab = r => (r.type === 'group' ? r.g.label : r.e.info.label);
function runSearch() {
  const q = input.value.trim();
  if (!q) { list.hidden = true; results = []; return; }
  const groupHits = GROUPS.map(g => {
    const s = score(q, g.label.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ' + g.words, g.label);
    return { type: 'group', g, s: s ? s + 0.5 : 0 };
  }).filter(r => r.s && groupEntries(r.g).length);
  const hits = entries.map(e => ({ type: 'one', e, s: score(q, e.info.search, e.info.label) })).filter(r => r.s);
  results = [...groupHits, ...hits]
    .sort((a, b) => Math.round((b.s - a.s) * 100) || lab(a).localeCompare(lab(b), undefined, { numeric: true }))
    .slice(0, 10);
  active = 0;
  render();
}
function render() {
  list.hidden = false;
  if (!results.length) { list.innerHTML = `<li class="empty">No matches. Try “femur”, “quads” or “rotator cuff”.</li>`; return; }
  list.innerHTML = results.map((r, i) => {
    const sys = r.type === 'group' ? groupEntries(r.g)[0].info.system : r.e.info.system;
    const meta = r.type === 'group' ? `Group · ${groupEntries(r.g).length}` : (r.e.info.region ? r.e.info.sub : SYSTEMS[sys] ? SYSTEMS[sys].label : r.e.info.conn ? 'Connective tissue' : 'Muscle');
    return `<li role="option" data-i="${i}" class="${i === active ? 'act' : ''}"><span><i class="dot" style="background:${SWATCH[sys]}"></i>${lab(r)}</span><em>${meta}</em></li>`;
  }).join('');
}
async function choose(i) {
  const r = results[i];
  if (!r) return;
  list.hidden = true;
  input.blur();
  const es = r.type === 'group' ? groupEntries(r.g) : [r.e];
  for (const sys of new Set(es.map(e => e.info.system))) await ensureLayer(sys);
  // a group may grow once its system loads (e.g. regions are known only after loading)
  const final = (r.type === 'group' ? groupEntries(r.g) : es).map(e => e.mesh).filter(Boolean);
  select(final, { zoom: true, title: r.type === 'group' ? r.g.label : null });
}
input.addEventListener('input', runSearch);
input.addEventListener('focus', runSearch);
input.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { active = Math.min(active + 1, results.length - 1); render(); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { active = Math.max(active - 1, 0); render(); e.preventDefault(); }
  else if (e.key === 'Enter') choose(active);
  else if (e.key === 'Escape') { list.hidden = true; input.blur(); }
});
list.addEventListener('pointerdown', e => { const li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); choose(+li.dataset.i); } });
input.addEventListener('blur', () => setTimeout(() => (list.hidden = true), 120));
addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== input) { e.preventDefault(); input.focus(); }
  if (e.key === 'Escape' && document.activeElement !== input) clearSel();
});

// ---------- chips, layers & buttons ----------
$('#chips').insertAdjacentHTML('beforeend', REGIONS.map(r => `<button class="chip" data-r="${r.id}">${r.label}</button>`).join(''));
$('#chips').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  if (c.id === 'chip-all') REGIONS.forEach(r => shownRegions.add(r.id));
  else if (shownRegions.size === REGIONS.length) { shownRegions.clear(); shownRegions.add(c.dataset.r); }
  else if (shownRegions.has(c.dataset.r)) { shownRegions.delete(c.dataset.r); if (!shownRegions.size) REGIONS.forEach(r => shownRegions.add(r.id)); }
  else shownRegions.add(c.dataset.r);
  refresh();
  if (!selected.size) showInfo([]);
});
$('#L-bone').onchange = e => { layers.bone = e.target.checked; refresh(); if (!selected.size) showInfo([]); };
$('#L-muscle').onchange = e => { if (e.target.checked) ensureLayer('muscle'); else { layers.muscle = false; refresh(); } };
$('#L-cart').onchange = e => { layers.cart = e.target.checked; refresh(); };
$('#sys-list').insertAdjacentHTML('beforeend', EXTRA_IDS.map(k => `<label class="tog"><input type="checkbox" id="L-${k}"><span class="sw" style="background:${SYSTEMS[k].swatch}"></span>${SYSTEMS[k].label} <em id="load-${k}"></em></label>`).join(''));
for (const k of EXTRA_IDS) $('#L-' + k).onchange = e => { if (e.target.checked) ensureLayer(k); else { layers[k] = false; refresh(); if (!selected.size) showInfo([]); } };
$('#L-attach').onchange = e => { if (e.target.checked) ensureLayer('attach'); else { layers.attach = false; refresh(); } };
$('#L-conn').onchange = e => { layers.conn = e.target.checked; if (layers.conn) ensureLayer('muscle'); refresh(); };
$('#op').oninput = e => { muscleOpacity = +e.target.value; setMuscleOpacity(muscleOpacity); };
const layersPanel = $('#layers');
layersPanel.classList.toggle('shown', innerWidth >= 720);
$('#layers-btn').onclick = () => { layersPanel.classList.toggle('shown'); placeUI(); refresh(); };
$('#fade').onclick = () => { fade = !fade; refresh(); };
$('#qs-btn').onclick = () => { const q = $('#qs'); q.hidden = !q.hidden; $('#qs-btn').classList.toggle('open', !q.hidden); placeUI(); updateOffset(); };
$('#side').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; side = b.dataset.s; refresh(); if (!selected.size) showInfo([]); });
$('#glow').oninput = e => { glow = +e.target.value; };
$('#L-shadow').onchange = e => { shadows = e.target.checked; key.castShadow = shadows; refresh(); };
$('#L-ao').onchange = e => { aoWanted = e.target.checked; refresh(); };
$('#light').oninput = e => setLight(+e.target.value);
$('#bright').oninput = e => { renderer.toneMappingExposure = +e.target.value; };
controls.addEventListener('change', () => { controls._lastChange = true; });

function setLock(on) {
  if (on) {
    const sel = [...selected].filter(m => m.visible);
    const set = sel.length ? sel : meshes.filter(m => m.visible);
    if (!set.length) return;
    const regions = REGIONS.filter(r => shownRegions.has(r.id));
    locked = sel.length === 1 ? sel[0].userData.info.label
      : sel.length ? ($('#info-title').textContent || 'selection')
      : regions.length === REGIONS.length ? (userHidden.size ? 'visible parts' : 'whole body') : regions.map(r => r.label).join(' + ');
    if (moveMode) setMove(false);
    controls.enablePan = false;
    controls.zoomToCursor = false;
    frame(set);
    // can't zoom inside the locked object
    controls.minDistance = Math.max(0.04, lastRadius * 0.85);
  } else {
    locked = null;
    controls.enablePan = true;
    controls.zoomToCursor = true;
    controls.minDistance = 0.04;
    const h = home.recalc(); flyTo(h.pos, h.target);
  }
  refresh();
}
$('#lock').onclick = () => setLock(!locked);
$('#lock-exit').onclick = () => setLock(false);
$('#reset').onclick = () => {
  locked = null; controls.enablePan = true; controls.zoomToCursor = true; controls.minDistance = 0.04;
  side = 'both'; isolate = false; clearSel(); REGIONS.forEach(r => shownRegions.add(r.id)); refresh();
  const h = home.recalc(); flyTo(h.pos, h.target);
};

// ---------- light ----------
let lightAngle = 30;
function setLight(deg) {
  lightAngle = deg;
  const a = THREE.MathUtils.degToRad(deg);
  const f = Math.sign(front.z) || 1;
  // angle 0 = light from the front, 90 = from the body's left, 180 = from behind
  key.position.set(bodyCenter.x + Math.sin(a) * 3, bodyCenter.y + 2.2, bodyCenter.z + Math.cos(a) * 3 * f);
  key.target.position.copy(bodyCenter);
  key.target.updateMatrixWorld();
}


// ---------- parts list: every structure per system, tick to show / untick to hide ----------
const SYS_ORDER = ['bone', 'muscle', ...EXTRA_IDS];
const SYS_LABEL = { bone: 'Bones', muscle: 'Muscles', ...Object.fromEntries(EXTRA_IDS.map(k => [k, SYSTEMS[k].label])) };
let partsOpen = false;
const plist = $('#plist');
const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sysEntries = sys => entries.filter(e => e.info.system === sys);
const sysGroups = sys => GROUPS.filter(g => { const es = groupEntries(g); return es.length > 1 && es.every(e => e.info.system === sys); });
const isOn = e => layers[e.info.system] && !userHidden.has(keyOf(e.info));
function buildParts() {
  plist.innerHTML = SYS_ORDER.map(sys => `<div class="psys" data-sys="${sys}">
    <div class="ph"><button class="chev" aria-label="Expand">›</button>
      <label><input type="checkbox" class="pcb" data-sys="${sys}"><span class="sw" style="background:${SWATCH[sys]}"></span>${SYS_LABEL[sys]}</label>
      <em>${sysEntries(sys).length}</em><button class="mini" data-only="${sys}" title="Show only this system">Only</button></div>
    <div class="pbody" hidden></div></div>`).join('');
  syncParts();
}
function fillBody(sec, filter) {
  const sys = sec.dataset.sys, body = sec.querySelector('.pbody');
  const f = filter ? filter.toLowerCase() : '';
  const es = sysEntries(sys).filter(e => !f || e.info.search.includes(f) || e.info.label.toLowerCase().includes(f))
    .sort((a, b) => a.info.label.localeCompare(b.info.label, undefined, { numeric: true }));
  const gs = sysGroups(sys).filter(g => !f || g.label.toLowerCase().includes(f) || g.words.includes(f));
  body.innerHTML =
    (gs.length ? `<div class="pgh">Groups</div>` + gs.map(g => `<label class="pi grp"><input type="checkbox" data-group="${GROUPS.indexOf(g)}"><span>${esc(g.label)}</span><em>${groupEntries(g).length}</em></label>`).join('') : '') +
    (es.length ? `<div class="pgh">Parts</div>` + es.map(e => `<div class="pi"><input type="checkbox" data-key="${esc(keyOf(e.info))}"><button class="pl" data-go="${esc(keyOf(e.info))}" title="Select and zoom">${esc(e.info.label)}</button></div>`).join('') : '') ||
    `<div class="pempty">No matches</div>`;
  return es.length + gs.length;
}
function syncParts() {
  for (const cb of plist.querySelectorAll('.pcb')) {
    const es = sysEntries(cb.dataset.sys);
    const vis = es.filter(isOn).length;
    cb.checked = vis > 0; cb.indeterminate = vis > 0 && vis < es.length;
  }
  for (const cb of plist.querySelectorAll('input[data-key]')) {
    const [sys] = cb.dataset.key.split(':');
    cb.checked = layers[sys] && !userHidden.has(cb.dataset.key);
  }
  for (const cb of plist.querySelectorAll('input[data-group]')) {
    const es = groupEntries(GROUPS[+cb.dataset.group]);
    const vis = es.filter(isOn).length;
    cb.checked = vis === es.length; cb.indeterminate = vis > 0 && vis < es.length;
  }
}
async function showEntries(es, on) {
  for (const e of es) { const k = keyOf(e.info); if (on) userHidden.delete(k); else userHidden.add(k); }
  if (on) for (const sys of new Set(es.map(e => e.info.system))) await ensureLayer(sys);
  refresh();
  if (!selected.size) showInfo([]);
}
plist.addEventListener('click', async e => {
  const chev = e.target.closest('.chev');
  if (chev) {
    const sec = chev.closest('.psys'), body = sec.querySelector('.pbody');
    body.hidden = !body.hidden; sec.classList.toggle('open', !body.hidden);
    if (!body.hidden) { fillBody(sec, $('#pq').value.trim()); syncParts(); }
    return;
  }
  const only = e.target.closest('[data-only]');
  if (only) {
    for (const sys of SYS_ORDER) layers[sys] = false;
    await showEntries(sysEntries(only.dataset.only), true);
    return;
  }
  const go = e.target.closest('[data-go]');
  if (go) {
    const ent = entries.find(x => keyOf(x.info) === go.dataset.go);
    await showEntries([ent], true);
    if (ent.mesh) select([ent.mesh], { zoom: true });
  }
});
plist.addEventListener('change', async e => {
  const t = e.target;
  if (t.classList.contains('pcb')) {
    const sys = t.dataset.sys;
    if (t.checked) await showEntries(sysEntries(sys), true);
    else { layers[sys] = false; refresh(); if (!selected.size) showInfo([]); }
  } else if (t.dataset.key) {
    await showEntries(entries.filter(x => keyOf(x.info) === t.dataset.key), t.checked);
  } else if (t.dataset.group) {
    await showEntries(groupEntries(GROUPS[+t.dataset.group]), t.checked);
  }
});
$('#pq').addEventListener('input', () => {
  const f = $('#pq').value.trim();
  for (const sec of plist.querySelectorAll('.psys')) {
    const body = sec.querySelector('.pbody');
    if (!f) { body.hidden = true; sec.classList.remove('open'); sec.hidden = false; continue; }
    const n = fillBody(sec, f);
    sec.hidden = !n; body.hidden = !n; sec.classList.toggle('open', !!n);
  }
  syncParts();
});
$('#p-all').onclick = () => { userHidden.clear(); refresh(); };
$('#p-none').onclick = () => { for (const e of entries) userHidden.add(keyOf(e.info)); refresh(); if (!selected.size) showInfo([]); };
for (const t of document.querySelectorAll('.tabs button')) t.onclick = () => {
  for (const b of document.querySelectorAll('.tabs button')) b.classList.toggle('on', b === t);
  $('#tab-layers').hidden = t.dataset.tab !== 'layers';
  $('#tab-parts').hidden = t.dataset.tab !== 'parts';
  partsOpen = t.dataset.tab === 'parts';
  if (partsOpen && !plist.children.length) buildParts(); else if (partsOpen) syncParts();
};

// ---------- start ----------
loadSystem('bone').then(() => {
  const bones = meshes;
  const box = new THREE.Box3();
  bones.forEach(m => box.expandByObject(m));
  box.getCenter(bodyCenter);
  const c = m => new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
  const jaw = bones.find(m => m.userData.info.base === 'Mandible');
  const neck = bones.find(m => m.userData.info.base === 'Vertebra_C4');
  if (jaw && neck) front.set(0, 0, Math.sign(c(jaw).z - c(neck).z) || 1);
  const t6 = bones.find(m => m.userData.info.base === 'Vertebra_T6');
  spineZ = t6 ? c(t6).z : bodyCenter.z;
  spineTable = bones.filter(m => /^(Atlas|Axis|Vertebra_|Sacrum)/.test(m.userData.info.base)).map(m => { const p = c(m); return [p.y, p.z]; });
  const carp = bones.filter(m => /^(Capitate|Hamate|Lunate|Pisiform|Scaphoid|Trapezium|Trapezoid|Triquetrum)/.test(m.userData.info.base)).map(m => c(m).y);
  const tal = bones.filter(m => /^Talus/.test(m.userData.info.base)).map(m => c(m).y);
  if (carp.length) limits.wrist = Math.max(...carp) + 0.015;
  if (tal.length) limits.ankle = Math.max(...tal) + 0.025;
  for (const m of bones) addSubRegion(m);
  const sc = key.shadow.camera;
  Object.assign(sc, { left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: 0.5, far: 8 });
  sc.updateProjectionMatrix();
  setLight(lightAngle);
  const homeDir = front.clone().add(new THREE.Vector3(0.18, 0.05, 0)).normalize();
  const goHome = () => {
    updateOffset();
    const r = Math.max(box.max.y - box.min.y, box.max.x - box.min.x) / 2;
    return { target: bodyCenter.clone(), pos: bodyCenter.clone().add(homeDir.clone().multiplyScalar(fitDist(r, 1.02))) };
  };
  home = goHome();
  home.recalc = goHome;
  camera.position.copy(home.pos);
  controls.target.copy(home.target);
  ready = true;
  refresh();
  $('#loading').classList.add('done');
  window.__ready = true;
}).catch(err => {
  $('#loading-text').textContent = 'Could not load the model.';
  console.error(err);
});

// ---------- loop ----------
const clock = new THREE.Clock();
let frameNo = 0, aoRadius = 0.05;
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  if (tween) {
    const k = Math.min(1, (performance.now() - tween.start) / tween.ms), e = ease(k);
    camera.position.lerpVectors(tween.p0, tween.p1, e);
    controls.target.lerpVectors(tween.t0, tween.t1, e);
    if (k >= 1) tween = null;
  }
  if (moveQueued) doHover();
  if (pointerOn && !ptrDrag && (frameNo % 10 === 0) && (tween || controls._lastChange)) placePointer();
  const pulse = Math.sin(t * 3.2);
  SEL.color.copy(selBase).lerp(SEL_WHITE, glow);
  SEL.emissiveIntensity = glow * (0.42 + 0.22 * pulse);
  for (const m of SEL_TINTS) m.emissiveIntensity = glow * 0.25;
  for (const m of Object.values(ATT_HL)) m.emissiveIntensity = glow * 0.45;
  outline.enabled = glow > 0.02;
  outline.edgeStrength = glow * (4 + 1.6 * pulse);
  outline.edgeGlow = glow * 0.9;
  if (ao.enabled && (frameNo++ % 15 === 0)) {
    const r = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.07, 0.01, 0.2);
    if (Math.abs(r - aoRadius) / aoRadius > 0.1) { aoRadius = r; ao.updateGtaoMaterial({ radius: r }); }
  }
  controls.update();
  composer.render();
});

window.__app = { pick: (x, y) => pick({ clientX: x, clientY: y })?.userData.info.label || null, ptr: () => ({ ...ptrPos }), cam: () => ({ pos: camera.position.toArray().map(v => +v.toFixed(3)), target: controls.target.toArray().map(v => +v.toFixed(3)), dist: +camera.position.distanceTo(controls.target).toFixed(3) }), meshes, entries, ensureLayer, select, layers, dbg: () => ({ spineZ, front: front.z, center: bodyCenter.z }), THREE };
