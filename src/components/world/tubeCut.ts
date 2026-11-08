import * as THREE from "three";

export type TubeMats = { out: THREE.Material; in: THREE.Material; face: THREE.Material };
/** Spicchio tolto: tratto [w0, w1] lungo x, angoli [a0, a1] attorno all'asse (0 = verso +z, π/2 = in alto). */
export type TubeWindow = { w0: number; w1: number; a0: number; a1: number };

/** Tubo lungo x (asse in y = z = 0) da x0 a x1, con una finestra opzionale che mostra l'interno.
 *  Le coordinate v delle texture restano continue tra i tratti, così la spazzolatura non salta. */
export function tubeCut(R: number, Ri: number, x0: number, x1: number, m: TubeMats, win?: TubeWindow) {
  const g = new THREE.Group(), L = x1 - x0;
  const piece = (a: number, b: number, ts = 0, tl = Math.PI * 2) => {
    for (const [r, mat] of [[R, m.out], [Ri, m.in]] as const) {
      const geo = new THREE.CylinderGeometry(r, r, b - a, 96, 1, true, ts, tl);
      const uv = geo.attributes.uv; // v = 1 in x = a, v = 0 in x = b → v continua sull'intero tubo
      for (let i = 0; i < uv.count; i++) uv.setY(i, (x1 - (a + (1 - uv.getY(i)) * (b - a))) / L);
      const c = new THREE.Mesh(geo, mat); c.rotation.z = Math.PI / 2; c.position.x = (a + b) / 2; c.receiveShadow = true; g.add(c);
    }
  };
  if (!win) { piece(x0, x1); return g; }
  const { w0, w1, a0, a1 } = win;
  piece(x0, w0); piece(w1, x1); piece(w0, w1, a1, Math.PI * 2 - (a1 - a0));
  for (const a of [a0, a1]) { // facce radiali del taglio, lungo la finestra
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w1 - w0, R - Ri), m.face);
    f.rotation.x = Math.PI / 2 - a; f.position.set((w0 + w1) / 2, Math.sin(a) * (R + Ri) / 2, Math.cos(a) * (R + Ri) / 2); g.add(f);
  }
  for (const x of [w0, w1]) { // spessore della parete visto alle due estremità della finestra
    const f = new THREE.Mesh(new THREE.RingGeometry(Ri, R, 32, 1, a0, a1 - a0), m.face);
    f.rotation.y = -Math.PI / 2; f.position.x = x; g.add(f);
  }
  return g;
}
