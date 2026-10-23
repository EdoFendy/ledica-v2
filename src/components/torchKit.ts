import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Kit per ricostruire una torcia da una foto: quote in px della foto (x → destra, y → giù, z → verso chi guarda),
// S = unità scena per px, (ox, oy) = px che finisce in (0, tipY). Tutto si fonde in poche mesh, una per materiale.
export type P3 = [number, number, number];

const tex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep?: [number, number], color = false) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
};
const grey = (v: number) => `rgb(${v | 0},${v | 0},${v | 0})`;

export function torchKit(S: number, ox: number, oy: number, tipY: number) {
  // ---- texture procedurali
  const knurl = tex(64, 64, (g) => {
    g.fillStyle = "#fff"; g.fillRect(0, 0, 64, 64); g.strokeStyle = "#000"; g.lineWidth = 3;
    for (let i = -64; i <= 128; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); }
  }, [36, 4]);
  const brush = tex(256, 256, (g) => {
    g.fillStyle = grey(190); g.fillRect(0, 0, 256, 256); g.globalAlpha = .35;
    for (let i = 0; i < 1400; i++) { g.fillStyle = grey(140 + Math.random() * 115); g.fillRect(Math.random() * 256, Math.random() * 256, 20 + Math.random() * 120, 1); }
  }, [2, 2]);
  const fly = tex(256, 256, (g) => { // fresatura a spianare: archi concentrici
    g.fillStyle = grey(150); g.fillRect(0, 0, 256, 256); g.lineWidth = 2;
    for (let r = 150; r < 560; r += 3) { g.strokeStyle = grey(110 + Math.random() * 130); g.beginPath(); g.arc(-180, 128, r, -.9, .9); g.stroke(); }
  });
  const spun = tex(256, 256, (g) => { // finitura tornita: cerchi concentrici con riflesso radiale
    g.fillStyle = grey(150); g.fillRect(0, 0, 256, 256); g.lineWidth = 1.5;
    for (let r = 2; r < 182; r += 2) { g.strokeStyle = grey(110 + Math.random() * 120); g.beginPath(); g.arc(128, 128, r, 0, Math.PI * 2); g.stroke(); }
  });
  const label = (txt: string) => tex(128, 64, (g) => {
    g.fillStyle = "#e8e5da"; g.fillRect(4, 6, 120, 52); g.strokeStyle = "#5a5a5a"; g.lineWidth = 2; g.strokeRect(4, 6, 120, 52);
    g.fillStyle = "#141414"; g.font = "bold 40px 'Courier New', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 64, 34);
  }, undefined, true);
  const matrix = () => tex(96, 40, (g) => { // etichetta datamatrix verde
    g.fillStyle = "#0c2618"; g.fillRect(0, 0, 96, 40);
    for (let y = 0; y < 10; y++) for (let x = 0; x < 24; x++) if (Math.random() > .5) { g.fillStyle = Math.random() > .5 ? "#3cc66d" : "#9fd8ff"; g.fillRect(x * 4, y * 4, 4, 4); }
    g.fillStyle = "#f2f2f2"; g.fillRect(40, 0, 6, 40);
  }, undefined, true);

  // ---- materiali: physical solo dove serve davvero (clearcoat/anisotropia), costa di più per pixel
  const M = (o: THREE.MeshPhysicalMaterialParameters) => (o.clearcoat || o.anisotropy ? new THREE.MeshPhysicalMaterial(o) : new THREE.MeshStandardMaterial(o as THREE.MeshStandardMaterialParameters));
  const oxide = M({ color: 0x25272a, metalness: .85, roughness: .32 });
  const hole = M({ color: 0x050505, metalness: 0, roughness: .9 });
  const nickel = M({ color: 0xd8dbde, metalness: 1, roughness: .16 });
  const mat = {
    alu: M({ color: 0xc9ced3, metalness: 1, roughness: .34, roughnessMap: brush, anisotropy: .6 }),
    aluHi: M({ color: 0xe4e7ea, metalness: 1, roughness: .2, roughnessMap: brush, anisotropy: .4 }),
    aluFly: M({ color: 0xd0d4d8, metalness: 1, roughness: .3, roughnessMap: fly, bumpMap: fly, bumpScale: .4 }),
    spun: M({ color: 0xd4d8db, metalness: 1, roughness: .28, roughnessMap: spun, bumpMap: spun, bumpScale: .3 }),
    paint: M({ color: 0xd9dcdf, metalness: .35, roughness: .38 }),
    knurl: M({ color: 0xc4c9cd, metalness: 1, roughness: .32, bumpMap: knurl, bumpScale: 2 }),
    knurlK: M({ color: 0x1b1c1e, metalness: .6, roughness: .42, bumpMap: knurl, bumpScale: 2 }),
    black: M({ color: 0x17181a, metalness: .55, roughness: .36 }),
    gloss: M({ color: 0x08090a, metalness: 0, roughness: .22, clearcoat: 1, clearcoatRoughness: .06 }),
    blue: M({ color: 0x1f49d6, metalness: .7, roughness: .28 }),
    red: M({ color: 0xc8302a, metalness: .5, roughness: .34 }),
    copper: M({ color: 0xe0915f, metalness: 1, roughness: .2 }),
    steel: M({ color: 0x9ea4a9, metalness: 1, roughness: .26 }),
    plate: M({ color: 0x353b37, metalness: .5, roughness: .55 }),
    rubber: M({ color: 0x111213, metalness: 0, roughness: .6 }),
    brass: M({ color: 0xcaa24c, metalness: 1, roughness: .25 }),
    clear: M({ color: 0xe6f6fa, metalness: 0, roughness: .05, clearcoat: 1, clearcoatRoughness: .03, transparent: true, opacity: .32, depthWrite: false }),
    redHose: M({ color: 0xff3d16, metalness: 0, roughness: .2, clearcoat: .8 }),
    blueHose: M({ color: 0x2060ff, metalness: 0, roughness: .25, clearcoat: .8 }),
    oxide, hole, nickel, knurlTex: knurl,
  };

  // ---- primitive in px
  const X = (px: number) => (px - ox) * S, Y = (py: number) => tipY + (oy - py) * S;
  const V = (p: P3) => new THREE.Vector3(X(p[0]), Y(p[1]), p[2] * S);
  const W = (d: P3) => new THREE.Vector3(d[0], -d[1], d[2]).normalize(); // direzione foto → mondo
  const adv = (p: P3, d: P3, l: number): P3 => { const w = W(d); return [p[0] + w.x * l, p[1] - w.y * l, p[2] + w.z * l]; };
  const UP = new THREE.Vector3(0, 1, 0);
  const parts = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const put = (geo: THREE.BufferGeometry, m: THREE.Material, pos = new THREE.Vector3(), dir?: THREE.Vector3) => {
    geo.applyMatrix4(new THREE.Matrix4().compose(pos, dir ? new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()) : new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)));
    if (!parts.has(m)) parts.set(m, []);
    parts.get(m)!.push(geo.index ? geo.toNonIndexed() : geo); // RoundedBox non è indicizzata: tutto non indicizzato per il merge
  };
  const box = (x1: number, y1: number, x2: number, y2: number, z1: number, z2: number, m: THREE.Material, r = 3) =>
    put(new RoundedBoxGeometry((x2 - x1) * S, (y2 - y1) * S, (z2 - z1) * S, 3, r * S), m, V([(x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2]));
  const rodW = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, m: THREE.Material, seg = 40) =>
    put(new THREE.CylinderGeometry(r1 * S, r0 * S, a.distanceTo(b), seg), m, a.clone().add(b).multiplyScalar(.5), b.clone().sub(a));
  // cilindro dalla base p lungo d per l px; r0 alla base, r1 in cima
  const rod = (p: P3, d: P3, l: number, r0: number, r1: number, m: THREE.Material, seg = 40) => rodW(V(p), V(adv(p, d, l)), r0, r1, m, seg);
  // profilo di rivoluzione: [raggio, distanza lungo d] in px
  const lathe = (pts: [number, number][], p: P3, d: P3, m: THREE.Material) =>
    put(new THREE.LatheGeometry(pts.map(([r, a]) => new THREE.Vector2(r * S, a * S)), 64), m, V(p), W(d));
  const screw = (p: P3, d: P3, r = 5, m: THREE.Material = oxide) => { rod(p, d, r * .9, r, r, m, 24); rod(adv(p, d, r * .9), d, .6, r * .5, r * .5, hole, 6); };
  // elemento posato sulla superficie di un cilindro verticale (asse cx, raggio r) all'angolo a: asole, scanalature
  const onCyl = (cx: number, py: number, r: number, a: number, w: number, h: number, d: number, m: THREE.Material) => {
    const g = new RoundedBoxGeometry(w * S, h * S, d * S, 2, Math.min(w, d) * .45 * S); g.rotateY(a);
    put(g, m, V([cx + Math.sin(a) * r, py, Math.cos(a) * r]));
  };
  const pipe = (pts: P3[], r: number, m: THREE.Material) =>
    put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V), false, "centripetal"), 96, r * S, 8), m);
  // raccordo istantaneo: esagono + corpo + anello di sgancio; ritorna il punto d'innesto del tubo
  const fitting = (p: P3, d: P3, collar: THREE.Material = nickel): P3 => {
    rod(p, d, 6, 11, 11, nickel, 6); rod(adv(p, d, 6), d, 14, 9.5, 9.5, nickel); rod(adv(p, d, 20), d, 5, 10.5, 10.5, collar);
    return adv(p, d, 25);
  };
  const decals: THREE.Mesh[] = [];
  const decal = (x: number, y: number, z: number, w: number, h: number, map: THREE.Texture) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * S, h * S), new THREE.MeshStandardMaterial({ map, roughness: .6, metalness: 0, transparent: true }));
    m.position.copy(V([x, y, z])); decals.push(m);
  };
  const build = () => {
    const g = new THREE.Group();
    parts.forEach((geos, m) => {
      const mesh = new THREE.Mesh(mergeGeometries(geos), m);
      mesh.castShadow = !m.transparent; mesh.receiveShadow = true; g.add(mesh);
    });
    decals.forEach((d) => g.add(d));
    return g;
  };
  return { S, X, Y, V, W, adv, put, box, rodW, rod, lathe, screw, onCyl, pipe, fitting, decal, label, matrix, M, mat, build };
}
