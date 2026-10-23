import * as THREE from "three";
import { torchKit, type P3 } from "./torchKit";

// Unità torcia TIG LEDICA come compare nella foto del gruppo plasma-plasma-TIG (960×1280 px):
// attacco esagonale, blocco nichelato, morsetti neri, corpo in rame, isolante bianco, ceramica rosa. Punta del tungsteno in (0, tipY).
export function tigTorch(tipY: number, S = 0.005) {
  const k = torchKit(S, 765, 994, tipY);
  const { box, rod, lathe, screw, pipe, M } = k;
  const { aluHi, paint, black, nickel, copper } = k.mat;
  const ceramic = M({ color: 0xe6a3c4, metalness: 0, roughness: .75 });
  const tungsten = M({ color: 0x8d9298, metalness: 1, roughness: .35 });
  const redH = M({ color: 0xd8261f, metalness: 0, roughness: .38 });
  const up: P3 = [0, -1, 0], front: P3 = [0, 0, 1];
  rod([765, 742, 0], up, 48, 15, 15, nickel, 6);
  box(738, 740, 800, 790, -30, 30, aluHi, 3);
  box(728, 786, 818, 816, -38, 38, black, 3); screw([735, 801, 38], front, 5);
  rod([765, 880, 0], up, 94, 22, 22, copper, 40);
  box(728, 868, 818, 905, -38, 38, black, 3); screw([745, 886, 38], front, 6);
  rod([765, 915, 0], up, 12, 22, 22, paint, 40);
  lathe([[0, 0], [14, 0], [16, 3], [20, 25], [24, 45], [24, 70], [0, 70]], [765, 985, 0], up, ceramic);
  rod([765, 994, 0], up, 9, 1, 2.5, tungsten, 12);
  box(805, 745, 812, 810, -30, 30, black, 1);
  box(712, 560, 738, 795, -46, -26, black, 2); box(712, 770, 740, 800, -46, -20, black, 2); // staffa verso la barra
  pipe([[765, 694, 0], [768, 640, -10], [775, 520, -30]], 9, redH as THREE.Material);
  return k.build();
}
