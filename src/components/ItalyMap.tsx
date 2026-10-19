import { feature } from "topojson-client";
import { geoMercator, geoPath, geoBounds } from "d3-geo";
import world from "world-atlas/countries-50m.json";
import type { Feature, FeatureCollection } from "geojson";

const W = 640, H = 420;
const all = (feature(world as any, (world as any).objects.countries) as unknown as FeatureCollection).features as Feature[];
const near = all.filter((f) => { const [[a, b], [c, d]] = geoBounds(f); return c > -8 && a < 25 && d > 34 && b < 52; });
const italy = all.find((f) => f.id === "380")!;
const proj = geoMercator().fitExtent([[10, 10], [W - 10, H - 10]], { type: "FeatureCollection", features: [italy] } as any);
const gp = geoPath(proj);
const paths = near.map((f) => ({ id: String(f.id), d: gp(f) || "" }));
const pin = proj([9.16, 45.38])!;

/** Italia con Rozzano evidenziata. */
export function ItalyMap({ label, city }: { label: string; city: string }) {
  return (
    <figure className="dg" style={{ maxWidth: "none" }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <rect width={W} height={H} fill="#161a15" />
        {paths.map((p, i) => (<path key={i} d={p.d} fill={p.id === "380" ? "#25402a" : "#1f241d"} stroke={p.id === "380" ? "#62b23c" : "#343a33"} strokeWidth={p.id === "380" ? 1.4 : .6} />))}
        <circle cx={pin[0]} cy={pin[1]} r="6" fill="#fff" /><circle cx={pin[0]} cy={pin[1]} r="6" className="map-ping home" />
        <path d={`M${pin[0]} ${pin[1]} L${pin[0] + 70} ${pin[1] - 40} H${pin[0] + 200}`} stroke="#8fd467" fill="none" />
        <text x={pin[0] + 74} y={pin[1] - 48} className="dg-t">{city}</text>
      </svg>
    </figure>
  );
}
