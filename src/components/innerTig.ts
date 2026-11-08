import * as THREE from "three";
import { torchKit, type P3 } from "./torchKit";

// Torcia TIG interna LEDICA come nella foto del tubo aperto: tutta argentata, ceramica rosa verso l'alto,
// tastatore cromato che scorre sulla parete, raccordi e tubi blu dell'acqua, barra di sostegno lungo il tubo.
// Quote in px alla scala di tigTorch (1 px ≈ 0,62 mm). Punta del tungsteno in (0, 0), rivolta verso +y.
// La barra va verso -x per barPx, il tastatore sta verso +x.
export function innerTig(S = 0.005, barPx = 600) {
  const k = torchKit(S, 0, 0, 0);
  const { box, rod, lathe, screw, pipe, put, V, M } = k;
  const { alu, aluHi, aluFly, nickel, blueHose } = k.mat;
  const ceramic = M({ color: 0xe6a3c4, metalness: 0, roughness: .75 });
  const white = M({ color: 0xeeeeea, metalness: 0, roughness: .55 });
  const tungsten = M({ color: 0x8d9298, metalness: 1, roughness: .35 });
  const up: P3 = [0, -1, 0], down: P3 = [0, 1, 0], front: P3 = [0, 0, 1];

  rod([0, 9, 0], up, 9, 2.5, 1, tungsten, 12);
  lathe([[0, 0], [14, 0], [16, 3], [20, 25], [24, 45], [24, 70], [0, 70]], [0, 9, 0], down, ceramic);
  rod([0, 91, 0], up, 12, 22, 22, white, 40); // isolante sotto la ceramica
  box(-36, 91, 36, 170, -34, 34, aluHi, 4); // blocco porta-torcia
  box(34, 30, 44, 170, -40, 40, alu, 2); // squadretta verticale
  box(34, 30, 200, 46, -42, 42, aluFly, 4); // piastra del tastatore
  for (const z of [-26, 26]) screw([200, 38, z], [1, 0, 0], 4); // viti in testa alla piastra

  // tastatore: mozzo cromato e lama inclinata che appoggia sulla parete appena davanti alla punta
  rod([120, 30, 0], up, 18, 17, 17, nickel, 40); screw([120, 12, 0], up, 6);
  const a = V([120, 14, 0]), b = V([62, -10, 0]);
  put(new THREE.BoxGeometry(12 * S, a.distanceTo(b), 30 * S), nickel, a.clone().add(b).multiplyScalar(.5), b.clone().sub(a));
  rod([62, -10, -15], front, 30, 6, 6, nickel, 24);

  // raccordi argentati sotto la piastra e tubi blu che tornano lungo la barra
  for (const z of [-22, 22]) {
    rod([175, 46, z], down, 16, 10, 10, nickel, 6); rod([175, 62, z], down, 10, 7, 7, nickel, 24);
    pipe([[175, 70, z], [180, 130, z * 1.3], [140, 215, z * 1.5], [40, 232, z * 1.5], [-barPx, 232, z * 1.5]], 7, blueHose);
  }
  box(-barPx, 170, 60, 205, -38, 38, alu, 3); // barra di sostegno
  return k.build();
}
