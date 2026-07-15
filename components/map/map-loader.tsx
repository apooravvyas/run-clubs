"use client";

/**
 * Full-screen branded loading gate shown until the map is genuinely rendered.
 * No spinner — a subtle equalizer + city coordinates in the product's type system.
 */
export function MapLoader({
  city,
  lat,
  lng,
  hidden,
  noToken = false,
}: {
  city: string;
  lat: number;
  lng: number;
  hidden: boolean;
  noToken?: boolean;
}) {
  const bars = Array.from({ length: 18 });
  const fmt = (v: number, pos: string, neg: string) =>
    `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;
  return (
    <div className={`map-loader${hidden ? " map-loader--hide" : ""}`} aria-hidden={hidden}>
      <div className="map-loader__brand">
        RunClubs <i>{city}</i>
      </div>
      <div className="map-loader__eq">
        {bars.map((_, i) => (
          <span key={i} style={{ animationDelay: `${(i % 9) * 0.09}s` }} />
        ))}
      </div>
      <div className="map-loader__coords">
        <span>{fmt(lat, "N", "S")}</span>
        <span className="rule" />
        <span>{fmt(lng, "E", "W")}</span>
      </div>
      <div className="map-loader__label">{noToken ? "Map requires configuration" : `Loading ${city}…`}</div>
    </div>
  );
}
