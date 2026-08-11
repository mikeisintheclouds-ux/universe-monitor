/**
 * Universe Monitor data plane
 * CNEOS CAD/Sentry · NeoWs · EPIC · DONKI · ISS · Celestrak TLE
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
import { buildThreatBoard } from "./threat";
import { fetchCadApproaches, fetchSentrySummary } from "./cneos";

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
    return [];
  }
}

function epicUrlFromMeta(latest: any): EpicFrame {
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
}

export async function fetchEpic(): Promise<EpicFrame | null> {
  try {
    const metaRes = await fetch(
      `https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!metaRes.ok) throw new Error(`EPIC ${metaRes.status}`);
    const frames = await metaRes.json();
    if (!Array.isArray(frames) || frames.length === 0) return null;
    return epicUrlFromMeta(frames[frames.length - 1]);
  } catch {
    return null;
  }
}

export async function fetchEpicByDate(dateIso: string): Promise<EpicFrame | null> {
  try {
    const metaRes = await fetch(
      `https://api.nasa.gov/EPIC/api/natural/date/${dateIso}?api_key=${NASA_KEY}`,
      { next: { revalidate: 86400 } }
    );
    if (!metaRes.ok) throw new Error(`EPIC date ${metaRes.status}`);
    const frames = await metaRes.json();
    if (!Array.isArray(frames) || frames.length === 0) return null;
    return epicUrlFromMeta(frames[Math.floor(frames.length / 2)]);
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
    return null;
  }
}

export async function fetchDonki(): Promise<SpaceWeatherEvent[]> {
  try {
    const end = todayIso();
    const start = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
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

function parseFirstTle(text: string) {
  const lines = text.trim().split(/\r?\n/).map((l) => l.trim());
  for (let i = 0; i + 2 < lines.length; i++) {
    if (lines[i + 1]?.startsWith("1 ") && lines[i + 2]?.startsWith("2 ")) {
      return { name: lines[i], line1: lines[i + 1], line2: lines[i + 2] };
    }
  }
  return null;
}

export async function fetchStarlink(): Promise<StarlinkSummary> {
  try {
    const [res, issRes] = await Promise.all([
      fetch(
        "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle",
        { next: { revalidate: 3600 } }
      ),
      fetch(
        "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle",
        { next: { revalidate: 1800 } }
      ),
    ]);
    if (!res.ok) throw new Error("celestrak");
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    const names: string[] = [];
    for (let i = 0; i < lines.length; i += 3) {
      const name = lines[i]?.trim();
      if (name) names.push(name);
    }
    const issText = issRes.ok ? await issRes.text() : "";
    return {
      catalogCount: names.length,
      sampleNames: names.slice(0, 8),
      source: "Celestrak GROUP=starlink + CATNR 25544",
      sampleTle: parseFirstTle(text),
      issTle: issText ? parseFirstTle(issText) : null,
    };
  } catch {
    return {
      catalogCount: 0,
      sampleNames: [],
      source: "Celestrak (unavailable)",
      sampleTle: null,
      issTle: null,
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
  // CNEOS: one request at a time
  const cad = await fetchCadApproaches({ days: 30, distMaxLd: 10, limit: 12 });
  const sentry = await fetchSentrySummary(10);
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
    cad,
    sentry,
    threats: buildThreatBoard(neos, weather, cad, sentry),
    loadedBy: "Universe Monitor",
  };
}

export function formatKm(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M km`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k km`;
  return `${Math.round(n)} km`;
}
