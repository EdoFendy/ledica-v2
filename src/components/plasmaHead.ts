import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { torchKit, type P3 } from "./torchKit";

// Gruppo tricatodo plasma-plasma-TIG con filo freddo e sensore laser segui-giunto, 3,00–12,70 mm.
// Ricostruito dalla foto di riferimento (960×1280 px); quote in px della foto, vedi torchKit. Punte su z = 0, in linea sul giunto.
export function plasmaHead(tipY: number, S = 0.0026) {
  const k = torchKit(S, 530, 992, tipY);
  const { X, Y, V, put, box, rod, lathe, screw, onCyl, pipe, M } = k;
  const { aluHi, alu, paint, black, knurlK, hole, nickel, brass, copper, plate, knurlTex } = k.mat;
  const amber = M({ color: 0xd8b66f, metalness: 0, roughness: .46, clearcoat: .3, clearcoatRoughness: .3 });
  const amberDk = M({ color: 0x9c7a3e, metalness: 0, roughness: .6 });
  const darkChrome = M({ color: 0x2a2d31, metalness: 1, roughness: .1, clearcoat: .6 }); // canna cromata scura a specchio
  const greyPl = M({ color: 0x6b7075, metalness: .1, roughness: .48 });
  const ceramic = M({ color: 0xe6a3c4, metalness: 0, roughness: .75 });
  const tungsten = M({ color: 0x8d9298, metalness: 1, roughness: .35 });
  const blueH = M({ color: 0x2747b8, metalness: 0, roughness: .4 });
  const redH = M({ color: 0xd8261f, metalness: 0, roughness: .38 });
  const brownH = M({ color: 0xa8662e, metalness: 0, roughness: .45 });
  const yellowH = M({ color: 0xf2b416, metalness: 0, roughness: .4 });
  const braid = knurlTex.clone(); braid.repeat.set(140, 4); braid.needsUpdate = true;
  const braidSilver = M({ color: 0xdfe3e6, metalness: .2, roughness: .45, bumpMap: braid, bumpScale: 1.5 });
  const ribs = knurlTex.clone(); ribs.repeat.set(90, 1); ribs.needsUpdate = true; // guaina corrugata
  const sleeve = M({ color: 0x1a1b1c, metalness: 0, roughness: .62, bumpMap: ribs, bumpScale: 2.5 });
  const up: P3 = [0, -1, 0], front: P3 = [0, 0, 1], right: P3 = [1, 0, 0];

  // ---- barra porta-torce nera con piastra posteriore, tappi in alluminio grezzo e tre slitte di regolazione
  box(175, 405, 860, 500, -130, -70, black, 3);
  box(175, 449, 860, 454, -71, -69, hole, 1);
  box(255, 385, 620, 520, -170, -130, black, 3);
  box(20, 395, 75, 495, -135, -65, alu, 2); box(800, 400, 862, 495, -135, -65, alu, 2);
  for (const [x1, x2, y1, kx, cx] of [[48, 140, 350, 75, 92], [492, 600, 372, 515, 575], [758, 850, 355, 803, 790]]) {
    box(x1, y1, x2, 495, -70, -25, black, 4);
    rod([kx, y1, -48], up, 22, 13, 13, knurlK, 32); rod([kx, y1 - 22, -48], up, 4, 11, 13, black, 32);
    rod([cx, 425, -25], front, 12, 24, 24, black, 40);
    for (const [sx, sy] of [[x1 + 12, y1 + 14], [x2 - 12, y1 + 14], [x1 + 12, 482], [x2 - 12, 482]]) screw([sx, sy, -25], front, 4, nickel);
  }
  // staffe verticali
  box(140, 400, 180, 690, -70, -40, black, 3); box(528, 400, 562, 690, -70, -40, black, 3); box(715, 400, 752, 770, -70, -40, black, 3);

  // ---- due torce plasma: blocco in ottone, collo filettato, corpo ambrato con ghiera, canna cromata scura, ugello a cupola
  const torch = (cx: number) => {
    box(cx - 35, 652, cx + 35, 700, -30, 30, brass, 3);
    rod([cx - 15, 652, 0], up, 40, 9, 9, brass, 6); rod([cx - 15, 612, 0], up, 6, 6, 6, brass, 24);
    rod([cx + 15, 652, 0], up, 38, 9, 9, nickel, 6); rod([cx + 15, 614, 0], up, 6, 6, 6, nickel, 24);
    lathe([...Array.from({ length: 6 }, (_, i): [number, number] => [i % 2 ? 28 : 30, i * 2]), [0, 10]], [cx, 710, 0], up, brass);
    rod([cx, 738, 0], up, 32, 41, 41, amber, 48);
    for (let i = 0; i < 12; i++) onCyl(cx, 722, 41, i * Math.PI / 6, 7, 26, 4, amberDk);
    rod([cx, 805, 0], up, 67, 38, 39, amber, 48);
    screw([cx + 6, 796, 38], front, 3.5, nickel);
    rod([cx, 940, 0], up, 136, 33, 33, darkChrome, 48);
    rod([cx, 826, 0], up, 2, 33.6, 33.6, hole, 48);
    rod([cx, 963, 0], up, 24, 35, 35, nickel, 48);
    for (let i = 0; i < 10; i++) onCyl(cx, 951, 35, i * Math.PI / 5, 5, 16, 4, hole);
    lathe([[0, 0], [8, 0], [14, 3], [30, 12], [35, 22], [0, 22]], [cx, 985, 0], up, nickel);
    lathe([[0, 0], [3, 0], [7, 6], [7, 10], [0, 10]], [cx, 992, 0], up, copper);
  };
  torch(305); torch(400);

  // ---- cilindri grigi (gas di plasma/raffreddamento) con collare, morsetto e collettore cromato verso la torcia
  const grey = (cx: number, to: number, lower: boolean) => {
    rod([cx, 662, 0], up, 14, 33, 33, greyPl, 40);
    rod([cx, 790, 0], up, 128, 28, 28, greyPl, 40);
    rod([cx, 802, 0], up, 12, 36, 36, greyPl, 40);
    box(cx - 40, 655, cx + 40, 692, -38, 38, black, 3); box(cx - 1, 655, cx + 1, 692, 37, 39.5, hole, 1);
    box(cx - 20, 660, cx + 20, 690, -60, -38, black, 2); // attacco alla staffa
    if (lower) box(cx - 40, 752, cx + 40, 790, -38, 38, black, 3);
    const dir = Math.sign(to - cx);
    for (const z of [-12, -4, 4, 12]) pipe([[cx + dir * 12, 802, z], [cx + dir * 14, 813, z], [cx + dir * 40, 816, z], [to - dir * 30, 816, z]], 4, nickel);
    [[-15, redH], [0, blueH], [15, redH]].forEach(([dx, m]) => { rod([cx + (dx as number), 648, 0], up, 30, 6, 6, nickel, 6); rod([cx + (dx as number), 630, 0], up, 6, 7, 7, m as THREE.Material, 24); });
  };
  grey(205, 305, false); grey(495, 400, true);

  // ---- guida filo freddo: staffa nera con pomelli, raddrizzatore a molla, tubo guida in ottone piegato con punta in rame
  box(540, 740, 640, 800, -30, 30, black, 4);
  box(560, 690, 605, 740, -50, -20, black, 3); // braccetto verso la staffa
  rod([565, 740, 0], up, 26, 12, 12, knurlK, 32);
  rod([592, 772, 30], front, 12, 18, 18, black, 40);
  rod([640, 800, 0], right, 28, 12, 12, knurlK, 32);
  box(560, 800, 600, 872, -20, 20, black, 3);
  const lever = new RoundedBoxGeometry(80 * S, 22 * S, 30 * S, 2, 4 * S); lever.rotateZ(.45); put(lever, black, V([615, 835, 0]));
  for (const [x, y] of [[575, 815], [622, 842], [570, 852]]) rod([x, y, 20], front, 4, 8, 8, brass, 24);
  pipe(Array.from({ length: 40 }, (_, i): P3 => [592 + i * .9, 832 + Math.sin(i * .9) * 7, 25 + Math.cos(i * .9) * 7]), 1.6, brass); // molla
  rod([690, 692, 0], up, 10, 7, 7, nickel, 24);
  rod([690, 742, 0], up, 50, 9, 9, brass, 6);
  pipe([[690, 742, 0], [690, 800, 0], [688, 850, 0], [670, 885, 0], [620, 905, 0], [520, 935, 0], [445, 970, 0]], 6, brass);
  rod([445, 970, 0], [-1, .45, 0], 12, 5, 3, copper, 16);

  // ---- torcia TIG: attacco esagonale, blocco nichelato, morsetti neri, corpo in rame, isolante bianco, ceramica rosa
  rod([765, 742, 0], up, 48, 15, 15, nickel, 6);
  box(738, 740, 800, 790, -30, 30, aluHi, 3);
  box(720, 745, 760, 790, -45, -25, black, 2);
  box(728, 786, 818, 816, -38, 38, black, 3); screw([735, 801, 38], front, 5);
  rod([765, 880, 0], up, 94, 22, 22, copper, 40);
  box(728, 868, 818, 905, -38, 38, black, 3); screw([745, 886, 38], front, 6);
  rod([765, 915, 0], up, 12, 22, 22, paint, 40);
  lathe([[0, 0], [14, 0], [16, 3], [20, 25], [24, 45], [24, 70], [0, 70]], [765, 985, 0], up, ceramic);
  rod([765, 994, 0], up, 9, 1, 2.5, tungsten, 12);
  box(805, 745, 812, 810, -30, 30, black, 1);

  // ---- sensore laser segui-giunto: corpo cilindrico su piastra, deflettore inclinato
  box(812, 880, 830, 930, -30, 30, black, 2);
  box(800, 925, 915, 945, -40, 40, aluHi, 2);
  rod([848, 925, 0], up, 45, 32, 30, black, 48);
  rod([848, 880, 0], up, 6, 14, 14, nickel, 32);
  const shield = new RoundedBoxGeometry(70 * S, 5 * S, 60 * S, 2, 2 * S); shield.rotateZ(-.5); put(shield, aluHi, V([825, 962, 0]));
  rod([905, 925, 0], up, 25, 8, 8, brass, 6); rod([920, 925, 0], up, 25, 8, 8, brass, 6);

  // ---- carrello: piastra posteriore e cappello superiore da cui escono le guaine
  box(150, -30, 850, 385, -200, -170, plate, 3);
  box(0, -50, 980, -20, -200, 90, plate, 4);

  // ---- guaine corrugate e tubi colorati
  const sleeves: [P3[], number][] = [
    [[[235, -20, -60], [232, 200, -60], [230, 390, -60]], 30],
    [[[330, -20, -50], [330, 200, -50], [330, 390, -50]], 30],
    [[[440, -20, -40], [440, 200, -40], [440, 365, -40]], 30],
    [[[620, -20, -40], [680, 300, -35], [740, 520, -35], [760, 640, -40]], 36],
    [[[940, -20, -40], [920, 300, -30], [890, 600, -20], [880, 690, -10]], 36],
  ];
  for (const [pts, r] of sleeves) { pipe(pts, r, sleeve); const e = pts[pts.length - 1]; rod([e[0], e[1] - 10, e[2]], up, 14, r + 2, r + 2, nickel, 32); }
  const lines: [P3[], number, THREE.Material][] = [
    [[[220, 390, -60], [200, 500, -30], [190, 600, -10], [190, 625, 0]], 8, redH],
    [[[235, 390, -60], [215, 500, -20], [205, 600, -5], [205, 625, 0]], 8, blueH],
    [[[245, 390, -55], [228, 500, -25], [220, 625, 0]], 8, brownH],
    [[[320, 390, -50], [300, 500, -10], [290, 606, 0]], 9, braidSilver],
    [[[340, 390, -50], [325, 500, -10], [320, 608, 0]], 8, blueH],
    [[[430, 365, -40], [400, 500, -10], [385, 606, 0]], 9, braidSilver],
    [[[450, 365, -40], [430, 500, -10], [415, 608, 0]], 8, blueH],
    [[[460, 365, -40], [472, 500, -20], [480, 625, 0]], 8, redH],
    [[[470, 365, -40], [492, 500, -20], [495, 625, 0]], 8, blueH],
    [[[760, 640, -40], [763, 670, -15], [765, 694, 0]], 9, redH],
    [[[820, -20, 40], [800, 200, 60], [740, 450, 50], [700, 620, 20], [690, 682, 0]], 7, yellowH],
    [[[875, 690, -10], [890, 800, 0], [905, 900, 0]], 8, blueH],
    [[[890, 690, -10], [905, 800, 0], [920, 900, 0]], 8, blueH],
    [[[865, 690, -10], [870, 800, 10], [880, 880, 20]], 5, brownH],
  ];
  for (const [pts, r, m] of lines) pipe(pts, r, m);

  return { g: k.build(), plasma: [[X(305), Y(992)], [X(400), Y(992)]] as const, tig: [X(765), Y(994)] as const };
}
