"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Rotate3d } from "lucide-react";
import { laserHead } from "./laserHead";
import { comboHead } from "./comboHead";
import { plasmaHead } from "./plasmaHead";
import { torchMode as modeOf, type TorchMode as Mode } from "./torchMode";

export type SceneLabels = { laser: string; combo: string; keyhole: string; wall: string; drag: string };
const R = 1.15, X0 = -3.6, X1 = 22;
const wallOf = (v: number) => 0.035 + (v / 12.7) * 0.42;

const glowTex = (inner: string, outer: string) => {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(.35, outer); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const brushed = () => {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512;
  const g = c.getContext("2d")!; g.fillStyle = "#c4c9cd"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { const x = Math.random() * 512; g.fillStyle = `rgba(${Math.random() > .5 ? "255,255,255" : "40,45,50"},${Math.random() * .09})`; g.fillRect(x, 0, 1 + Math.random() * 1.5, 512); }
  const band = g.createLinearGradient(0, 0, 0, 512);
  band.addColorStop(0, "rgba(30,34,38,.55)"); band.addColorStop(.03, "rgba(30,34,38,0)"); band.addColorStop(.97, "rgba(30,34,38,0)"); band.addColorStop(1, "rgba(30,34,38,.55)");
  g.fillStyle = band; g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 4); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const heatTex = () => {
  const c = document.createElement("canvas"); c.width = 256; c.height = 4;
  const g = c.getContext("2d")!; const gr = g.createLinearGradient(0, 0, 256, 0);
  gr.addColorStop(0, "#000"); gr.addColorStop(.55, "#1a0600"); gr.addColorStop(.85, "#ff5a10"); gr.addColorStop(1, "#fff1c0");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

export default function WeldScene({ v, labels, onReady }: { v: number; labels: SceneLabels; onReady?: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const vRef = useRef(v); vRef.current = v;
  const lab = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const wallLab = useRef<HTMLDivElement>(null);
  const wake = useRef<() => void>(() => {});
  useEffect(() => { wake.current(); }, [v]);

  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); } catch { return; }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false; // testa e luce sono ferme: ombre ricalcolate solo al cambio modalità
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const fog = new THREE.Fog(0x161816, 10, 20); scene.fog = fog;
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

    // ---- tubo
    const mapT = brushed();
    const steel = new THREE.MeshStandardMaterial({ map: mapT, metalness: 0.95, roughness: 0.3, color: 0xe4e8eb, envMapIntensity: 1.15 });
    const tube = new THREE.Group(); scene.add(tube);
    const L = X1 - X0; mapT.repeat.y = 4 * L / 10.6; // tubo lungo: le viste laterali non ne mostrano la fine
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 96, 1, true), steel);
    outer.rotation.z = Math.PI / 2; outer.position.x = (X0 + X1) / 2; outer.receiveShadow = true; tube.add(outer);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x8d949a, metalness: 0.9, roughness: 0.45, side: THREE.BackSide });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf1f3f4, metalness: 1, roughness: 0.22, side: THREE.DoubleSide, envMapIntensity: 1.4 });
    let inner: THREE.Mesh, cap: THREE.Mesh, curWall = -1;
    const setWall = (w: number) => {
      if (Math.abs(w - curWall) < 0.002) return; curWall = w;
      inner?.geometry.dispose(); cap?.geometry.dispose(); inner && tube.remove(inner); cap && tube.remove(cap);
      inner = new THREE.Mesh(new THREE.CylinderGeometry(R - w, R - w, L, 96, 1, true), innerMat);
      inner.rotation.z = Math.PI / 2; inner.position.x = (X0 + X1) / 2;
      cap = new THREE.Mesh(new THREE.RingGeometry(R - w, R, 96), capMat);
      cap.rotation.y = -Math.PI / 2; cap.position.x = X0 - 0.001;
      tube.add(inner, cap);
    };
    setWall(wallOf(vRef.current));

    // ---- giunto: fessura davanti, cordone caldo dietro
    const groove = new THREE.Mesh(new THREE.BoxGeometry(X1, 0.012, 0.03), new THREE.MeshStandardMaterial({ color: 0x15181a, metalness: .4, roughness: .8 }));
    groove.position.set(X1 / 2, R + 0.004, 0); scene.add(groove);
    const bead = new THREE.Mesh(new THREE.BoxGeometry(-X0, 0.03, 0.09), new THREE.MeshStandardMaterial({ color: 0xaab0b5, metalness: .9, roughness: .35, emissive: 0xffffff, emissiveMap: heatTex(), emissiveIntensity: 1.8 }));
    bead.position.set(X0 / 2, R + 0.01, 0); scene.add(bead);

    // ---- torcia
    const torch = new THREE.Group(); scene.add(torch);
    const sets: Record<Mode, THREE.Group> = { laser: new THREE.Group(), combo: new THREE.Group(), keyhole: new THREE.Group() };
    sets.laser.add(laserHead(R + 0.42));
    const combo = comboHead(R + 0.06); sets.combo.add(combo.g);
    const heavy = plasmaHead(R + 0.06); sets.keyhole.add(heavy.g);
    Object.values(sets).forEach((g) => torch.add(g));

    // ---- archi: coni additivi + nucleo
    const arcMat = (c: number) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const mkArc = (x: number, h: number, w: number, col: number) => {
      const g = new THREE.Group();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(w, h, 20, 1, true), arcMat(col)); cone.position.y = h / 2; cone.rotation.x = Math.PI; g.add(cone);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, h, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false })); core.position.y = h / 2; g.add(core);
      g.position.set(x, R + 0.02, 0); return g;
    };
    const arcs: THREE.Group[] = [];
    const cj = mkArc(combo.plasma[0], combo.plasma[1] - R - 0.02, 0.07, 0xc9a8ff); sets.combo.add(cj); arcs.push(cj);
    combo.tigs.forEach(([x, y]) => { const a = mkArc(x, y - R - 0.02, 0.06, 0x8fb8ff); sets.combo.add(a); arcs.push(a); });
    heavy.plasma.forEach(([x, y]) => { const a = mkArc(x, y - R - 0.02, 0.09, 0xc9a8ff); sets.keyhole.add(a); arcs.push(a); });
    const ht = mkArc(heavy.tig[0], heavy.tig[1] - R - 0.02, 0.06, 0x8fb8ff); sets.keyhole.add(ht); arcs.push(ht);
    const beam = mkArc(0, 0.42, 0.03, 0xff7a4a); sets.laser.add(beam); arcs.push(beam);

    // ---- bagno + luce + scintille
    const poolMat = new THREE.MeshBasicMaterial({ map: glowTex("rgba(255,255,255,1)", "rgba(255,140,40,.7)"), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.set(-0.15, R + 0.03, 0); scene.add(pool);
    const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex("rgba(190,215,255,1)", "rgba(110,160,255,.35)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    flare.position.set(0, R + 0.12, 0); flare.scale.set(1.3, 1.3, 1); scene.add(flare);
    const light = new THREE.PointLight(0x9cc0ff, 14, 7, 1.6); light.position.set(0, R + 0.55, 0.3); scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const rim = new THREE.DirectionalLight(0x9fe070, 1.1); rim.position.set(-4, 3, -5); scene.add(rim);
    // luci da studio per le torce reali
    const key = new THREE.DirectionalLight(0xfff4e6, 1.1); key.position.set(-2.5, 7.5, 5); key.target.position.set(0.3, 2.2, 0); scene.add(key, key.target);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -2.4, right: 2.4, top: 2.4, bottom: -2.4, near: 2, far: 16 });
    const fill = new THREE.DirectionalLight(0xcfe0ff, 0.35); fill.position.set(5, 2, 3); scene.add(fill);

    const N = 90; const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), life = new Float32Array(N);
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const sparks = new THREE.Points(sg, new THREE.PointsMaterial({ map: glowTex("rgba(255,240,200,1)", "rgba(255,150,40,.8)"), color: 0xffa040, size: 0.07, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    scene.add(sparks);
    const emit = (i: number) => { pos.set([(Math.random() - .5) * .3, R + .05, (Math.random() - .5) * .1], i * 3); vel.set([(Math.random() - .5) * 1.8 - .4, 1 + Math.random() * 1.6, (Math.random() - .5) * 1.8], i * 3); life[i] = Math.random() * 0.9 + 0.2; };
    for (let i = 0; i < N; i++) { emit(i); life[i] = Math.random(); }

    // ---- loop + camera orbitale (trascina = ruota; pinch o ctrl+rotella = zoom; rotella semplice scorre la pagina)
    let w = 1, h = 1, raf = 0, last = performance.now(), visible = true, mode: Mode = modeOf(vRef.current), idle = 0, held = false, flying = false, shown = false;
    const views: Record<Mode, [THREE.Vector3, THREE.Vector3]> = {
      laser: [new THREE.Vector3(-2.3, 3.2, 7.2), new THREE.Vector3(0.3, 2.3, 0)],
      combo: [new THREE.Vector3(-1.5, 2.55, 5.0), new THREE.Vector3(0, 1.95, 0)],
      keyhole: [new THREE.Vector3(-2.8, 3.5, 9.0), new THREE.Vector3(0, 2.5, 0)],
    };
    camera.position.copy(views[mode][0]); renderer.shadowMap.needsUpdate = true;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(views[mode][1]);
    Object.assign(controls, { enablePan: false, enableDamping: !reduced, dampingFactor: 0.08, rotateSpeed: 0.7, zoomSpeed: 0.8, minDistance: 2.2, maxDistance: 14, maxPolarAngle: Math.PI * 0.82, autoRotateSpeed: 0.8 });
    renderer.domElement.style.touchAction = "pan-y"; // su touch lo scroll verticale resta alla pagina
    const onWheel = (e: WheelEvent) => { controls.enableZoom = e.ctrlKey || e.metaKey; };
    el.addEventListener("wheel", onWheel, { capture: true });
    controls.addEventListener("start", () => { held = true; flying = false; idle = 0; if (hint.current) hint.current.style.opacity = "0"; });
    controls.addEventListener("end", () => { held = false; });
    if (reduced) controls.addEventListener("change", () => wake.current()); // con animazione il loop è già continuo: un secondo wake duplicherebbe i rAF
    const size = () => { const r = el.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    size(); const ro = new ResizeObserver(() => { size(); wake.current(); }); ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake.current(); }); io.observe(el);
    const tmp = new THREE.Vector3();

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
      const vv = vRef.current; const m = modeOf(vv);
      if (m !== mode) { mode = m; renderer.shadowMap.needsUpdate = true; flying = true; idle = 0; if (reduced) { camera.position.copy(views[m][0]); controls.target.copy(views[m][1]); flying = false; } }
      (Object.keys(sets) as Mode[]).forEach((k) => (sets[k].visible = k === mode));
      setWall(wallOf(vv));
      if (flying) {
        const k = Math.min(1, dt * 2.5);
        camera.position.lerp(views[mode][0], k); controls.target.lerp(views[mode][1], k);
        if (camera.position.distanceTo(views[mode][0]) < 0.02) flying = false;
      }
      if (!held) idle += dt;
      controls.autoRotate = !reduced && !flying && idle > 4; // torce reali: giro lento da vetrina
      controls.update(dt);
      const d = camera.position.distanceTo(controls.target); fog.near = d + 0.6; fog.far = d + 11;
      const speed = mode === "laser" ? 0.5 : mode === "combo" ? 0.36 : 0.18;
      if (!reduced) mapT.offset.y -= speed * dt;
      const fl = reduced ? 1 : 0.8 + Math.random() * 0.4;
      arcs.forEach((a, i) => { a.scale.set(1 + (Math.random() - .5) * .15 * +!reduced, fl, 1); (a.children[0] as THREE.Mesh).rotation.y = t * 8 + i; });
      light.intensity = (mode === "laser" ? 7 : 14) * fl; flare.material.opacity = 0.6 * fl; flare.scale.setScalar(mode === "laser" ? .8 : 1.3 * fl);
      pool.scale.set(mode === "keyhole" ? 1.5 : mode === "laser" ? .5 : 1, 1, 1);
      for (let i = 0; i < N; i++) {
        life[i] -= dt; if (life[i] <= 0) emit(i);
        vel[i * 3 + 1] -= 5 * dt; pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        if (pos[i * 3 + 1] < R * .2) life[i] = 0;
      }
      sg.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      if (!shown) { shown = true; el.style.opacity = "1"; onReady?.(); }
      // etichette HTML ancorate alla scena
      if (wallLab.current) {
        tmp.set(X0, R - wallOf(vv) / 2, 0).project(camera);
        wallLab.current.style.transform = `translate(${Math.max(130, (tmp.x * .5 + .5) * w)}px, ${(-tmp.y * .5 + .5) * h}px)`; // l'etichetta è allineata a destra: mai fuori dal bordo sinistro
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    wake.current = () => { if (!raf && visible) raf = requestAnimationFrame((n) => { last = n; frame(n); }); };
    wake.current();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose(); el.removeEventListener("wheel", onWheel, { capture: true });
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose()); });
      pm.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, [onReady]);

  const m = modeOf(v);
  const f = (n: number) => n.toFixed(1).replace(".", labels.wall.includes("wall") ? "." : ",");
  return (
    <div ref={host} className="scene" aria-hidden="true">
      <div ref={wallLab} className="scene-wall mono"><span>{labels.wall} {f(v)} mm</span></div>
      <div ref={hint} className="scene-hint mono"><Rotate3d size={14} aria-hidden="true" /> {labels.drag}</div>
      <div ref={lab} className="scene-mode mono">{m === "laser" ? labels.laser : m === "combo" ? labels.combo : labels.keyhole}</div>
    </div>
  );
}
