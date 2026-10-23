import * as THREE from "three";
import { torchKit, type P3 } from "./torchKit";

// Testa laser LEDICA ricostruita dalla foto di riferimento (1600×1200 px). Quote in px della foto, vedi torchKit.
export function laserHead(tipY: number) {
  const k = torchKit(0.0021, 715, 1045, tipY);
  const { S, V, adv, put, box, rodW, rod, lathe, screw, fitting, decal, label, matrix } = k;
  const { alu, aluHi, aluFly, paint, knurl: knurlM, knurlK, black, gloss, blue, red, copper, steel, oxide, hole, plate, rubber, nickel, brass, clear, redHose, blueHose } = k.mat;
  const ends: P3[] = [];
  const pipe = (pts: P3[], r: number, m: THREE.Material) => { k.pipe(pts, r, m); const t = pts[pts.length - 1]; if (t[1] < -250) ends.push(t); };

  // ---- ugello: punta in rame, cono, canna con due ghiere zigrinate (along = 1046 - py)
  const tip: P3 = [715, 1046, 0], up: P3 = [0, -1, 0];
  lathe([[0, 0], [7.5, 0], [8.6, 1.5], [15, 60], [17, 62], [17, 66], [0, 66]], tip, up, copper);
  lathe([[0, 63], [18, 63], [19.5, 65], [32.5, 141], [33, 143], [33, 276], [34, 276], [34, 300], [40, 301], [40, 315], [0, 315]], tip, up, alu);
  rod([715, 903, 0], up, 12, 36.5, 36.5, knurlM, 64);
  rod([715, 782, 0], up, 12, 36, 36, knurlM, 64);
  rod([715, 1046.4, 0], [0, 1, 0], .5, 3, 3, hole, 16);

  // ---- portaugello, cassetto vetro di protezione blu, blocco raffreddato IN/OUT
  box(688, 656, 800, 733, -56, 56, aluHi, 4);
  box(700, 620, 815, 658, -46, 64, blue, 3);
  for (const [x, y] of [[726, 632], [804, 646]]) { rod([x, y, 64], [0, 0, 1], 6, 10, 10, nickel, 32); put(new THREE.SphereGeometry(10 * S, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), nickel, V([x, y, 70]), new THREE.Vector3(0, 0, 1)); }
  screw([762, 644, 64], [0, 0, 1], 4.5);
  box(705, 548, 812, 620, -50, 54, aluFly, 2);
  screw([729, 580, 54], [0, 0, 1]); screw([793, 592, 54], [0, 0, 1]);
  decal(722, 606, 54.6, 24, 12, label("IN")); decal(797, 608, 54.6, 30, 12, label("OUT"));
  const fIn = fitting([705, 585, 20], [-1, -1, .4]), fOut = fitting([812, 600, 20], [1, -.8, .4]);

  // ---- piastre della slitta trasversale e guida lineare con pattini (tenute rosse)
  box(798, 700, 1197, 752, -72, 40, alu, 3);
  box(806, 668, 1086, 702, -62, 30, aluHi, 3);
  box(907, 642, 1086, 670, -52, 24, alu, 3);
  box(889, 752, 1186, 778, -52, 20, black, 2);
  screw([935, 778, -15], [0, 1, 0], 6); screw([1010, 778, -15], [0, 1, 0], 6); screw([1120, 778, -15], [0, 1, 0], 6);
  box(505, 672, 690, 708, -72, 40, alu, 3);
  screw([528, 672, 12], up); screw([528, 672, -48], up); screw([660, 672, -48], up);
  box(900, 628, 1100, 642, -46, -22, steel, 1);
  for (const [x1, x2, y1, y2] of [[918, 978, 604, 642], [1028, 1086, 628, 664]]) {
    box(x1, y1, x2, y2, -60, -8, steel, 2);
    box(x1 - 6, y1 + 2, x1, y2 - 2, -58, -10, red, 1); box(x2, y1 + 2, x2 + 6, y2 - 2, -58, -10, red, 1);
    screw([(x1 + x2) / 2, y1 + 12, -8], [0, 0, 1], 4);
  }

  // ---- piastra di montaggio, fianco sinistro con disco di brandeggio ad asole
  box(555, 395, 1005, 700, -96, -76, alu, 3);
  box(555, 408, 579, 692, -76, 72, aluHi, 3);
  rod([555, 560, -2], [-1, 0, 0], 16, 104, 104, alu, 72);
  rod([539, 560, -2], [-1, 0, 0], 1.5, 98, 98, aluHi, 72);
  for (const a of [.4, Math.PI + .4]) { const t = new THREE.TorusGeometry(80 * S, 5.5 * S, 8, 32, 1.1); t.rotateZ(a); t.rotateY(Math.PI / 2); put(t, hole, V([537, 560, -2])); }
  rod([537, 560, -2], [-1, 0, 0], 8, 18, 18, oxide, 6);
  for (const a of [.9, 2.5, 4.0, 5.6]) screw([537, 560 - 58 * Math.sin(a), -2 + 58 * Math.cos(a)], [-1, 0, 0], 6);
  const fSide = fitting([567, 490, 72], [0, 0, 1]);

  // ---- motore/collimatore orizzontale (testa verso -x) con due gole
  lathe([[0, 0], [72, 0], [74, 3], [74, 36], [71.5, 37], [71.5, 42], [74, 43], [74, 60], [71.5, 61], [71.5, 66], [74, 67], [74, 226], [72, 230.5], [67, 233], [0, 233]], [858, 460, 4], [-1, 0, 0], alu);

  // ---- scatola elettronica verniciata con coperchio, viti e datamatrix
  box(858, 415, 986, 548, -60, 62, paint, 6);
  box(868, 425, 978, 540, 62, 67, paint, 5);
  for (const [x, y] of [[880, 438], [965, 440], [880, 526], [966, 520]]) screw([x, y, 67], [0, 0, 1], 5, nickel);
  decal(884, 465, 67.4, 44, 18, matrix());
  box(842, 548, 990, 574, -55, 50, black, 2);
  const fBox = fitting([900, 574, 40], [0, 1, 0]);

  // ---- modulo centrale: piastra fresata con due raccordi zigrinati, porte connettori
  box(758, 286, 976, 416, -56, 56, alu, 4);
  box(895, 288, 970, 362, 56, 61, aluFly, 2);
  const fMid = ([[908, 322], [944, 336]] as const).map(([x, y]): P3 => { rod([x, y, 61], [0, 0, 1], 8, 9, 9, nickel, 6); rod([x, y, 69], [0, 0, 1], 14, 11, 11, knurlM); return [x, y, 83]; });
  box(778, 314, 792, 338, 54, 57.5, hole, 1); box(804, 314, 818, 338, 54, 57.5, hole, 1);
  for (const [x, y] of [[770, 300], [770, 404], [880, 404]]) screw([x, y, 56], [0, 0, 1]);

  // ---- blocco messa a fuoco con due viti zigrinate verticali
  box(768, 194, 872, 288, -46, 46, aluHi, 3);
  box(792, 272, 850, 290, 44, 60, aluHi, 2);
  for (const x of [806, 836]) { rod([x, 282, 52], up, 30, 6, 6, nickel, 24); rod([x, 252, 52], up, 48, 8, 8, knurlM, 32); }

  // ---- blocco IN acqua e blocco a T
  box(870, 198, 966, 254, -50, 50, aluHi, 3);
  decal(900, 214, 50.6, 22, 12, label("IN"));
  box(868, 253, 966, 288, -50, 50, alu, 3);
  box(902, 262, 932, 289, 40, 51, hole, 1);

  // ---- connettore fibra QBH: collo, ghiera blu, tappo zigrinato, pressacavo, fibra armata
  rod([888, 200, 0], up, 10, 40, 40, alu, 64);
  rod([888, 190, 0], up, 38, 48, 48, blue, 64);
  rod([888, 152, 0], up, 48, 52, 52, knurlM, 64);
  rod([888, 104, 0], up, 8, 47, 45, aluHi, 64);
  rod([888, 96, 0], up, 24, 17, 15, aluHi, 6);
  pipe([[888, 74, 0], [886, 20, -4], [870, -90, -25], [850, -200, -45], [845, -284, -50]], 13, rubber);
  const fBlue = fitting([920, 70, -40], up, brass);
  pipe([fBlue, [928, -60, -48], [950, -284, -60]], 6, blueHose);
  const fQ = fitting([930, 198, 30], up);
  pipe([fQ, [935, 100, 45], [960, -60, 40], [975, -284, 10]], 7, clear);

  // ---- telecamera coassiale: corpo rosso, connettori M8, staffa, obiettivo nero, ghiere
  box(703, 55, 796, 108, -42, 44, red, 3);
  for (const x of [732, 772]) { rod([x, 55, 0], up, 18, 10, 10, knurlM, 32); rod([x, 37, 0], up, 8, 7, 7, nickel, 24); pipe([[x, 30, 0], [x - 3, -60, -10], [x - 10, -284, -30]], 6, rubber); }
  box(688, 106, 798, 150, -48, 48, aluHi, 3);
  screw([702, 118, 48], [0, 0, 1]); screw([702, 138, 48], [0, 0, 1]);
  rod([727, 298, 0], up, 150, 37, 37, black, 64);
  rod([727, 192, 0], up, 26, 39, 39, knurlK, 64);
  rod([727, 302, 0], up, 14, 40, 40, knurlK, 64);
  rod([727, 345, 0], up, 44, 56, 56, knurlM, 64);
  rod([727, 405, 0], up, 60, 48, 48, alu, 64);

  // ---- lato destro: guida, vite di manovra filettata, slitta, volantino nero a 3 razze
  box(958, 200, 1002, 610, -78, -46, steel, 2);
  lathe([...Array.from({ length: 37 }, (_, i): [number, number] => [i % 2 ? 6.5 : 8, i * 2]), [0, 72]], [993, 515, -10], up, steel);
  box(1000, 512, 1092, 640, -82, 42, aluHi, 4);
  rod([1022, 532, 42], [0, 0, 1], .8, 10, 10, hole, 32); rod([1022, 532, 42], [0, 0, 1], 1.4, 6, 6, oxide, 24); rod([1022, 532, 43.4], [0, 0, 1], .4, 3, 3, hole, 6);
  const C = V([1122, 565, -20]), ax = new THREE.Vector3(1, 0, 0);
  const radial = (a: number, r: number, dx = 0) => C.clone().add(new THREE.Vector3(dx * S, Math.sin(a) * r * S, Math.cos(a) * r * S));
  rod([1092, 565, -20], [1, 0, 0], 22, 12, 12, aluHi);
  rod([1108, 565, -20], [1, 0, 0], 36, 25, 22, gloss);
  rod([1144, 565, -20], [1, 0, 0], 5, 15, 15, nickel);
  const rim = new THREE.TorusGeometry(92 * S, 11 * S, 20, 96); rim.rotateY(Math.PI / 2); put(rim, gloss, C.clone());
  for (let k = 0; k < 3; k++) { const a = Math.PI / 2 + k * Math.PI * 2 / 3; rodW(radial(a, 22, 14), radial(a, 86), 10, 7, gloss, 24); }
  const hp = radial(Math.PI / 2 + Math.PI / 3, 92);
  rodW(hp, hp.clone().addScaledVector(ax, 30 * S), 7, 7, nickel, 24);
  rodW(hp.clone().addScaledVector(ax, 26 * S), hp.clone().addScaledVector(ax, 72 * S), 11, 12.5, gloss, 32);
  put(new THREE.SphereGeometry(12.5 * S, 24, 16), gloss, hp.clone().addScaledVector(ax, 72 * S));

  // ---- carrello asse Z verso il portale: piastra, cappello, guide e pattini posteriori
  box(600, -285, 1010, 700, -126, -96, plate, 3);
  box(588, -305, 1022, -283, -128, 72, plate, 3);
  box(600, -285, 1010, 260, -196, -170, plate, 3);
  for (const x of [640, 970]) {
    box(x - 14, -270, x + 14, 690, -146, -126, steel, 2);
    box(x - 26, 80, x + 26, 200, -170, -146, steel, 3);
    box(x - 26, 72, x + 26, 80, -168, -148, red, 1); box(x - 26, 200, x + 26, 208, -168, -148, red, 1);
  }
  for (const y of [-200, -100, 0, 100, 200]) for (const x of [622, 988]) screw([x, y, -96], [0, 0, 1], 6);
  for (const y of [-200, -60, 80, 220]) for (const x of [640, 805, 970]) screw([x, y, -196], [0, 0, -1], 6);

  // ---- tubi: acqua trasparente, aria blu, linea rossa con giunto
  pipe([fSide, [565, 470, 112], [522, 400, 110], [520, 250, 90], [600, 60, 70], [690, -150, 10], [700, -284, -20]], 7, clear);
  pipe([fIn, [672, 552, 35], [640, 560, 45], [630, 610, 40], [650, 640, 22], fitting([650, 672, 20], up)], 7, clear);
  const uni: P3 = [1040, 274, 38], ud: P3 = [-.4, -1, -.4];
  pipe([fOut, [852, 575, 40], [862, 620, 60], [850, 650, 70], [880, 600, 90], [960, 520, 95], [1040, 420, 85], [1052, 320, 60], uni], 7, clear);
  rod(uni, ud, 26, 9, 9, nickel); rod(uni, ud, 5, 10.5, 10.5, blue); rod(adv(uni, ud, 21), ud, 5, 10.5, 10.5, blue);
  pipe([adv(uni, ud, 26), [1010, 160, 10], [988, -60, -20], [985, -284, -40]], 6, redHose);
  pipe([fMid[0], [906, 350, 105], [870, 420, 115], [840, 520, 110], [860, 600, 85], [895, 600, 55], fBox], 7, clear);
  pipe([fMid[1], [950, 365, 100], [1000, 360, 105], [1020, 300, 95], [1000, 200, 70], [960, 120, 50], [955, -284, 20]], 7, clear);
  for (const e of ends) rod([e[0], -283, e[2]], [0, 1, 0], 16, 13, 13, black, 24); // pressacavi sotto il cappello

  return k.build();
}
