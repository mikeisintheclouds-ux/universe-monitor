import type { IssState, NeoObject, UniverseSnapshot } from "./types";
import { planetStates } from "./astro";

const NASA_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchNeos(): Promise<NeoObject[]> {
  try {
    const d = todayIso();
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${d}&end_date=${d}&api_key=${NASA_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`NEO ${res.status}`);
    const data = await res.json();
    const list = data.near_earth_objects?.[d] ?? [];
    return list.slice(0, 12).map((n: any) => {
      const approach = n.close_approach_data?.[0] ?? {};
      const diam = n.estimated_diameter?.kilometers?.estimated_diameter_max ?? 0;
      return {
        id: String(n.id),
        name: n.name,
        hazardous: Boolean(n.is_potentially_hazardous_asteroid),
        diameterKm: Number(diam.toFixed?.(3) ?? diam),
        missKm: Number(approach.miss_distance?.kilometers ?? 0),
        velocityKph: Number(approach.relative_velocity?.kilometers_per_hour ?? 0),
        approachDate: approach.close_approach_date_full ?? approach.close_approach_date ?? d,
      } satisfies NeoObject;
    });
  } catch {
    return [
      {
        id: "demo-1",
        name: "(2026 AB1)",
        hazardous: false,
        diameterKm: 0.12,
        missKm: 4_200_000,
        velocityKph: 42_000,
        approachDate: todayIso(),
      },
      {
        id: "demo-2",
        name: "PHA Demo",
        hazardous: true,
        diameterKm: 0.28,
        missKm: 7_100_000,
        velocityKph: 58_000,
        approachDate: todayIso(),
      },
    ];
  }
}

export async function fetchIss(): Promise<IssState | null> {
  try {
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error("ISS");
    const d = await res.json();
    return {
      latitude: d.latitude,
      longitude: d.longitude,
      altitudeKm: d.altitude,
      velocityKph: d.velocity,
      timestamp: d.timestamp,
    };
  } catch {
    return {
      latitude: 28.5,
      longitude: -80.6,
      altitudeKm: 420,
      velocityKph: 27600,
      timestamp: Date.now() / 1000,
    };
  }
}

export function defaultObserver() {
  return {
    latitude: 34.9943,
    longitude: -81.2421,
    label: "York, South Carolina",
  };
}

export async function getUniverseSnapshot(): Promise<UniverseSnapshot> {
  const [neos, iss] = await Promise.all([fetchNeos(), fetchIss()]);
  return {
    generatedAt: new Date().toISOString(),
    zoom: "solar",
    neos,
    planets: planetStates(),
    iss,
    observer: defaultObserver(),
  };
}

export function formatKm(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M km`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k km`;
  return `${Math.round(n)} km`;
}
