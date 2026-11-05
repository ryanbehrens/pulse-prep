// Fill the largest hole of a named mesh with a curved patch that follows the surrounding surface.
export function patchLargestHole(doc, node, { rings = 7, bulge = +(process.env.BULGE || 0.35) } = {}) {
  const mesh = node.getMesh(); const prim = mesh.listPrimitives()[0];
  const pos = prim.getAttribute('POSITION'), idx = prim.getIndices();
  // weld by position
  const id = new Map(), remap = [], P = [];
  for (let i = 0; i < pos.getCount(); i++) {
    const v = pos.getElement(i, []); const k = v.map(x => Math.round(x * 1e6)).join(',');
    if (!id.has(k)) { id.set(k, P.length); P.push(v); }
    remap.push(id.get(k));
  }
  const T = [];
  const n = idx ? idx.getCount() : pos.getCount();
  for (let t = 0; t < n; t += 3) T.push([0, 1, 2].map(j => remap[idx ? idx.getScalar(t + j) : t + j]));
  // directed border edges (a->b used by exactly one triangle, reverse not used)
  const dir = new Set(); for (const [a, b, c] of T) for (const [x, y] of [[a, b], [b, c], [c, a]]) dir.add(x + '_' + y);
  const next = new Map(); // patch direction: reverse of the existing border edge
  for (const e of dir) { const [x, y] = e.split('_').map(Number); if (!dir.has(y + '_' + x)) next.set(y, x); }
  // collect loops
  const loops = [], used = new Set();
  for (const s of next.keys()) {
    if (used.has(s)) continue;
    const L = []; let v = s;
    while (v !== undefined && !used.has(v)) { used.add(v); L.push(v); v = next.get(v); }
    loops.push(L);
  }
  loops.sort((a, b) => b.length - a.length);
  const L = loops[0];
  const sub = (a, b) => a.map((x, i) => x - b[i]), add = (a, b) => a.map((x, i) => x + b[i]), mul = (a, s) => a.map(x => x * s);
  const len = a => Math.hypot(...a);
  const c = mul(L.reduce((acc, v) => add(acc, P[v]), [0, 0, 0]), 1 / L.length);
  const hr = Math.max(...L.map(v => len(sub(P[v], c))));
  // least-squares sphere through surface points around the hole
  const pts = P.filter(p => len(sub(p, c)) < hr * 2.2);
  const A = [], B = [];
  for (const [x, y, z] of pts) { A.push([2 * x, 2 * y, 2 * z, 1]); B.push(x * x + y * y + z * z); }
  const AtA = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => A.reduce((s, r) => s + r[i] * r[j], 0)));
  const AtB = [0, 1, 2, 3].map(i => A.reduce((s, r, k) => s + r[i] * B[k], 0));
  // solve 4x4 (Gaussian elimination)
  const M = AtA.map((r, i) => [...r, AtB[i]]);
  for (let i = 0; i < 4; i++) { let p = i; for (let k = i + 1; k < 4; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k; [M[i], M[p]] = [M[p], M[i]];
    for (let k = 0; k < 4; k++) if (k !== i) { const f = M[k][i] / M[i][i]; for (let j = i; j < 5; j++) M[k][j] -= f * M[i][j]; } }
  const sol = M.map((r, i) => r[4] / r[i]);
  const S = sol.slice(0, 3), R = Math.sqrt(sol[3] + S[0] ** 2 + S[1] ** 2 + S[2] ** 2);
  const sphereOK = isFinite(R) && R > hr * 1.05 && R < hr * 20;
  // concentric rings toward the centre, projected onto the fitted sphere
  const ring = [L];
  for (let k = 1; k < rings; k++) {
    const t = k / rings, R2 = [];
    for (const v of L) {
      let p = add(mul(P[v], 1 - t), mul(c, t));
      if (sphereOK) { const d = sub(p, S); const q = add(S, mul(d, R / len(d))); p = add(p, mul(sub(q, p), bulge)); }
      R2.push(P.push(p) - 1);
    }
    ring.push(R2);
  }
  let cc = c; if (sphereOK) { const d = sub(c, S); const q = add(S, mul(d, R / len(d))); cc = add(c, mul(sub(q, c), bulge)); }
  const ci = P.push(cc) - 1;
  const m = L.length;
  for (let k = 0; k < rings - 1; k++) for (let i = 0; i < m; i++) {
    const a = ring[k][i], b = ring[k][(i + 1) % m], a2 = ring[k + 1][i], b2 = ring[k + 1][(i + 1) % m];
    T.push([a, b, b2], [a, b2, a2]);
  }
  for (let i = 0; i < m; i++) T.push([ring[rings - 1][i], ring[rings - 1][(i + 1) % m], ci]);
  // rebuild primitive: positions + indices only (normals recomputed in the viewer)
  const posAcc = doc.createAccessor().setType('VEC3').setArray(new Float32Array(P.flat())).setBuffer(pos.getBuffer());
  const idxAcc = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(T.flat())).setBuffer(pos.getBuffer());
  for (const s of prim.listSemantics()) prim.setAttribute(s, null);
  prim.setAttribute('POSITION', posAcc).setIndices(idxAcc);
  return { holeEdges: m, holeRadius: hr, sphereR: sphereOK ? R : null, otherHoles: loops.slice(1).map(l => l.length) };
}
