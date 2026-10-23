import * as THREE from "three";
import { torchKit, type P3 } from "./torchKit";

// Torcia combo plasma + TIG-TIG LEDICA ricostruita dalla foto di riferimento (1407×1600 px). Quote in px della foto, vedi torchKit.
// tipY = quota delle punte di tungsteno; ritorna anche le posizioni delle punte per gli archi.
export function comboHead(tipY: number) {
  const k = torchKit(0.001, 710, 1567, tipY);
  const { S, X, Y, V, put, box, rod, lathe, screw, onCyl, pipe, M } = k;
  const { aluHi, alu, spun, black, gloss, hole, nickel, brass, plate, knurlTex } = k.mat;
  const amber = M({ color: 0xd9b36a, metalness: 0, roughness: .46, clearcoat: .3, clearcoatRoughness: .3 });
  const amberDk = M({ color: 0x9c7a3e, metalness: 0, roughness: .6 });
  const ceramic = M({ color: 0xd9a3b5, metalness: 0, roughness: .78 });
  const tungsten = M({ color: 0x8d9298, metalness: 1, roughness: .35 });
  const plastic = M({ color: 0x141516, metalness: 0, roughness: .5 });
  const greyPl = M({ color: 0x4b5054, metalness: .1, roughness: .5 });
  const rodGrey = M({ color: 0xb7bcc0, metalness: .6, roughness: .35 });
  const hose = M({ color: 0x2d6ec4, metalness: 0, roughness: .42 });
  const redH = M({ color: 0xd42b25, metalness: 0, roughness: .4 });
  const braid = knurlTex.clone(); braid.repeat.set(140, 4); braid.needsUpdate = true;
  const braidPink = M({ color: 0xeedcdc, metalness: 0, roughness: .5, bumpMap: braid, bumpScale: 1.5 });
  const braidBlue = M({ color: 0x8fbfe6, metalness: 0, roughness: .5, bumpMap: braid, bumpScale: 1.5 });
  const up: P3 = [0, -1, 0], front: P3 = [0, 0, 1];

  // ---- torcia plasma (asse x 525): cupola, ghiera ad asole, canna in due diametri
  const pc = 525;
  lathe([[0, 0], [52, 0], [60, 3], [95, 22], [118, 42], [126, 52], [126, 134], [118, 134], [118, 508], [124, 510], [124, 690], [0, 690]], [pc, 1562, 0], up, alu);
  rod([pc, 1511, 0], up, 82, 129, 129, aluHi, 72);
  for (let i = 0; i < 12; i++) onCyl(pc, 1469, 126, i * Math.PI / 6, 16, 56, 7, hole);
  screw([563, 956, 118], [.31, 0, .95], 7, nickel);
  // corpo isolante ambrato con ghiera di presa scanalata, collo e blocco in ottone
  lathe([[0, 0], [128, 0], [134, 4], [135, 10], [135, 205], [138, 208], [138, 312], [134, 322], [120, 327], [64, 327], [0, 327]], [pc, 875, 0], up, amber);
  for (let i = 0; i < 18; i++) onCyl(pc, 612, 136.5, i * Math.PI / 9, 7, 96, 5, amberDk);
  rod([pc, 550, 0], up, 140, 62, 62, brass, 48);
  box(455, 392, 600, 432, -60, 60, brass, 4);
  // colonna raccordi in ottone: esagoni, filetto, tubetto, fascetta
  rod([535, 392, 0], up, 50, 24, 24, brass, 6);
  lathe([...Array.from({ length: 31 }, (_, i): [number, number] => [i % 2 ? 17 : 19, i * 2]), [0, 60]], [535, 342, 0], up, brass);
  rod([535, 282, 0], up, 45, 22, 22, brass, 6);
  rod([535, 237, 0], up, 40, 16, 16, brass, 6);
  rod([535, 197, 0], up, 70, 11, 11, brass, 24);
  rod([535, 136, 0], up, 10, 17, 17, nickel, 32);
  // cilindro grigio posteriore con raccordi, asta di sostegno e staffetta
  rod([390, 560, -10], up, 190, 68, 68, greyPl, 48);
  rod([390, 370, -10], up, 8, 72, 70, greyPl, 48);
  rod([355, 362, -10], up, 32, 12, 12, nickel, 24);
  rod([430, 362, -10], up, 62, 15, 15, redH, 24);
  rod([485, 392, 10], up, 52, 16, 16, brass, 6);
  rod([365, 880, -10], up, 240, 20, 20, rodGrey, 24);
  box(300, 880, 400, 915, -50, 40, aluHi, 3);
  box(372, 915, 400, 1010, -40, 30, aluHi, 3);
  box(240, 535, 470, 645, -160, -40, black, 5);
  // sensore a sinistra: corpo nero, piastra frontale con pulsante e due viti
  box(30, 300, 300, 575, -120, 40, plastic, 6);
  box(75, 295, 218, 525, 40, 58, plastic, 4);
  rod([145, 388, 58], front, 16, 52, 50, gloss, 48);
  screw([95, 320, 58], front, 9, nickel); screw([95, 492, 58], front, 9, nickel);
  box(75, 520, 300, 580, -80, 40, black, 3);

  // ---- blocco TIG-TIG: corpo in acciaio, listello superiore, tappi ottagonali torniti
  box(660, 990, 1050, 1300, -85, 85, aluHi, 5);
  box(658, 925, 1052, 992, -88, 92, aluHi, 3);
  screw([805, 958, 92], front, 4, nickel); screw([945, 958, 92], front, 4, nickel);
  for (const cx of [785, 930]) {
    const h = 70 * S, c = 20 * S, sh = new THREE.Shape();
    sh.moveTo(-h + c, -h); sh.lineTo(h - c, -h); sh.lineTo(h, -h + c); sh.lineTo(h, h - c); sh.lineTo(h - c, h); sh.lineTo(-h + c, h); sh.lineTo(-h, h - c); sh.lineTo(-h, -h + c); sh.closePath();
    const cap = new THREE.ExtrudeGeometry(sh, { depth: 10 * S, bevelEnabled: true, bevelSize: 1.5 * S, bevelThickness: 1.5 * S, bevelSegments: 2 });
    const uv = cap.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / (2 * h) + .5, uv.getY(i) / (2 * h) + .5); // uv 0..1 sulla faccia
    put(cap, spun, V([cx, 1067, 85]));
    box(cx - 60, 1126, cx + 60, 1146, 84, 88, hole, 2);
  }
  screw([690, 1195, 85], front, 13); screw([1015, 1195, 85], front, 13);
  // staffa a L con linguetta guida e braccio destro
  box(750, 1250, 1050, 1330, 85, 108, aluHi, 3);
  box(750, 1250, 830, 1560, 90, 115, aluHi, 3);
  screw([790, 1450, 115], front, 12);
  box(1045, 1290, 1360, 1395, -40, 108, aluHi, 3);
  screw([1175, 1338, 108], front, 12);
  rod([1080, 1335, 108], front, 1, 10, 10, hole, 24);
  // ugelli ceramici rosa con elettrodo di tungsteno
  for (const cx of [790, 905]) {
    lathe([[0, 0], [20, 0], [24, 4], [30, 25], [44, 80], [47, 100], [47, 170], [0, 170]], [cx, 1555, 0], up, ceramic);
    rod([cx, 1567, 0], up, 14, 1.5, 4.5, tungsten, 12);
  }
  // scatola connettori nera a destra
  box(1050, 1170, 1250, 1300, -70, 70, plastic, 6);
  box(1085, 1150, 1105, 1240, -50, 72, plastic, 3); box(1180, 1150, 1200, 1240, -50, 72, plastic, 3);
  screw([1125, 1215, 72], front, 9, nickel); screw([1158, 1215, 72], front, 9, nickel);
  // attacchi cavo-acqua TIG: esagono, codolo rastremato, esagono; ottoni dietro
  for (const cx of [783, 915]) {
    rod([cx, 930, 0], up, 118, 27, 27, nickel, 6);
    lathe([[0, 0], [16, 0], [13, 40], [12, 55], [16, 70], [22, 85], [0, 85]], [cx, 812, 0], up, nickel);
    rod([cx, 727, 0], up, 77, 26, 26, nickel, 6);
    rod([cx - 40, 900, -40], up, 60, 12, 12, brass, 6);
  }

  // ---- telaio nero di supporto (tubolare quadro), raccordi al blocco e alla torcia, piastra superiore
  box(560, 370, 1290, 425, -262, -192, black, 3);
  box(1240, 370, 1340, 950, -420, -192, black, 3);
  box(680, 690, 1240, 760, -262, -192, black, 3);
  box(560, 880, 1240, 950, -262, -192, black, 3);
  box(560, 370, 620, 950, -262, -192, black, 3);
  box(700, 960, 1000, 1100, -192, -85, black, 3);
  box(440, 560, 600, 630, -200, -60, black, 3);
  box(560, -45, 1340, 950, -470, -420, plate, 3);
  box(200, -70, 1360, -40, -470, 140, plate, 4);

  // ---- fascio tubi: dall'alto ai raccordi
  const hoses: [P3[], number, THREE.Material][] = [
    [[[355, -42, -10], [350, 100, 10], [352, 250, 0], [355, 330, -10]], 15, hose],
    [[[430, -42, 0], [425, 150, 15], [430, 300, -10]], 14, redH],
    [[[490, -42, 40], [470, 120, 60], [480, 260, 40], [485, 340, 10]], 18, braidPink],
    [[[535, -42, 0], [530, 60, 5], [535, 127, 0]], 15, hose],
    [[[600, -42, 90], [610, 150, 140], [640, 400, 165], [662, 700, 160], [680, 950, 120], [690, 1010, 40]], 13, braidBlue],
    [[[640, -42, 40], [650, 200, 70], [700, 450, 70], [770, 600, 20], [783, 650, 0]], 17, hose],
    [[[760, -42, 10], [780, 200, 40], [880, 450, 40], [910, 600, 10], [915, 650, 0]], 17, hose],
    [[[700, -42, -30], [720, 200, -10], [760, 500, -30], [743, 840, -40]], 16, braidPink],
    [[[740, -42, -60], [760, 250, -60], [860, 600, -50], [875, 840, -40]], 12, redH],
    [[[820, -42, -20], [880, 150, -10], [1150, 450, 10], [1290, 900, 0], [1290, 1290, 0]], 18, hose],
    [[[870, -42, -50], [950, 150, -40], [1200, 450, -30], [1325, 900, -30], [1325, 1290, -30]], 18, hose],
  ];
  for (const [pts, r, m] of hoses) { pipe(pts, r, m); rod([pts[0][0], -40, pts[0][2]], [0, 1, 0], 16, r + 6, r + 6, black, 24); }
  rod([1290, 1285, 0], up, 14, 20, 20, nickel, 32); rod([1325, 1285, -30], up, 14, 20, 20, nickel, 32);

  return { g: k.build(), plasma: [X(pc), Y(1562)] as const, tigs: [[X(790), Y(1567)], [X(905), Y(1567)]] as const };
}
