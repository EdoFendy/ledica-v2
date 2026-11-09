import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { torchKit, type P3 } from "./torchKit";

// Unità TIG interna LEDICA ricostruita dalla foto del cliente (1600×1200 px, torcia dritta, ceramica in basso):
// barra di sostegno con tubi, squadretta, alimentatore del filo con ugello inclinato, ceramica rosa n. 10 con tungsteno,
// squadra e piastra del tastatore con disco della molla, mozzo e lama cromata, raccordi e tubi blu dell'acqua.
// Il cliente la vuole tutta argentata. Si costruisce nelle quote della foto e poi si capovolge: ceramica verso +y.
// S = scala di tigTorch (1 px ≈ 0,62 mm); nella foto 1 px ≈ 0,31 mm, quindi il kit lavora a S/2. Punta in (0, 0).
// La barra va verso -x per barPx (px di tigTorch); tastatore e raccordi stanno verso +x.
export function innerTig(S = 0.005, barPx = 600) {
  const s = S / 2, k = torchKit(s, 898, 830, 0);
  const { box, rod, rodW, lathe, screw, pipe, put, fitting, V, X, Y, M } = k;
  const { alu, aluHi, aluFly, spun, knurl, nickel, steel, hole, blueHose } = k.mat;
  const ceramic = M({ color: 0xe2a0c0, metalness: 0, roughness: .8 });
  const white = M({ color: 0xefefea, metalness: 0, roughness: .5 });
  const tungsten = M({ color: 0x8d9298, metalness: 1, roughness: .35 });
  const yellow = M({ color: 0xf2b21b, metalness: 0, roughness: .3, clearcoat: .6 });
  const orange = M({ color: 0xff6a1a, metalness: 0, roughness: .35 });
  const red = M({ color: 0xd8261f, metalness: 0, roughness: .4 });
  const up: P3 = [0, -1, 0], down: P3 = [0, 1, 0], front: P3 = [0, 0, 1], right: P3 = [1, 0, 0];
  const x0 = 898 - barPx * 2; // estremo della barra, verso l'ingresso del tubo
  // blocco orientato da a verso b: spessore w nel piano della foto, profondità d
  const seg = (a: P3, b: P3, w: number, d: number, m: THREE.Material, r = 3) => {
    const A = V(a), B = V(b);
    put(new RoundedBoxGeometry(w * s, A.distanceTo(B), d * s, 3, r * s), m, A.clone().add(B).multiplyScalar(.5), B.clone().sub(A));
  };

  // barra di sostegno e attacchi
  box(x0, 320, 850, 378, -30, 30, alu, 6);
  box(760, 378, 820, 468, -24, 24, alu, 3); // montante barra → porta-torcia
  box(555, 378, 720, 690, 30, 42, aluFly, 3); // squadretta con asola
  box(628, 470, 656, 560, 41, 44, hole, 2); screw([642, 630, 42], front, 9); screw([642, 410, 42], front, 7);
  box(720, 468, 1100, 522, -30, 30, aluHi, 4); // porta-torcia
  box(1045, 468, 1100, 602, -34, 34, aluHi, 3); // squadra verso la piastra del tastatore

  // ceramica n. 10, isolante bianco, tungsteno
  rod([898, 522, 0], down, 12, 40, 40, white, 48);
  lathe([[0, 0], [40, 0], [42, 8], [42, 190], [40, 236], [35, 260], [28, 268], [0, 268]], [898, 534, 0], down, ceramic);
  rod([898, 801, 0], down, 1.5, 23, 23, hole, 32); // bocca della ceramica
  rod([898, 798, 0], down, 32, 4, 1.2, tungsten, 12);

  // alimentatore del filo: blocco inclinato, ugello puntato sull'arco, raccordo zigrinato e guaina gialla
  seg([515, 610, 0], [775, 700, 0], 70, 56, aluHi, 5); screw([650, 655, 28], front, 7);
  rodW(V([768, 700, 0]), V([850, 798, 0]), 18, 9, nickel, 32);
  seg([440, 585, 0], [520, 605, 0], 34, 34, knurl, 4);
  pipe([[445, 586, 0], [350, 578, 4], [200, 570, 10], [x0, 565, 10]], 11, yellow);
  pipe([[x0, 455, -10], [600, 455, -12], [740, 470, -12]], 6, steel); // gas

  // tastatore: piastra con viti in testa, disco della molla, mozzo e lama cromata che appoggia sulla parete
  box(1095, 545, 1580, 602, -55, 55, aluFly, 5);
  for (const z of [-30, 30]) screw([1580, 573, z], right, 7);
  rod([1220, 545, -10], up, 55, 62, 62, spun, 48); screw([1220, 490, -10], up, 8);
  rod([1290, 602, 0], down, 58, 30, 30, nickel, 40);
  // lama: piatto largo a coltello, faccia nel piano del tubo, punta smussata che tocca la parete
  const blade = new THREE.Shape([[1258, 662], [1072, 795], [1040, 862], [1128, 846], [1322, 716]].map(([x, y]) => new THREE.Vector2(X(x), Y(y))));
  put(new THREE.ExtrudeGeometry(blade, { depth: 16 * s, bevelEnabled: true, bevelSize: 2 * s, bevelThickness: 2 * s, bevelSegments: 2 }).translate(0, 0, -8 * s), nickel);
  rod([1290, 690, -10], front, 20, 40, 40, nickel, 48); screw([1290, 690, 10], front, 12, steel); // testa tonda e perno
  // raccordi argentati in testa alla piastra, tubi blu che tornano lungo la barra (fascetta, nastro rosso)
  ([[-28, -40], [28, 56]] as const).forEach(([zf, zh]) => {
    const f = fitting([1530, 545, zf], up);
    pipe([f, [1525, 470, (zf + zh) / 2], [1440, 405, zh], [1300, 400, zh], [x0, 400, zh]], 10, blueHose);
    rod([1290, 400, zh], right, 14, 13, 13, nickel, 24);
  });
  rod([940, 400, 56], right, 55, 12.5, 12.5, red, 24);
  pipe([[x0, 384, 48], [1200, 386, 48], [1420, 440, 44], [1480, 545, 40]], 3, orange); // cavetto del sensore

  const g = new THREE.Group(), m = k.build();
  m.rotation.x = Math.PI; g.add(m); // capovolta: ceramica verso l'alto
  return g;
}
