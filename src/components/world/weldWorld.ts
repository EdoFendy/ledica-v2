import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { laserHead } from "../laserHead";
import { comboHead } from "../comboHead";
import { plasmaHead } from "../plasmaHead";

/* Mondo scroll della hero: un'officina luminosa con tre linee parallele, una per tecnologia.
   Ogni linea racconta il processo: coil di nastro → rulli formatori che chiudono il tubo → torcia sul giunto → taglio → tubi finiti.
   Unità: 1 = 100 mm. Asse tubi a y = 9 (900 mm). Il progresso (0..CH-1) arriva dallo scroll nativo;
   qui viene smorzato e guida camera, nebbia, esposizione e stazione a fuoco. */

type V3 = [number, number, number];
type Way = { p: V3; t: V3 };
type Chapter = { pos: V3; target: V3; fov: number; shift: number; fog: number; exposure: number; focus: number; via?: Way[] };

const AXIS = 9;
// linee: laser su tubo Ø40, combo su tubo Ø90, plasma su tubo Ø320 parete 12,7
const LINES = [
  { z: 0, R: 0.2, tone: 0x9cc4ff },
  { z: -26, R: 0.45, tone: 0xc9a8ff },
  { z: -52, R: 1.6, tone: 0xffa25a },
] as const;
const PIPE = { x0: -34, x1: 16, wall: 0.127 }; // tubo spesso: estremità aperte per il volo interno
const HAZE = 0x7f888c; // foschia grigio medio: luminoso ma non abbagliante

// capitoli: 0 officina · 1 formatura (linea 2, nastro più largo e leggibile) · 2-3 testa laser · 4-5 combo · 6-7 plasma · 8 dentro il tubo · 9 finale
export const CHAPTERS: Chapter[] = [
  { pos: [-30, 30, 36], target: [2, 8, -24], fov: 42, shift: -4, fog: .006, exposure: .9, focus: -1 },
  { pos: [-13, 18.5, -21.5], target: [-12, 9.0, -26.1], fov: 40, shift: -3, fog: .006, exposure: .9, focus: 1 },
  { pos: [-4.4, 13.6, 7.6], target: [0.4, 12.6, 0], fov: 34, shift: -6, fog: .007, exposure: .9, focus: 0 },
  { pos: [5.5, 10.6, 6.2], target: [0.8, 11.0, 0], fov: 34, shift: -6, fog: .007, exposure: .9, focus: 0,
    via: [{ p: [1, 12.2, 9.4], t: [0.6, 11.8, 0] }] },
  { pos: [-3.2, 11.9, -19.8], target: [0.2, 11.2, -26], fov: 32, shift: -6, fog: .007, exposure: .9, focus: 1,
    via: [{ p: [2, 22, -4], t: [0.5, 13, -12] }, { p: [-2.5, 10.5, -13], t: [0.3, 11.2, -26] }] },
  { pos: [3.6, 10.2, -20.6], target: [0.5, 10.3, -26], fov: 32, shift: -6, fog: .007, exposure: .9, focus: 1,
    via: [{ p: [0.4, 11, -18.8], t: [0.3, 10.8, -26] }] },
  { pos: [-7.8, 15.2, -41], target: [-0.4, 13.4, -52], fov: 34, shift: -6, fog: .007, exposure: .9, focus: 2,
    via: [{ p: [1, 23, -30], t: [0, 15, -36] }, { p: [-3, 10.5, -39], t: [0, 13, -52] }] },
  { pos: [6.5, 11.6, -43.5], target: [0.6, 11.6, -52], fov: 34, shift: -6, fog: .007, exposure: .9, focus: 2,
    via: [{ p: [0, 12.8, -40.5], t: [0.2, 12.4, -52] }] },
  { pos: [13.5, 9.1, -52], target: [-8, 9.9, -52], fov: 50, shift: 0, fog: .02, exposure: 1.1, focus: 2,
    via: [{ p: [10, 11.8, -45], t: [16, 9.5, -52] }, { p: [20, 9.3, -52], t: [10, 9.3, -52] }] },
  { pos: [-50, 30, 22], target: [4, 7, -26], fov: 42, shift: -3, fog: .006, exposure: .9, focus: -1,
    via: [{ p: [-10, 9.15, -52], t: [-30, 9.4, -52] }, { p: [-30, 9.15, -52], t: [-50, 9.4, -52] }, { p: [-42, 11, -52], t: [-50, 12, -40] }] },
];

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!); return c;
};
const tex = (c: HTMLCanvasElement, srgb: boolean, rep?: [number, number]) => {
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
};
const glow = (inner: string, outer: string) => tex(canvasTex(128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(.35, outer); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
}), true);
const smooth = (t: number) => t * t * (3 - 2 * t);

export async function createWeldWorld(host: HTMLElement, opts: { reduced: boolean; mobile: boolean; signs: [string, string][]; intro: boolean; onReady?: () => void }) {
  // la costruzione cede il thread a intervalli: il caricamento del leone (CSS) resta fluido
  const idle = () => new Promise<void>((r) => setTimeout(r, 0));
  const renderer = new THREE.WebGLRenderer({ antialias: !opts.mobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, opts.mobile ? 1.25 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false; // mondo statico: ombre ricalcolate solo quando cambia la stazione a fuoco
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(HAZE);
  const fog = new THREE.FogExp2(HAZE, .006); scene.fog = fog;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = .6;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 260);

  // ---- materiali dell'officina: resina chiara a terra, carpenteria grigio chiaro, verde LEDICA sugli accenti
  const concrete = canvasTex(512, 512, (g) => {
    g.fillStyle = "#9ea39b"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) { const v = 150 + Math.random() * 60 | 0; g.fillStyle = `rgba(${v},${v},${v - 4},.3)`; g.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1 + Math.random() * 2); }
    for (let i = 0; i < 30; i++) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 60 + Math.random() * 80); const x = Math.random() * 512, y = Math.random() * 512; gr.addColorStop(0, `rgba(90,92,86,${Math.random() * .12})`); gr.addColorStop(1, "rgba(90,92,86,0)"); g.save(); g.translate(x, y); g.fillStyle = gr; g.fillRect(-140, -140, 280, 280); g.restore(); }
    g.fillStyle = "rgba(70,72,68,.6)"; g.fillRect(0, 0, 512, 2); g.fillRect(0, 0, 2, 512); // giunti di dilatazione
  });
  const floorMat = new THREE.MeshStandardMaterial({ map: tex(concrete, true, [30, 22]), roughnessMap: tex(concrete, false, [30, 22]), roughness: .55, metalness: 0 });
  const steelPaint = new THREE.MeshStandardMaterial({ color: 0x8f9b97, metalness: .35, roughness: .5 });
  const lightPaint = new THREE.MeshStandardMaterial({ color: 0xaab1ae, metalness: .2, roughness: .6 });
  const ledicaGreen = new THREE.MeshStandardMaterial({ color: 0x3f7a28, metalness: .2, roughness: .45 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x3a4044, metalness: .6, roughness: .45 });
  const roll = new THREE.MeshStandardMaterial({ color: 0xc4c9cd, metalness: 1, roughness: .2 });
  const yellow = new THREE.MeshStandardMaterial({ color: 0xe8b51c, metalness: 0, roughness: .55 });
  const brushedC = canvasTex(512, 512, (g) => {
    g.fillStyle = "#c4c9cd"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${Math.random() > .5 ? "255,255,255" : "40,45,50"},${Math.random() * .09})`; g.fillRect(Math.random() * 512, 0, 1 + Math.random() * 1.5, 512); }
  });
  const stripMat = new THREE.MeshStandardMaterial({ map: tex(brushedC, true, [1, 4]), color: 0xe4e8eb, metalness: .9, roughness: .32 });
  const stripIn = new THREE.MeshStandardMaterial({ color: 0x2c3236, metalness: .5, roughness: .6, side: THREE.BackSide }); // interno del canale più scuro: la U che si chiude si legge
  const coilCap = tex(canvasTex(256, 256, (g) => { // spire del coil viste di fianco
    g.fillStyle = "#8d9399"; g.fillRect(0, 0, 256, 256);
    for (let r = 40; r < 128; r += 1.5) { g.strokeStyle = `rgba(${Math.random() > .5 ? "230,234,238" : "60,64,68"},.5)`; g.beginPath(); g.arc(128, 128, r, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = "#3a4044"; g.beginPath(); g.arc(128, 128, 40, 0, Math.PI * 2); g.fill();
  }), true);
  const heat = tex(canvasTex(256, 4, (g) => {
    const gr = g.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, "#fff1c0"); gr.addColorStop(.12, "#ff5a10"); gr.addColorStop(.45, "#1a0600"); gr.addColorStop(1, "#000");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 4);
  }), true);

  const merged = (geos: THREE.BufferGeometry[], mat: THREE.Material, shadow = true) => {
    const m = new THREE.Mesh(mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g))), mat);
    m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m;
  };
  const boxG = (w: number, h: number, d: number, x: number, y: number, z: number) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);

  // ---- officina: pavimento, pilastri HEB, capriate chiare, lucernari, muro con finestre a nastro
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(420, 320), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.z = -30; floor.receiveShadow = true; scene.add(floor);
  const heb = new THREE.Shape(); { const f = .55, w = .07, t = .09, hh = .55; heb.moveTo(-f, -hh); heb.lineTo(f, -hh); heb.lineTo(f, -hh + t); heb.lineTo(w, -hh + t); heb.lineTo(w, hh - t); heb.lineTo(f, hh - t); heb.lineTo(f, hh); heb.lineTo(-f, hh); heb.lineTo(-f, hh - t); heb.lineTo(-w, hh - t); heb.lineTo(-w, -hh + t); heb.lineTo(-f, -hh + t); heb.closePath(); }
  const colGeo = new THREE.ExtrudeGeometry(heb, { depth: 36, bevelEnabled: false }).rotateX(-Math.PI / 2);
  const cols: THREE.BufferGeometry[] = [], truss: THREE.BufferGeometry[] = [];
  for (let x = -75; x <= 75; x += 15) for (const z of [16, -70]) cols.push(colGeo.clone().translate(x, 0, z));
  for (let x = -75; x <= 75; x += 15) {
    truss.push(boxG(.5, .6, 86, x, 34, -27), boxG(.4, .4, 86, x, 39, -27));
    for (let z = -70; z < 16; z += 6) { const d = new THREE.BoxGeometry(.18, 5.6, .18); d.rotateX(z % 12 === 0 ? .7 : -.7); truss.push(d.translate(x, 36.5, z + 3)); }
  }
  for (let z = -66; z <= 12; z += 13) truss.push(boxG(152, .35, .3, 0, 39.3, z));
  merged(cols, steelPaint); merged(truss, lightPaint, false);
  await idle();
  merged([boxG(160, 40, 1, 0, 20, -74), boxG(160, 1.2, .4, 0, 1.2, -73.4)], new THREE.MeshStandardMaterial({ color: 0xb4b9b6, roughness: .9 }), false);
  const daylight = new THREE.MeshBasicMaterial({ color: 0xc9d4e0 });
  const windows: THREE.BufferGeometry[] = [];
  for (let x = -72; x <= 72; x += 9) windows.push(boxG(7, 6, .1, x, 28, -73.4));
  for (const z of [-8, -34, -60]) windows.push(boxG(150, .1, 3.2, 0, 40, z + 4));
  merged(windows, daylight, false);
  // lampade a campana LED sopra le linee
  const lampGeo: THREE.BufferGeometry[] = [], lampLit: THREE.BufferGeometry[] = [];
  const shaftMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .02, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  for (const L of LINES) for (const x of [-30, -12, 6, 24]) {
    lampGeo.push(new THREE.CylinderGeometry(.5, 1.4, 1.2, 24, 1, true).translate(x, 31, L.z + 3));
    lampLit.push(new THREE.CircleGeometry(1.3, 24).rotateX(Math.PI / 2).translate(x, 30.42, L.z + 3));
    const s = new THREE.Mesh(new THREE.ConeGeometry(7, 30, 32, 1, true), shaftMat); s.position.set(x, 15.5, L.z + 3); scene.add(s);
  }
  merged(lampGeo, darkSteel, false); merged(lampLit, daylight, false);
  merged(LINES.flatMap((L) => [boxG(150, .02, .25, 0, .01, L.z + 7), boxG(150, .02, .25, 0, .01, L.z - 7)]), yellow, false);

  // ---- le tre linee
  const tubeMaps: THREE.Texture[] = [];
  const rollers: THREE.Mesh[] = [], coils: THREE.Mesh[] = [];
  const supports: THREE.BufferGeometry[] = [], frames: THREE.BufferGeometry[] = [], green: THREE.BufferGeometry[] = [], strips: THREE.BufferGeometry[] = [], stock: THREE.BufferGeometry[] = [];
  for (const [i, L] of LINES.entries()) {
    const heavy = i === 2, x0 = heavy ? PIPE.x0 : -2, x1 = heavy ? PIPE.x1 : 80, len = x1 - x0;
    const map = tex(brushedC, true); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(heavy ? 3 : 1, len / 6); tubeMaps.push(map);
    const mat = new THREE.MeshStandardMaterial({ map, color: 0xe4e8eb, metalness: .95, roughness: .3, envMapIntensity: 1.2 });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(L.R, L.R, len, heavy ? 128 : 48, 1, true), mat);
    tube.rotation.z = Math.PI / 2; tube.position.set((x0 + x1) / 2, AXIS, L.z); tube.castShadow = tube.receiveShadow = true; scene.add(tube);
    const seamY = AXIS + L.R;
    const bead = new THREE.Mesh(new THREE.BoxGeometry(Math.min(x1, 18), .03 + L.R * .02, .07 + L.R * .05), new THREE.MeshStandardMaterial({ color: 0xaab0b5, metalness: .9, roughness: .35, emissive: 0xffffff, emissiveMap: heat, emissiveIntensity: 2 }));
    bead.position.set(Math.min(x1, 18) / 2, seamY + .01, L.z); scene.add(bead);
    if (heavy) {
      const groove = new THREE.Mesh(new THREE.BoxGeometry(-x0, .03, .06), new THREE.MeshStandardMaterial({ color: 0x0e1012, roughness: .9 }));
      groove.position.set(x0 / 2, seamY + .003, L.z); scene.add(groove);
    } else {
      // il nastro: coil sullo svolgitore, tratto piano, poi rulli formatori che lo chiudono in tubo fino al giunto
      const W = 2 * Math.PI * L.R, bottom = AXIS - L.R, cr = 2.6;
      const coil = new THREE.Mesh(new THREE.CylinderGeometry(cr, cr, W, 64), [roll, new THREE.MeshStandardMaterial({ map: coilCap, metalness: .8, roughness: .35 }), new THREE.MeshStandardMaterial({ map: coilCap, metalness: .8, roughness: .35 })]);
      coil.rotation.x = Math.PI / 2; coil.position.set(-47, bottom - cr, L.z); coil.castShadow = true; scene.add(coil); coils.push(coil);
      frames.push(boxG(6.4, .5, W + 3, -47, .25, L.z), boxG(.8, bottom - cr, .8, -47, (bottom - cr) / 2, L.z - W / 2 - 1), boxG(.8, bottom - cr, .8, -47, (bottom - cr) / 2, L.z + W / 2 + 1));
      green.push(boxG(1.6, 1.6, .5, -47, bottom - cr, L.z - W / 2 - 1.2), boxG(1.6, 1.6, .5, -47, bottom - cr, L.z + W / 2 + 1.2));
      strips.push(new THREE.PlaneGeometry(16, W).rotateX(-Math.PI / 2).translate(-38, bottom, L.z));
      const N = 16, xa = -30, xb = -2, seg = (xb - xa) / N;
      for (let k = 0; k < N; k++) {
        const th = 2 * Math.PI * (.1 + .88 * k / (N - 1)), r = W / th;
        strips.push(new THREE.CylinderGeometry(r, r, seg * 1.02, 40, 1, true, 1.5 * Math.PI - th / 2, th).rotateZ(Math.PI / 2).translate(xa + (k + .5) * seg, bottom + r, L.z));
      }
      // gabbie strette: coppia di rulli che pizzica il nastro, il telaio non copre la formatura
      for (const x of [-7, -11, -15, -19, -23, -27]) {
        const hw = W / 2 + .45, rr = .18 + L.R * .25, topY = AXIS + L.R + rr * 2 + .25;
        frames.push(boxG(.3, topY, .3, x, topY / 2, L.z + hw), boxG(.3, topY, .3, x, topY / 2, L.z - hw), boxG(.35, .3, 2 * hw + .3, x, topY + .15, L.z));
        green.push(boxG(.36, .12, 2 * hw + .32, x, topY + .36, L.z));
        for (const y of [bottom - rr, AXIS + L.R + rr]) {
          const r = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, 2 * hw - .3, 32), roll);
          r.rotation.x = Math.PI / 2; r.position.set(x, y, L.z); r.castShadow = true; scene.add(r); rollers.push(r);
        }
      }
      // taglio a misura e rastrelliera con i tubi finiti
      frames.push(boxG(2.8, 3.2, 2.6, 24, AXIS + .4, L.z), boxG(3.4, AXIS - 1.2, 3, 24, (AXIS - 1.2) / 2, L.z));
      green.push(boxG(2.82, .4, 2.62, 24, AXIS + 2.1, L.z));
      const rz = L.z + 5.2, rows = i ? 3 : 4, perRow = i ? 4 : 6, d = 2 * L.R + .06;
      for (const x of [28, 34, 40]) frames.push(boxG(.4, 4.4, .4, x, 2.2, rz - 1.6), boxG(.3, .3, 3.6, x, 1.6, rz));
      for (let a = 0; a < rows; a++) for (let b = 0; b < perRow; b++) stock.push(new THREE.CylinderGeometry(L.R, L.R, 14, 24).rotateZ(Math.PI / 2).translate(34, 1.75 + L.R + a * d * .88, rz - 1.3 + b * d + (a % 2) * L.R));
    }
    // sostegni a rulli a V lungo la linea
    for (let x = x0 + 4; x < x1 - 2; x += heavy ? 10 : 6) {
      if (Math.abs(x) < 4 || (!heavy && Math.abs(x - 24) < 3)) continue;
      const base = AXIS - L.R - .35;
      supports.push(boxG(1.6, .3, 2.4 + L.R, x, .15, L.z), boxG(.35, base - .3, .35, x, (base + .3) / 2, L.z));
      for (const s of [-1, 1]) {
        const r = new THREE.CylinderGeometry(.18 + L.R * .12, .18 + L.R * .12, .5, 20); r.rotateX(Math.PI / 2).rotateX(s * .78);
        const rr = L.R + .18 + L.R * .12;
        frames.push(r.translate(x, AXIS - Math.cos(.78) * rr, L.z + s * Math.sin(.78) * rr));
      }
    }
    // colonna e braccio a sbalzo dal lato posteriore: davanti alla torcia resta libero
    const top = [15.5, 13.05, 17.25][i], back = 5 + L.R * 1.6, bx = [0.4, 0.15, -0.25][i], reach = back + 1.4;
    frames.push(boxG(1.1, top + 1.6, 1.1, bx, (top + 1.6) / 2, L.z - back), boxG(2.4, .5, 2.4, bx, .25, L.z - back), boxG(1.3, 1.2, reach, bx, top + .6, L.z - back + reach / 2));
    green.push(boxG(1.32, .18, reach + .02, bx, top + .2, L.z - back + reach / 2));
    frames.push(boxG(2.4, 6, 1.2, -7, 3, L.z + 9.5));
    // cartello appeso sopra la linea: nome e spessori
    const [title, sub] = opts.signs[i] ?? ["", ""];
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(13, 3.25), new THREE.MeshBasicMaterial({ map: tex(canvasTex(1024, 256, (g) => {
      g.fillStyle = "#1f3a17"; g.fillRect(0, 0, 1024, 256); g.fillStyle = "#8fd467"; g.fillRect(0, 0, 14, 256);
      const fit = (txt: string, size: number, font: string) => { g.font = `${font} ${size}px sans-serif`; const k = Math.min(1, 930 / g.measureText(txt).width); g.font = `${font} ${size * k}px sans-serif`; };
      g.fillStyle = "#ffffff"; fit(title, 74, "bold"); g.fillText(title, 48, 110);
      g.fillStyle = "#b9e59c"; fit(sub, 56, ""); g.fillText(sub, 48, 196);
    }), true) }));
    sign.position.set(10, 22, L.z); scene.add(sign);
    frames.push(boxG(.06, 15.5, .06, 4.5, 31.4, L.z), boxG(.06, 15.5, .06, 15.5, 31.4, L.z));
    await idle();
  }
  merged(supports, darkSteel); merged(frames, steelPaint); merged(green, ledicaGreen); merged(strips, stripMat); merged(strips.map((g) => g.clone()), stripIn, false); merged(stock, roll);
  const screen = tex(canvasTex(256, 160, (g) => {
    g.fillStyle = "#0d1a10"; g.fillRect(0, 0, 256, 160); g.fillStyle = "#8fd467"; g.font = "bold 30px sans-serif"; g.fillText("LE.DI.CA.", 18, 44);
    g.fillStyle = "#5f8a4a"; g.font = "16px monospace"; ["I  285 A", "U  11.4 V", "v  2.6 m/min"].forEach((s, k) => g.fillText(s, 18, 80 + k * 24));
  }), true);
  LINES.forEach((L) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1), new THREE.MeshBasicMaterial({ map: screen })); s.position.set(-7, 4.6, L.z + 10.11); scene.add(s); });

  // tubo spesso: parete interna, anelli di testa, radice del cordone e fessura del giunto visti da dentro, tubi finiti accatastati
  const P = LINES[2], Ri = P.R - PIPE.wall, plen = PIPE.x1 - PIPE.x0;
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(Ri, Ri, plen, 128, 1, true), new THREE.MeshStandardMaterial({ map: tubeMaps[2], color: 0x9aa1a8, metalness: .9, roughness: .42, side: THREE.BackSide }));
  inner.rotation.z = Math.PI / 2; inner.position.set((PIPE.x0 + PIPE.x1) / 2, AXIS, P.z); inner.receiveShadow = true; scene.add(inner);
  for (const [x, s] of [[PIPE.x0, -1], [PIPE.x1, 1]]) { const ring = new THREE.Mesh(new THREE.RingGeometry(Ri, P.R, 128), new THREE.MeshStandardMaterial({ color: 0xf0f2f3, metalness: 1, roughness: .2, side: THREE.DoubleSide })); ring.rotation.y = s * Math.PI / 2; ring.position.set(x, AXIS, P.z); scene.add(ring); }
  const root = new THREE.Mesh(new THREE.BoxGeometry(PIPE.x1, .02, .06), new THREE.MeshBasicMaterial({ color: 0xffffff, map: heat }));
  root.position.set(PIPE.x1 / 2, AXIS + Ri - .012, P.z); scene.add(root);
  const slit = new THREE.Mesh(new THREE.BoxGeometry(-PIPE.x0, .01, .025), new THREE.MeshBasicMaterial({ color: 0xdfeaff }));
  slit.position.set(PIPE.x0 / 2, AXIS + Ri - .006, P.z); scene.add(slit);
  const insideGlow = new THREE.PointLight(0xff8a3a, 6, 9, 1.8); insideGlow.position.set(.6, AXIS + .6, P.z); scene.add(insideGlow);
  merged([[0, 0], [1, 0], [2, 0], [.5, 1], [1.5, 1]].map(([a, b]) => new THREE.CylinderGeometry(P.R, P.R, 22, 64).rotateZ(Math.PI / 2).translate(40, P.R + .3 + b * P.R * 1.72, -61 + a * P.R * 2.05)), roll);
  merged([-61, -57].flatMap((z) => [boxG(20, .3, .6, 40, .15, z)]), darkSteel, false);

  // ---- tende da saldatura arancioni tra le linee (strisce in PVC)
  const curtain = new THREE.InstancedMesh(new THREE.PlaneGeometry(.5, 11.5), new THREE.MeshStandardMaterial({ color: 0xa8401a, transparent: true, opacity: .2, roughness: .3, side: THREE.DoubleSide, depthWrite: false }), 2 * 46);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let si = 0;
  for (const z of [-13, -39]) for (let k = 0; k < 46; k++) {
    e.set(0, (Math.random() - .5) * .25, (Math.random() - .5) * .04); q.setFromEuler(e);
    m4.compose(new THREE.Vector3(-12.4 + k * .55, 6.6, z + (k % 2) * .06), q, new THREE.Vector3(1, 1, 1)); curtain.setMatrixAt(si++, m4);
  }
  scene.add(curtain);
  merged([-13, -39].flatMap((z) => [boxG(26, .25, .25, 0, 12.5, z), boxG(.4, 12.5, .4, -13, 6.25, z), boxG(.4, 12.5, .4, 13, 6.25, z)]), darkSteel, false);

  // ---- torce reali, scalate a 100 mm/unità e appoggiate sul giunto
  const laser = laserHead(0); laser.scale.setScalar(2.16); laser.position.set(0, AXIS + LINES[0].R + .15, LINES[0].z); scene.add(laser);
  await idle();
  const combo = comboHead(0); combo.g.scale.setScalar(2.12); combo.g.position.set(0, AXIS + LINES[1].R + .1, LINES[1].z); scene.add(combo.g);
  await idle();
  const plasma = plasmaHead(0, 0.0062); plasma.g.position.set(0, AXIS + LINES[2].R + .12, LINES[2].z); scene.add(plasma.g);
  await idle();
  [laser, combo.g, plasma.g].forEach((g) => g.updateMatrixWorld(true));

  // ---- archi, bagni, luci d'arco e scintille per stazione
  const arcMat = (c: number) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false });
  const flareTex = glow("rgba(230,240,255,1)", "rgba(140,180,255,.35)"), sparkTex = glow("rgba(255,240,200,1)", "rgba(255,150,40,.8)");
  type Sparks = { pos: Float32Array; vel: Float32Array; life: Float32Array; geo: THREE.BufferGeometry; n: number; x: number; y: number; z: number; spread: number };
  type Station = { arcs: THREE.Group[]; light: THREE.PointLight; flare: THREE.Sprite; base: number; sparks: Sparks };
  const mkArc = (x: number, y0: number, h: number, w: number, z: number, col: number) => {
    const g = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(w, h, 20, 1, true), arcMat(col)); cone.position.y = h / 2; cone.rotation.x = Math.PI; g.add(cone);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(w * .1, w * .25, h, 8), coreMat); core.position.y = h / 2; g.add(core);
    g.position.set(x, y0, z); scene.add(g); return g;
  };
  const station = (i: number, tips: [number, number, number][], tone: number, base: number, n: number, spread: number): Station => {
    const L = LINES[i], y0 = AXIS + L.R + .01;
    const arcs = tips.map(([x, y, w]) => mkArc(x, y0, Math.max(.02, y - y0), w, L.z, tone));
    const light = new THREE.PointLight(tone, base, 20 + L.R * 6, 1.7); light.position.set(tips[0][0], y0 + .5, L.z + .6); scene.add(light);
    const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, color: tone, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    flare.position.set(tips[0][0], y0 + .05, L.z); flare.scale.setScalar(1.2 + L.R); scene.add(flare);
    const pos = new Float32Array(n * 3), vel = new Float32Array(n * 3), life = new Float32Array(n);
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ map: sparkTex, color: 0xffa040, size: .09 + L.R * .05, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
    return { arcs, light, flare, base, sparks: { pos, vel, life, geo, n, x: tips[0][0], y: y0 + .03, z: L.z, spread } };
  };
  const toWorld = (g: THREE.Object3D, x: number, y: number) => new THREE.Vector3(x, y, 0).applyMatrix4(g.matrixWorld);
  const tipL = toWorld(laser, 0, 0), tipsC = [combo.plasma, ...combo.tigs].map(([x, y]) => toWorld(combo.g, x, y)), tipsP = [...plasma.plasma, plasma.tig].map(([x, y]) => toWorld(plasma.g, x, y));
  const stations = [
    station(0, [[tipL.x, tipL.y, .03]], 0xff7a4a, 9, 70, .25),
    station(1, tipsC.map((v, k): [number, number, number] => [v.x, v.y, k ? .07 : .1]), LINES[1].tone, 16, 110, .5),
    station(2, tipsP.map((v, k): [number, number, number] => [v.x, v.y, k < 2 ? .16 : .1]), LINES[2].tone, 26, 220, 1),
  ];
  const emit = (s: Sparks, k: number) => {
    s.pos.set([s.x + (Math.random() - .5) * .2 * s.spread, s.y, s.z + (Math.random() - .5) * .1], k * 3);
    s.vel.set([(Math.random() - .5) * 2.4 * s.spread + .6, (1 + Math.random() * 2) * Math.sqrt(s.spread), (Math.random() - .5) * 2.4 * s.spread], k * 3);
    s.life[k] = .3 + Math.random() * .9;
  };
  stations.forEach((st) => { for (let k = 0; k < st.sparks.n; k++) { emit(st.sparks, k); st.sparks.life[k] = Math.random(); } });

  // ---- luci: cielo diffuso dai lucernari, sole dalle finestre con ombre, faro sulla stazione a fuoco
  scene.add(new THREE.HemisphereLight(0xe8eef5, 0x6f6a5e, .65));
  const key = new THREE.DirectionalLight(0xfff1de, 1.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.04; Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 90 });
  scene.add(key, key.target);
  const aimKey = (i: number) => { const z = i < 0 ? -26 : LINES[i].z; key.position.set(-18, 46, z + 22); key.target.position.set(0, 8, z); key.target.updateMatrixWorld(); renderer.shadowMap.needsUpdate = true; };
  const spot = new THREE.SpotLight(0xffffff, 0, 46, .42, .6, 1.5); scene.add(spot, spot.target);
  const spotAim = [new THREE.Vector3(0, 12, 0), new THREE.Vector3(0, 11, -26), new THREE.Vector3(0, 13.5, -52)];
  new THREE.TextureLoader().load("/media/logo-ledica.png", (t) => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(30, 30 * 444 / 1400), new THREE.MeshStandardMaterial({ map: t, roughness: .6 }));
    sign.position.set(0, 17, -73.4); scene.add(sign);
  });

  // ---- camera: per ogni tratto una Catmull-Rom attraverso i punti di passaggio
  const V = (a: V3) => new THREE.Vector3(...a);
  const segs = CHAPTERS.slice(1).map((c, i) => {
    const a = CHAPTERS[i], via = c.via ?? [];
    return {
      pos: new THREE.CatmullRomCurve3([V(a.pos), ...via.map((w) => V(w.p)), V(c.pos)], false, "centripetal"),
      tgt: new THREE.CatmullRomCurve3([V(a.target), ...via.map((w) => V(w.t)), V(c.target)], false, "centripetal"),
    };
  });
  const lerp = THREE.MathUtils.lerp;
  // volo d'ingresso dopo l'intro del leone: la camera parte alta e arretrata e scende sul capitolo 0 (-1 = in attesa, 0 = finito)
  let introAt = opts.intro ? -1 : 0;
  const INTRO_OFF = new THREE.Vector3(-14, 22, 30);
  let exact = 0, cur = 0, focus = -2, w = 1, h = 1, raf = 0, last = 0, visible = true, ready = false, px = 0, py = 0, tx = 0, ty = 0;
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3(), dir = new THREE.Vector3();

  const size = () => { const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); renderer.setSize(w, h, false); camera.aspect = w / h; };
  size();
  const ro = new ResizeObserver(size); ro.observe(host);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }); io.observe(host);
  const onMove = (ev: PointerEvent) => { tx = ev.clientX / innerWidth - .5; ty = ev.clientY / innerHeight - .5; };
  if (!opts.mobile && !opts.reduced) addEventListener("pointermove", onMove, { passive: true });

  function frame(now: number) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = last ? Math.min(.1, (now - last) / 1000) : 1 / 60; last = now;
    cur = opts.reduced ? Math.round(exact) : cur + (exact - cur) * (1 - Math.exp(-4.5 * dt));
    if (Math.abs(cur - exact) < 1e-4) cur = exact;
    const i = Math.min(CHAPTERS.length - 2, Math.floor(cur)), t = smooth(Math.min(1, cur - i));
    const A = CHAPTERS[i], B = CHAPTERS[i + 1];
    segs[i].pos.getPoint(t, tmpP); segs[i].tgt.getPoint(t, tmpT);
    // viewport alti: arretra lungo la direzione di vista e apri il campo
    const tall = Math.max(0, h / w - 1);
    dir.subVectors(tmpP, tmpT).normalize();
    tmpP.addScaledVector(dir, tall * 4);
    if (introAt) {
      const k = introAt < 0 ? 0 : Math.min(1, (now - introAt) / 2800);
      tmpP.addScaledVector(INTRO_OFF, (1 - k) ** 3);
      if (k >= 1) introAt = 0;
    }
    px += (tx - px) * Math.min(1, dt * 2); py += (ty - py) * Math.min(1, dt * 2);
    const par = 1 - Math.abs(t - .5) * 2 < .6 ? 1 : .4; // parallasse attenuata a metà transizione
    camera.position.set(tmpP.x + px * .5 * par, tmpP.y - py * .3 * par, tmpP.z);
    camera.lookAt(tmpT);
    camera.fov = lerp(A.fov, B.fov, t) + tall * 16;
    camera.filmOffset = w > 900 ? lerp(A.shift, B.shift, t) : 0;
    camera.updateProjectionMatrix();
    fog.density = lerp(A.fog, B.fog, t);
    renderer.toneMappingExposure = lerp(A.exposure, B.exposure, t);
    const f = t < .5 ? A.focus : B.focus;
    if (f !== focus) { focus = f; aimKey(f); }
    spot.intensity += ((f < 0 ? 0 : 90) - spot.intensity) * Math.min(1, dt * 2);
    if (f >= 0) { spot.target.position.lerp(spotAim[f], Math.min(1, dt * 3)); spot.position.set(spot.target.position.x - 7, spot.target.position.y + 11, spot.target.position.z + 12); spot.target.updateMatrixWorld(); }
    // movimento del materiale, rulli, coil, archi tremolanti e scintille solo vicino alla camera
    const speeds = [.5, .36, .12];
    if (!opts.reduced) {
      tubeMaps.forEach((m, k) => { m.offset.y -= speeds[k] * dt; });
      rollers.forEach((r) => { r.rotation.y += dt * 1.2; });
      coils.forEach((c) => { c.rotation.y -= dt * .25; });
    }
    stations.forEach((st, k) => {
      const near = camera.position.distanceTo(st.light.position) < 40;
      const fl = opts.reduced ? 1 : .78 + Math.random() * .44;
      st.light.intensity = st.base * fl; st.flare.material.opacity = .7 * fl;
      st.arcs.forEach((a, j) => { a.scale.set(1 + (Math.random() - .5) * .15 * +!opts.reduced, fl, 1); a.children[0].rotation.y = now / 120 + j; });
      if (!near || opts.reduced) return;
      const s = st.sparks, floorY = AXIS - LINES[k].R * .5;
      for (let n = 0; n < s.n; n++) {
        s.life[n] -= dt; if (s.life[n] <= 0) emit(s, n);
        s.vel[n * 3 + 1] -= 6 * dt; s.pos[n * 3] += s.vel[n * 3] * dt; s.pos[n * 3 + 1] += s.vel[n * 3 + 1] * dt; s.pos[n * 3 + 2] += s.vel[n * 3 + 2] * dt;
        if (s.pos[n * 3 + 1] < floorY) s.life[n] = 0;
      }
      s.geo.attributes.position.needsUpdate = true;
    });
    insideGlow.intensity = 6 * (opts.reduced ? 1 : .8 + Math.random() * .4);
    renderer.render(scene, camera);
    if (!ready) { ready = true; opts.onReady?.(); }
    raf = requestAnimationFrame(frame);
  }
  // shader compilati in parallelo; su alcuni driver la promessa non si risolve mai: dopo 1,5 s si parte comunque
  await Promise.race([renderer.compileAsync(scene, camera).catch(() => {}), new Promise((r) => setTimeout(r, 1500))]);
  raf = requestAnimationFrame(frame);

  return {
    setProgress(p: number) { exact = Math.max(0, Math.min(CHAPTERS.length - 1, p)); },
    intro() { if (introAt < 0) introAt = performance.now(); },
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener("pointermove", onMove);
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose()); });
      pm.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
