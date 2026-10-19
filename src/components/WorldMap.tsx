import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath, geoInterpolate } from "d3-geo";
import world from "world-atlas/countries-110m.json";
import type { FeatureCollection } from "geojson";

const W = 960, H = 480;
const fc = feature(world as any, (world as any).objects.countries) as unknown as FeatureCollection;
const proj = geoNaturalEarth1().fitExtent([[4, 4], [W - 4, H - 4]], { type: "Sphere" } as any);
const gp = geoPath(proj);
const paths = fc.features.filter((f) => f.id !== "010").map((f) => ({ id: String(f.id), d: gp(f) || "" }));

const HOME: [number, number] = [9.16, 45.38]; // Rozzano
const CITY: Record<string, { n: string; c: [number, number] }> = {
  "840": { n: "Chicago", c: [-87.6, 41.9] }, "300": { n: "Grecia", c: [23.7, 37.98] }, "682": { n: "Riyadh", c: [46.7, 24.7] }, "356": { n: "India", c: [77.2, 28.6] },
  "792": { n: "Turchia", c: [32.8, 39.9] }, "784": { n: "Dubai", c: [55.3, 25.2] }, "705": { n: "Slovenia", c: [14.5, 46.05] }, "724": { n: "Barcellona", c: [2.17, 41.38] }, "156": { n: "Foshan", c: [113.1, 23.0] },
};
const pt = (c: [number, number]) => proj(c)!;

/** Mappa Paesi serviti, con rotte animate da Rozzano. */
export function WorldMap({ on, label }: { on: string[]; label: string }) {
  const set = new Set(on);
  const h = pt(HOME);
  const routes = on.filter((id) => CITY[id]).map((id, i) => {
    const a = HOME, b = CITY[id].c;
    const itp = geoInterpolate(a, b);
    const pts = Array.from({ length: 24 }, (_, k) => pt(itp(k / 23)));
    // arco sollevato: alza il punto medio in schermo
    const lift = Math.hypot(pts[23][0] - pts[0][0], pts[23][1] - pts[0][1]) * 0.22;
    const d = pts.map((p, k) => { const s = Math.sin((k / 23) * Math.PI); return `${k ? "L" : "M"}${p[0].toFixed(1)} ${(p[1] - lift * s).toFixed(1)}`; }).join(" ");
    return { id, d, end: pt(b), name: CITY[id].n, i };
  });
  return (
    <div className="map-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {paths.map((p, i) => (<path key={i} d={p.d} className={set.has(p.id) ? "map-on" : "map-land"} />))}
        {routes.map((r) => (<path key={r.id} d={r.d} className="map-route" pathLength={1} style={{ animationDelay: `${r.i * 0.35}s` }} />))}
        {routes.map((r) => (<g key={"p" + r.id}><circle cx={r.end[0]} cy={r.end[1]} r="3.2" className="map-dot" /><circle cx={r.end[0]} cy={r.end[1]} r="3.2" className="map-ping" style={{ animationDelay: `${r.i * 0.35}s` }} /></g>))}
        <circle cx={h[0]} cy={h[1]} r="4.5" fill="#fff" /><circle cx={h[0]} cy={h[1]} r="4.5" className="map-ping home" />
        <text x={h[0] - 8} y={h[1] - 12} textAnchor="end" className="map-lbl">Rozzano</text>
      </svg>
    </div>
  );
}
