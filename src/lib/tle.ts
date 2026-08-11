/**
 * Celestial / orbital TLE catalog helpers (Celestrak GP API)
 *
 * https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=TLE
 * Always set FORMAT=TLE|JSON (default became CSV in 2026).
 */

export type TleGroup =
  | "starlink"
  | "stations"
  | "visual"
  | "active"
  | "weather"
  | "noaa"
  | "goes"
  | "oneweb"
  | "iridium"
  | "iridium-NEXT"
  | "planet"
  | "spire";

export interface TleSet {
  name: string;
  line1: string;
  line2: string;
  noradId: number | null;
  epochYear: number | null;
  epochDay: number | null;
}

export interface CatalogSummary {
  group: string;
  count: number;
  sample: TleSet[];
  source: string;
  fetchedAt: string;
}

const CELESTRAK = "https://celestrak.org/NORAD/elements/gp.php";

export function celestrakGroupUrl(
  group: TleGroup | string,
  format: "TLE" | "JSON" | "JSON-PRETTY" = "TLE"
): string {
  return `${CELESTRAK}?GROUP=${encodeURIComponent(group)}&FORMAT=${format}`;
}

export function celestrakCatnrUrl(
  norad: number,
  format: "TLE" | "JSON" = "TLE"
): string {
  return `${CELESTRAK}?CATNR=${norad}&FORMAT=${format}`;
}

export function parseTleText(text: string): TleSet[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const out: TleSet[] = [];
  for (let i = 0; i < lines.length; ) {
    let name = "UNKNOWN";
    let line1 = "";
    let line2 = "";
    if (lines[i]?.startsWith("1 ") && lines[i + 1]?.startsWith("2 ")) {
      line1 = lines[i];
      line2 = lines[i + 1];
      i += 2;
    } else {
      name = lines[i] ?? name;
      line1 = lines[i + 1] ?? "";
      line2 = lines[i + 2] ?? "";
      i += 3;
    }
    if (!line1.startsWith("1 ") || !line2.startsWith("2 ")) continue;
    const noradRaw = line1.slice(2, 7).trim();
    const noradId = /^\d+$/.test(noradRaw) ? Number(noradRaw) : null;
    const epochField = line1.slice(18, 32).trim();
    let epochYear: number | null = null;
    let epochDay: number | null = null;
    const em = epochField.match(/^(\d{2})(\d{3}(?:\.\d+)?)/);
    if (em) {
      const yy = Number(em[1]);
      epochYear = yy < 57 ? 2000 + yy : 1900 + yy;
      epochDay = Number(em[2]);
    }
    out.push({ name, line1, line2, noradId, epochYear, epochDay });
  }
  return out;
}

export async function fetchTleGroup(
  group: TleGroup | string,
  sampleSize = 8
): Promise<CatalogSummary> {
  const url = celestrakGroupUrl(group, "TLE");
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Celestrak ${res.status}`);
    const text = await res.text();
    const all = parseTleText(text);
    return {
      group: String(group),
      count: all.length,
      sample: all.slice(0, sampleSize),
      source: url,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return {
      group: String(group),
      count: 0,
      sample: [],
      source: url,
      fetchedAt: new Date().toISOString(),
    };
  }
}

export async function fetchIssTle(): Promise<TleSet | null> {
  try {
    const res = await fetch(celestrakCatnrUrl(25544, "TLE"), {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const sets = parseTleText(await res.text());
    return sets[0] ?? null;
  } catch {
    return null;
  }
}

export const MONITOR_GROUPS: TleGroup[] = [
  "stations",
  "starlink",
  "oneweb",
  "weather",
  "goes",
  "visual",
];
