"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type SceneLabels = { laser: string; tri: string; keyhole: string; wall: string };
type Mode = "laser" | "tri" | "keyhole";
const R = 1.15, X0 = -3.6, X1 = 7;
const modeOf = (v: number): Mode => (v <= 0.5 ? "laser" : v <= 3.5 ? "tri" : "keyhole");
const wallOf = (v: number) => 0.035 + (v / 12) * 0.42;

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
  const wallLab = useRef<HTMLDivElement>(null);
  const wake = useRef<() => void>(() => {});
  useEffect(() => { wake.current(); }, [v]);

  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); } catch { return; }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x161816, 10, 20);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    const look = new THREE.Vector3(0.6, 0.55, 0);

    // ---- tubo
    const mapT = brushed();
    const steel = new THREE.MeshStandardMaterial({ map: mapT, metalness: 0.95, roughness: 0.3, color: 0xe4e8eb, envMapIntensity: 1.15 });
    const tube = new THREE.Group(); scene.add(tube);
    const L = X1 - X0;
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 96, 1, true), steel);
    outer.rotation.z = Math.PI / 2; outer.position.x = (X0 + X1) / 2; tube.add(outer);
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
    const metal = new THREE.MeshStandardMaterial({ color: 0x9aa1a7, metalness: 1, roughness: 0.28 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x24282b, metalness: .6, roughness: .55 });
    const ceramic = new THREE.MeshStandardMaterial({ color: 0xe0a2a0, metalness: 0, roughness: .5 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xc8a24a, metalness: 1, roughness: .3 });
    const torch = new THREE.Group(); scene.add(torch);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 0.7), metal); head.position.set(0, R + 1.55, 0); torch.add(head);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.5), dark); bar.position.set(0.6, R + 2.9, 0); torch.add(bar);
    const mkElectrode = (x: number, scale = 1) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.55, 20), metal); body.position.y = 0.55; g.add(body);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * scale, 0.13 * scale, 0.1, 20), brass); col.position.y = 0.28; g.add(col);
      const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.07 * scale, 0.32, 20), ceramic); noz.position.y = 0.12; g.add(noz);
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaccff, emissiveIntensity: 1.2 })); tip.position.y = -0.1; g.add(tip);
      g.position.set(x, R + 0.35 + 0.17, 0); return g;
    };
    const sets: Record<Mode, THREE.Group> = { laser: new THREE.Group(), tri: new THREE.Group(), keyhole: new THREE.Group() };
    [-0.42, 0, 0.42].forEach((x) => sets.tri.add(mkElectrode(x)));
    sets.keyhole.add(mkElectrode(-0.62, 0.9));
    const plasma = new THREE.Group();
    const pb = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.7, 24), metal); pb.position.y = 0.6; plasma.add(pb);
    const pn = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.06, 0.4, 24), brass); pn.position.y = 0.14; plasma.add(pn);
    plasma.position.set(0.15, R + 0.62, 0); sets.keyhole.add(plasma);
    const optic = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.05, 0.9, 24), dark); optic.position.set(0, R + 0.95, 0); sets.laser.add(optic);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff5a3a, emissiveIntensity: 1.4 })); lens.position.set(0, R + 0.5, 0); sets.laser.add(lens);
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
    [-0.42, 0, 0.42].forEach((x) => { const a = mkArc(x, 0.2, 0.13, 0x8fb8ff); sets.tri.add(a); arcs.push(a); });
    const ka = mkArc(-0.62, 0.2, 0.13, 0x8fb8ff); sets.keyhole.add(ka); arcs.push(ka);
    const plasmaJet = mkArc(0.15, 0.62, 0.2, 0xc9a8ff); sets.keyhole.add(plasmaJet); arcs.push(plasmaJet);
    const beam = mkArc(0, 0.5, 0.03, 0xff7a4a); sets.laser.add(beam); arcs.push(beam);

    // ---- bagno + luce + scintille
    const poolMat = new THREE.MeshBasicMaterial({ map: glowTex("rgba(255,255,255,1)", "rgba(255,140,40,.7)"), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.set(-0.15, R + 0.03, 0); scene.add(pool);
    const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex("rgba(190,215,255,1)", "rgba(110,160,255,.35)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    flare.position.set(0, R + 0.12, 0); flare.scale.set(1.3, 1.3, 1); scene.add(flare);
    const light = new THREE.PointLight(0x9cc0ff, 14, 7, 1.6); light.position.set(0, R + 0.55, 0.3); scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const rim = new THREE.DirectionalLight(0x9fe070, 1.1); rim.position.set(-4, 3, -5); scene.add(rim);

    const N = 90; const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), life = new Float32Array(N);
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const sparks = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffa040, size: 0.05, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    scene.add(sparks);
    const emit = (i: number) => { pos.set([(Math.random() - .5) * .3, R + .05, (Math.random() - .5) * .1], i * 3); vel.set([(Math.random() - .5) * 1.8 - .4, 1 + Math.random() * 1.6, (Math.random() - .5) * 1.8], i * 3); life[i] = Math.random() * 0.9 + 0.2; };
    for (let i = 0; i < N; i++) { emit(i); life[i] = Math.random(); }

    // ---- loop
    let w = 1, h = 1, raf = 0, last = performance.now(), visible = true, mode: Mode = modeOf(vRef.current), tx = 0, ty = 0, cx = 0, cy = 0, shown = false;
    const size = () => { const r = el.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    size(); const ro = new ResizeObserver(() => { size(); wake.current(); }); ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake.current(); }); io.observe(el);
    const onMove = (e: PointerEvent) => { const r = el.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5); ty = ((e.clientY - r.top) / r.height - .5); wake.current(); };
    el.addEventListener("pointermove", onMove);
    const tmp = new THREE.Vector3();

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
      const vv = vRef.current; const m = modeOf(vv);
      if (m !== mode) { mode = m; }
      (Object.keys(sets) as Mode[]).forEach((k) => (sets[k].visible = k === mode));
      setWall(wallOf(vv));
      cx += (tx - cx) * Math.min(1, dt * 3); cy += (ty - cy) * Math.min(1, dt * 3);
      const ang = t * 0.15 * (reduced ? 0 : 1);
      camera.position.set(-6.6 + cx * 2.2 + Math.sin(ang) * 0.5, 3.5 - cy * 1.6, 6.4 + Math.cos(ang) * 0.3);
      camera.lookAt(look);
      const speed = mode === "laser" ? 0.5 : mode === "tri" ? 0.36 : 0.18;
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
        wallLab.current.style.transform = `translate(${(tmp.x * .5 + .5) * w}px, ${(-tmp.y * .5 + .5) * h}px)`;
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    wake.current = () => { if (!raf && visible) raf = requestAnimationFrame((n) => { last = n; frame(n); }); };
    wake.current();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); el.removeEventListener("pointermove", onMove);
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose()); });
      pm.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, [onReady]);

  const m = modeOf(v);
  const f = (n: number) => n.toFixed(1).replace(".", labels.wall.includes("wall") ? "." : ",");
  return (
    <div ref={host} className="scene" aria-hidden="true">
      <div ref={wallLab} className="scene-wall mono"><span>{labels.wall} {f(v)} mm</span></div>
      <div ref={lab} className="scene-mode mono">{m === "laser" ? labels.laser : m === "tri" ? labels.tri : labels.keyhole}</div>
    </div>
  );
}
