import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { laserHead } from "../laserHead";
import { comboHead } from "../comboHead";
import { plasmaHead } from "../plasmaHead";
import { tigTorch } from "../tigTorch";

/* Spaccato di processo per le schede tecnologia: la torcia lavora sul tubo, tagliato in sezione subito dopo l'ultimo arco.
   Lato saldato (x ≥ cut) pieno; lato in arrivo trasparente, con il giunto aperto. Sulla faccia di taglio la zona fusa e la ZTA.
   Il materiale avanza verso +x. Tre passi per tecnologia: camera ed etichette di processo. */

type V3 = [number, number, number];
type Arc = { x: number; tip: number; w: number; col: number; osc?: boolean; z?: number };
type FZ = [number, number, number, number, number, number?]; // larghezza in alto/metà/radice, corona, rovescio, profondità (1 = piena penetrazione)
type Rig = { z: number; fz: FZ; arcs: Arc[]; full: boolean }; // un tubo con la sua sezione: più rig = confronto affiancato
type Step = { cam: V3; tgt: V3; tags: string[] };
type Built = { arcs: Arc[]; cut: number; anchors: Record<string, V3>; fz: FZ; rigs?: Rig[]; extra?: (s: Scene) => void };
type Scene = { scene: THREE.Scene; R: number; wall: number; cut: number; heat: THREE.Texture; glow: THREE.Texture };
export type ProcessKey = "laser-fibra" | "tig-multicatodo" | "combo-plasma-tig" | "plasma-key-hole" | "ripresa-interna" | "generatori-accessori";

const BLUE = 0x8fb8ff, VIOLET = 0xc9a8ff, LASER = 0xff7a4a;
const CFG: Record<ProcessKey, { R: number; wall: number; build: (g: THREE.Group, R: number, wall: number) => Built; steps: Step[] }> = {
  "laser-fibra": {
    R: 1, wall: .06,
    build: (g, R) => { const h = laserHead(R + .12); g.add(h); return { arcs: [{ x: 0, tip: R + .12, w: .02, col: LASER }], cut: .06, fz: [.07, .03, .035, .012, .01],
      anchors: { beam: [0, R + .07, 0], fusion: [.06, R - .03, 0], haz: [.06, R - .015, .1], speed: [1.8, R + .03, 0] } }; },
    steps: [
      { cam: [-1.6, 1.9, 1.9], tgt: [0, 1.25, 0], tags: ["beam"] },
      { cam: [-1.7, 1.25, .85], tgt: [.06, .97, 0], tags: ["fusion", "haz"] },
      { cam: [-3.2, 2.8, 4.2], tgt: [.8, 1.6, 0], tags: ["speed"] },
    ],
  },
  "tig-multicatodo": {
    R: 1, wall: .1,
    build: (g, R) => {
      for (const x of [-.55, 0, .55]) { const t = tigTorch(R + .08); t.position.x = x; g.add(t); }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.9, .22, .16), new THREE.MeshStandardMaterial({ color: 0x17181a, metalness: .55, roughness: .4 }));
      bar.position.set(0, R + .08 + 2.25, -.22); g.add(bar);
      return { arcs: [-.55, 0, .55].map((x, i) => ({ x, tip: R + .08, w: .07, col: BLUE, osc: i === 2 })), cut: .62, fz: [.42, .28, .14, .02, .015],
        anchors: { arc1: [-.55, R + .05, 0], pool: [0, R + .02, .14], osc: [.55, R + .1, .06], fusion: [.62, R - .05, 0] } };
    },
    steps: [
      { cam: [-2.2, 1.6, 1.8], tgt: [-.55, 1.15, 0], tags: ["arc1"] },
      { cam: [-1.2, 2.4, 2.6], tgt: [0, 1.1, 0], tags: ["pool"] },
      { cam: [-1.6, 1.35, 1.3], tgt: [.62, .95, 0], tags: ["osc", "fusion"] },
    ],
  },
  "combo-plasma-tig": {
    R: 1, wall: .1,
    build: (g, R) => {
      const c = comboHead(0), sc = 1.4; c.g.scale.setScalar(sc); c.g.position.y = R + .07; g.add(c.g);
      const tips = [c.plasma, ...c.tigs].map(([x, y]) => [x * sc, R + .07 + y * sc]);
      return { arcs: tips.map(([x, tip], i) => ({ x, tip, w: i ? .06 : .09, col: i ? BLUE : VIOLET })), cut: tips[2][0] + .05, fz: [.4, .26, .13, .02, .015],
        anchors: { plasma: [tips[0][0], R + .12, 0], dirt: [-1, R + .02, 0], clean: [tips[1][0], R + .05, .1], fusion: [tips[2][0] + .05, R - .05, 0], wear: [tips[2][0], R + .22, .08] } };
    },
    steps: [
      { cam: [-2.1, 1.7, 1.6], tgt: [-.26, 1.15, 0], tags: ["plasma", "dirt"] },
      { cam: [-.6, 1.9, 2.2], tgt: [.2, 1.15, 0], tags: ["clean", "wear"] },
      { cam: [-1.4, 1.3, 1.1], tgt: [.32, .95, 0], tags: ["fusion"] },
    ],
  },
  "plasma-key-hole": {
    R: 1.4, wall: .42,
    build: (g, R) => {
      const p = plasmaHead(R + .06); g.add(p.g);
      return { arcs: [...p.plasma.map(([x, tip]) => ({ x, tip, w: .1, col: VIOLET })), { x: p.tig[0], tip: p.tig[1], w: .07, col: BLUE, osc: true }], cut: p.tig[0] + .05, fz: [.3, .12, .2, .04, .04],
        anchors: { keyhole: [p.plasma[1][0], R - .21, .05], tig: [p.tig[0], R + .12, 0], fusion: [p.tig[0] + .05, R - .2, 0], onepass: [1.7, R + .05, 0] } };
    },
    steps: [
      { cam: [-2.6, 1.7, 2.0], tgt: [-.45, 1.2, 0], tags: ["keyhole"] },
      { cam: [-.4, 2.7, 2.8], tgt: [.5, 1.6, 0], tags: ["tig"] },
      { cam: [-1.9, 1.5, 1.5], tgt: [.66, 1.2, 0], tags: ["fusion", "onepass"] },
    ],
  },
  "ripresa-interna": {
    R: 1.8, wall: .16,
    build: (g, R, wall) => {
      const ext = tigTorch(R + .08); ext.position.x = -.6; g.add(ext);
      const inner = tigTorch(0); inner.rotation.z = Math.PI; inner.position.set(.25, R - wall - .08, 0); g.add(inner); // torcia interna rivolta verso l'alto
      const steel = new THREE.MeshStandardMaterial({ color: 0x59616a, metalness: .8, roughness: .4 });
      const boom = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 6, 20), steel); boom.rotation.z = Math.PI / 2; boom.position.set(-2.6, R - wall - 2.3, -.18); g.add(boom);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(.12, .5, .12), steel); arm.position.set(.12, R - wall - 2.1, -.18); g.add(arm);
      const cam = new THREE.Mesh(new THREE.BoxGeometry(.26, .16, .2), new THREE.MeshStandardMaterial({ color: 0x23272b, metalness: .4, roughness: .5 }));
      cam.position.set(.85, R - wall - .55, .35); g.add(cam);
      return { arcs: [{ x: -.6, tip: R + .08, w: .07, col: BLUE }, { x: .25, tip: R - wall - .08, w: .06, col: BLUE, osc: true }], cut: .5, fz: [.34, .22, .16, .02, .004],
        anchors: { outside: [-.6, R + .05, 0], relief: [-.2, R - wall - .05, 0], inner: [.25, R - wall - .3, 0], flat: [1.7, R - wall - .01, 0], fusion: [.5, R - .08, 0] },
        extra: ({ scene, R: r, wall: w, heat }) => { // cordone interno: in rilievo prima della torcia interna, appiattito dopo
          const bump = new THREE.Mesh(new THREE.BoxGeometry(.85, .05, .12), new THREE.MeshStandardMaterial({ color: 0x9aa1a7, metalness: .9, roughness: .4, emissive: 0xffffff, emissiveMap: heat, emissiveIntensity: 1.2 }));
          bump.position.set(-.18, r - w - .02, 0); scene.add(bump);
        } };
    },
    steps: [
      { cam: [-2.6, 2.9, 2.4], tgt: [-.6, 1.9, 0], tags: ["outside"] },
      { cam: [-2.4, 1.1, 2.4], tgt: [0, 1.5, 0], tags: ["relief", "inner"] },
      { cam: [-2.0, 1.55, 1.9], tgt: [.55, 1.6, 0], tags: ["flat"] },
    ],
  },
  "generatori-accessori": {
    R: .8, wall: .14,
    build: (g, R) => {
      for (const z of [-1, 1]) { const t = tigTorch(R + .08); t.position.z = z; g.add(t); }
      const tip = R + .08;
      return {
        arcs: [], fz: [0, 0, 0, 0, 0], cut: .06,
        rigs: [
          { z: -1, fz: [.5, .36, .2, .02, 0, .55], arcs: [{ x: 0, tip, w: .17, col: BLUE, z: -1 }], full: false }, // corrente continua: arco largo, poco profondo
          { z: 1, fz: [.24, .12, .1, .02, .006, 1], arcs: [{ x: 0, tip, w: .05, col: 0xd6e6ff, z: 1 }], full: true }, // 15 kHz: arco stretto, piena penetrazione
        ],
        anchors: { dc: [0, R + .1, -1], pk: [0, R + .1, 1], amp: [0, R + .9, 1.05], haz: [.06, R - .04, -1.2], pen: [.06, R - .1, 1], root: [.6, R - .14 - .01, 1] },
      };
    },
    steps: [
      { cam: [-3.4, 2.1, .4], tgt: [0, 1.0, 0], tags: ["dc", "pk", "amp"] },
      { cam: [-2.1, 1.0, 0], tgt: [.06, .7, 0], tags: ["haz", "pen"] },
      { cam: [-1.3, .5, 1.05], tgt: [.9, .64, 1], tags: ["root"] },
    ],
  },
};

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

export function createProcessWorld(host: HTMLElement, key: ProcessKey, opts: { reduced: boolean; tags: { key: string; el: HTMLElement }[]; onUser: () => void; onReady?: () => void }) {
  const cfg = CFG[key], { R, wall } = cfg;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y";
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = .8;
  scene.add(new THREE.HemisphereLight(0xe8eef5, 0x2a2622, .5));
  const key1 = new THREE.DirectionalLight(0xfff4e6, 1.3); key1.position.set(-3, 6, 4); scene.add(key1);
  const camera = new THREE.PerspectiveCamera(34, 1, .02, 60);

  const heat = canvasTex(256, 4, (g) => { const gr = g.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, "#fff1c0"); gr.addColorStop(.12, "#ff5a10"); gr.addColorStop(.45, "#1a0600"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, 256, 4); });
  const glow = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "#fff"); gr.addColorStop(.35, "rgba(255,170,90,.8)"); gr.addColorStop(1, "rgba(255,90,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const brushed = canvasTex(256, 256, (g) => { g.fillStyle = "#c4c9cd"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${Math.random() > .5 ? "255,255,255" : "40,45,50"},${Math.random() * .09})`; g.fillRect(Math.random() * 256, 0, 1 + Math.random(), 256); } });
  brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping; brushed.repeat.set(1, 3);

  const torch = new THREE.Group(); scene.add(torch);
  const B = cfg.build(torch, R, wall), cut = B.cut, L = 7;
  // ---- un rig per tubo: lato saldato pieno, lato in arrivo trasparente, sezione sulla faccia di taglio, archi
  const rigs: Rig[] = B.rigs ?? [{ z: 0, fz: B.fz, arcs: B.arcs, full: true }];
  const steel = new THREE.MeshStandardMaterial({ map: brushed, color: 0xe4e8eb, metalness: .95, roughness: .3 });
  const steelIn = new THREE.MeshStandardMaterial({ color: 0x8d949a, metalness: .9, roughness: .45, side: THREE.BackSide });
  const ghostMat = new THREE.MeshStandardMaterial({ color: 0xcfd6db, metalness: .6, roughness: .3, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide });
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xd9dde0, metalness: .85, roughness: .32, side: THREE.DoubleSide });
  const beadMat = new THREE.MeshStandardMaterial({ color: 0xaab0b5, metalness: .9, roughness: .35, emissive: 0xffffff, emissiveMap: heat, emissiveIntensity: 1.8 });
  const grooveMat = new THREE.MeshBasicMaterial({ color: 0x0b0d0e });
  const hazMat = new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: .28, depthWrite: false });
  const fzTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 20, 0, 64, 40, 110); gr.addColorStop(0, "#fff6d8"); gr.addColorStop(.3, "#ffb14a"); gr.addColorStop(.7, "#e0420e"); gr.addColorStop(1, "#5a1206"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const fusionMat = new THREE.MeshBasicMaterial({ map: fzTex });
  const tube = (r: number, mat: THREE.Material, x: number, z: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 128, 1, true), mat); m.rotation.z = Math.PI / 2; m.position.set(x, 0, z); scene.add(m); };
  const fzShape = ([tw, mw, rw, crown, rb, depth = 1]: FZ, k: number, ky: number) => {
    const sh = new THREE.Shape(), v = (x: number, y: number) => new THREE.Vector2(x, y), d = wall * depth * ky;
    sh.moveTo(-tw * k / 2, R); sh.splineThru([v(-mw * k / 2, R - d * .55), v(-rw * k / 2, R - d)]);
    sh.quadraticCurveTo(0, R - d - rb * 2 * ky, rw * k / 2, R - d);
    sh.splineThru([v(mw * k / 2, R - d * .55), v(tw * k / 2, R)]);
    sh.quadraticCurveTo(0, R + crown * 2, -tw * k / 2, R);
    return sh;
  };
  const shapeMesh = (sh: THREE.Shape, mat: THREE.Material, dx: number, z: number) => {
    const geo = new THREE.ShapeGeometry(sh, 24); geo.computeBoundingBox();
    const bb = geo.boundingBox!, uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
    const m = new THREE.Mesh(geo, mat); m.rotation.y = -Math.PI / 2; m.position.set(cut - dx, 0, z); scene.add(m);
  };
  const arcGroups: { g: THREE.Group; a: Arc }[] = [];
  for (const rig of rigs) {
    const z = rig.z, first = Math.min(...rig.arcs.map((a) => a.x));
    tube(R, steel, cut + L / 2, z); tube(R - wall, steelIn, cut + L / 2, z);
    tube(R, ghostMat, cut - L / 2, z); tube(R - wall, ghostMat, cut - L / 2, z);
    const face = new THREE.Mesh(new THREE.RingGeometry(R - wall, R, 160), faceMat); face.rotation.y = -Math.PI / 2; face.position.set(cut, 0, z); scene.add(face);
    // giunto aperto in arrivo, cordone caldo sul dritto; sul rovescio solo se la penetrazione è completa
    const groove = new THREE.Mesh(new THREE.BoxGeometry(first - (cut - L), .012, .02), grooveMat); groove.position.set((first + cut - L) / 2, R + .002, z); scene.add(groove);
    const bead = new THREE.Mesh(new THREE.BoxGeometry(L, .03, .1), beadMat); bead.position.set(first + L / 2, R + .01, z); scene.add(bead);
    if (rig.full) { const root = new THREE.Mesh(new THREE.BoxGeometry(L, .012, .06), beadMat); root.position.set(cut + L / 2, R - wall - .004, z); scene.add(root); }
    shapeMesh(fzShape(rig.fz, 1.9, 1.15), hazMat, .002, z);
    shapeMesh(fzShape(rig.fz, 1, 1), fusionMat, .004, z);
    for (const a of rig.arcs) {
      const surf = a.tip > R ? R + .004 : R - wall - .004, h = Math.max(.02, Math.abs(a.tip - surf)), az = a.z ?? z;
      const g = new THREE.Group();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(a.w, h, 20, 1, true), new THREE.MeshBasicMaterial({ color: a.col, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      cone.position.y = h / 2; cone.rotation.x = Math.PI; g.add(cone);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(a.w * .1, a.w * .25, h, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false }));
      core.position.y = h / 2; g.add(core);
      g.position.set(a.x, surf, az); if (a.tip < R) g.rotation.z = Math.PI; // arco interno: dalla torcia verso l'alto
      const pool = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: a.col === LASER ? 0xffb070 : 0xffd2a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      pool.position.set(a.x, surf, az); pool.scale.setScalar(a.w * 6); scene.add(g, pool);
      arcGroups.push({ g, a });
    }
  }
  B.extra?.({ scene, R, wall, cut, heat, glow });
  const main = rigs[0], first = Math.min(...main.arcs.map((a) => a.x));
  if (key === "plasma-key-hole") for (const a of main.arcs.slice(0, 2)) {
    const kh = new THREE.Mesh(new THREE.CylinderGeometry(.014, .024, wall, 16), new THREE.MeshBasicMaterial({ color: 0xffa04a, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false }));
    kh.position.set(a.x, R - wall / 2, 0); scene.add(kh);
  }
  const arcLight = new THREE.PointLight(main.arcs[0].col, 3, 6, 1.6); arcLight.position.set(first, R + .4, main.z + .4); scene.add(arcLight);
  // sporco sui lembi davanti al plasma (combo): brucia quando passa sotto il primo arco
  const dirtN = key === "combo-plasma-tig" ? 40 : 0, dirt = new THREE.InstancedMesh(new THREE.SphereGeometry(.012, 6, 4), new THREE.MeshStandardMaterial({ color: 0x5a4a30, roughness: .9 }), Math.max(1, dirtN));
  const dx = new Float32Array(dirtN), dz = new Float32Array(dirtN), m4 = new THREE.Matrix4();
  for (let i = 0; i < dirtN; i++) { dx[i] = cut - L + Math.random() * (first - cut + L); dz[i] = (Math.random() - .5) * .1; }
  if (dirtN) scene.add(dirt);

  // ---- camera: passi con volo morbido, trascinamento libero
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enablePan: false, enableZoom: false, enableDamping: !opts.reduced, dampingFactor: .08, rotateSpeed: .6 });
  renderer.domElement.style.touchAction = "pan-y";
  let step = 0, flying = true;
  const goal = () => cfg.steps[step];
  camera.position.set(...goal().cam); controls.target.set(...goal().tgt);
  controls.addEventListener("start", () => { flying = false; opts.onUser(); });
  const gp = new THREE.Vector3(), gt = new THREE.Vector3(), proj = new THREE.Vector3();
  const tags = opts.tags.filter((t) => B.anchors[t.key]).map((t) => ({ ...t, p: new THREE.Vector3(...B.anchors[t.key]) }));

  let w = 1, h = 1, raf = 0, last = 0, visible = true, ready = false;
  const size = () => { const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(host);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }); io.observe(host);

  function frame(now: number) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = last ? Math.min(.1, (now - last) / 1000) : 1 / 60; last = now;
    if (flying) {
      const k = opts.reduced ? 1 : Math.min(1, dt * 2.2);
      camera.position.lerp(gp.set(...goal().cam), k); controls.target.lerp(gt.set(...goal().tgt), k);
      if (camera.position.distanceTo(gp) < .005) flying = false;
    }
    controls.update(dt);
    if (!opts.reduced) brushed.offset.y -= .12 * dt;
    const fl = opts.reduced ? 1 : .8 + Math.random() * .4;
    arcGroups.forEach(({ g, a }, i) => { g.scale.set(1, fl, 1); g.children[0].rotation.y = now / 120 + i; if (a.osc && !opts.reduced) g.position.z = (a.z ?? 0) + Math.sin(now / 160) * .04; });
    arcLight.intensity = 3 * fl;
    fusionMat.color.setScalar(.85 + .15 * Math.sin(now / 300));
    if (dirtN) {
      for (let i = 0; i < dirtN; i++) {
        if (!opts.reduced) dx[i] += .12 * dt;
        if (dx[i] > first) dx[i] = cut - L; // bruciato dal plasma, ne arriva altro
        m4.makeTranslation(dx[i], R + .012, dz[i]); dirt.setMatrixAt(i, m4);
      }
      dirt.instanceMatrix.needsUpdate = true;
    }
    for (const t of tags) {
      const on = goal().tags.includes(t.key);
      proj.copy(t.p).project(camera);
      const show = on && proj.z < 1;
      t.el.style.opacity = show ? "1" : "0";
      if (show) { const sx = (proj.x * .5 + .5) * w; t.el.style.transform = `translate(${sx}px, ${(-proj.y * .5 + .5) * h}px)`; t.el.classList.toggle("flip", sx > w * .72); }
    }
    renderer.render(scene, camera);
    if (!ready) { ready = true; opts.onReady?.(); }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    setStep(i: number) { step = Math.max(0, Math.min(cfg.steps.length - 1, i)); flying = true; },
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose();
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose()); });
      pm.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
