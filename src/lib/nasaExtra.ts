/**
 * High-value NASA feeds for SSA console:
 * - APOD (ops briefing image)
 * - EONET (active Earth events)
 * - TLE API (ISS / catalog TLE JSON)
 * - SSC (Satellite Situation Center observatory catalog)
 */

const NASA_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

export type ApodBrief = {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  mediaType: string;
  copyright?: string;
};

export type EonetEvent = {
  id: string;
  title: string;
  category: string;
  date: string | null;
  lat: number | null;
  lon: number | null;
  magnitude: string | null;
  source: string;
  link: string;
};

export type TleRecord = {
  satelliteId: number;
  name: string;
  date: string;
  line1: string;
  line2: string;
  source: string;
};

export type SscObservatory = {
  id: string;
  name: string;
  resolutionSec: number;
  resourceId?: string;
};

export async function fetchApod(): Promise<ApodBrief | null> {
  try {
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    if (d.error) return null;
    return {
      title: String(d.title ?? "APOD"),
      date: String(d.date ?? ""),
      explanation: String(d.explanation ?? "").slice(0, 400),
      url: String(d.url ?? ""),
      hdurl: d.hdurl ? String(d.hdurl) : undefined,
      mediaType: String(d.media_type ?? "image"),
      copyright: d.copyright ? String(d.copyright) : undefined,
    };
  } catch {
    return null;
  }
}

export async function fetchEonet(limit = 12): Promise<EonetEvent[]> {
  try {
    const res = await fetch(
      `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=${limit}`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) throw new Error(`EONET ${res.status}`);
    const data = await res.json();
    const events = Array.isArray(data.events) ? data.events : [];
    return events.map((e: any) => {
      const cats = e.categories ?? [];
      const geom = (e.geometry ?? []).slice(-1)[0];
      const coords = geom?.coordinates;
      const lon = Array.isArray(coords) ? Number(coords[0]) : null;
      const lat = Array.isArray(coords) ? Number(coords[1]) : null;
      const mag =
        geom?.magnitudeValue != null
          ? `${geom.magnitudeValue}${geom.magnitudeUnit ? ` ${geom.magnitudeUnit}` : ""}`
          : null;
      const src = (e.sources ?? [])[0];
      return {
        id: String(e.id ?? ""),
        title: String(e.title ?? ""),
        category: String(cats[0]?.title ?? cats[0]?.id ?? "Event"),
        date: geom?.date ? String(geom.date) : null,
        lat: Number.isFinite(lat) ? lat : null,
        lon: Number.isFinite(lon) ? lon : null,
        magnitude: mag,
        source: String(src?.id ?? "EONET"),
        link: String(e.link ?? ""),
      };
    });
  } catch {
    return [];
  }
}

export async function fetchNasaTle(noradId = 25544): Promise<TleRecord | null> {
  try {
    const res = await fetch(
      `https://tle.ivanstanojevic.me/api/tle/${noradId}`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) throw new Error(`TLE ${res.status}`);
    const d = await res.json();
    return {
      satelliteId: Number(d.satelliteId ?? noradId),
      name: String(d.name ?? `NORAD ${noradId}`),
      date: String(d.date ?? ""),
      line1: String(d.line1 ?? ""),
      line2: String(d.line2 ?? ""),
      source: "NASA TLE API · tle.ivanstanojevic.me",
    };
  } catch {
    return null;
  }
}

export async function fetchSscObservatories(limit = 16): Promise<SscObservatory[]> {
  try {
    const res = await fetch(
      "https://sscweb.gsfc.nasa.gov/WS/sscr/2/observatories",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) throw new Error(`SSC ${res.status}`);
    const raw = await res.json();
    const list =
      raw?.[1]?.Observatory?.[1] ??
      raw?.Observatory ??
      (Array.isArray(raw) ? raw : []);
    const rows = Array.isArray(list) ? list : [];
    const out: SscObservatory[] = [];
    for (const item of rows) {
      const desc = Array.isArray(item) ? item[1] : item;
      if (!desc?.Id && !desc?.id) continue;
      out.push({
        id: String(desc.Id ?? desc.id),
        name: String(desc.Name ?? desc.name ?? ""),
        resolutionSec: Number(desc.Resolution ?? desc.resolution ?? 0),
        resourceId: desc.ResourceId ? String(desc.ResourceId) : undefined,
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}
