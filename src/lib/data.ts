/**
 * Universe Monitor data plane
 * NASA NeoWs · EPIC (DSCOVR camera) · DONKI · ISS · Starlink TLE catalog
 */

import type {
  EpicFrame,
  IssState,
  NeoObject,
  SpaceWeatherEvent,
  StarlinkSummary,
  UniverseSnapshot,
} from "./types";
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
      const diam =
        n.estimated_diameter?.kilometers?.estimated_diameter_max ?? 0;
      return {
        id: String(n.id),
        name: n.name,
        hazardous: Boolean(n.is_potentially_hazardous_asteroid),
        diameterKm: Number(diam.toFixed?.(3) ?? diam),
        missKm: Number(approach.miss_distance?.kilometers ?? 0),
        velocityKph: Number(
          approach.relative_velocity?.kilometers_per_hour ?? 0
        ),
        approachDate:
          approach.close_approach_date_full ??
          approach.close_approach_date ??
          d,
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

/** Real satellite camera: DSCOVR EPIC full-disk Earth from L1 */
export async function fetchEpic(): Promise<EpicFrame | null> {
  try {
    const metaRes = await fetch(
      `https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!metaRes.ok) throw new Error(`EPIC ${metaRes.status}`);
    const frames = await metaRes.json();
    if (!Array.isArray(frames) || frames.length === 0) return null;
    const latest = frames[frames.length - 1];
    const date = String(latest.date ?? "").slice(0, 10);
    const [y, m, d] = date.split("-");
    const image = latest.image as string;
    const url = `https://epic.gsfc.nasa.gov/archive/natural/${y}/${m}/${d}/jpg/${image}.jpg`;
    return {
      image,
      date: latest.date,
      caption: latest.caption ?? "DSCOVR EPIC Earth",
      url,
      lat: latest.centroid_coordinates?.lat ?? 0,
      lon: latest.centroid_coordinates?.lon ?? 0,
    };
  } catch {
    return null;
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

export async function fetchDonki(): Promise<SpaceWeatherEvent[]> {
  try {
    const end = todayIso();
    const start = new Date(Date.now() - 3 * 86400000)
      .toISOString()
      .slice(0, 10);
    const url = `https://api.nasa.gov/DONKI/notifications?startDate=${start}&endDate=${end}&type=all&api_key=${NASA_KEY}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`DONKI ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.slice(0, 6).map((e: any, i: number) => ({
      id: String(e.messageID ?? e.messageType ?? i),
      type: String(e.messageType ?? "ALERT"),
      startTime: String(e.messageIssueTime ?? ""),
      note: String(e.messageBody ?? e.messageType ?? "").slice(0, 160),
    }));
  } catch {
    return [];
  }
}

/** Starlink: public TLE catalog (positions), not cameras. */
export async function fetchStarlink(): Promise<StarlinkSummary> {
  try {
    const res = await fetch(
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("celestrak");
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    const names: string[] = [];
    for (let i = 0; i < lines.length; i += 3) {
      const name = lines[i]?.trim();
      if (name) names.push(name);
    }
    return {
      catalogCount: names.length,
      sampleNames: names.slice(0, 8),
      source: "Celestrak GROUP=starlink",
    };
  } catch {
    return {
      catalogCount: 0,
      sampleNames: [],
      source: "Celestrak (unavailable)",
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
  const [neos, iss, epic, weather, starlink] = await Promise.all([
    fetchNeos(),
    fetchIss(),
    fetchEpic(),
    fetchDonki(),
    fetchStarlink(),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    zoom: "solar",
    neos,
    planets: planetStates(),
    iss,
    observer: defaultObserver(),
    epic,
    weather,
    starlink,
    loadedBy: "AFRO SATOSHI \u00b7 Crypt Keeper uplink",
  };
}

export function formatKm(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M km`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k km`;
  return `${Math.round(n)} km`;
}
