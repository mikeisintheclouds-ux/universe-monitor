import type {
  CadApproach,
  NeoObject,
  SentryObject,
  SpaceWeatherEvent,
  ThreatItem,
  ThreatLevel,
} from "./types";

function levelFromScore(score: number): ThreatLevel {
  if (score >= 80) return "SEVERE";
  if (score >= 55) return "ELEVATED";
  if (score >= 30) return "WATCH";
  return "CLEAR";
}

function lunarDistances(missKm: number): number {
  return missKm / 384_400;
}

export function buildThreatBoard(
  neos: NeoObject[],
  weather: SpaceWeatherEvent[],
  cad: CadApproach[] = [],
  sentry: SentryObject[] = []
): ThreatItem[] {
  const items: ThreatItem[] = [];

  for (const s of sentry.slice(0, 6)) {
    let score = 40;
    if (s.psMax >= -2) score += 35;
    else if (s.psMax >= -4) score += 25;
    else if (s.psMax >= -6) score += 12;
    if (s.ip >= 1e-3) score += 20;
    else if (s.ip >= 1e-4) score += 12;
    else if (s.ip >= 1e-5) score += 6;
    if (s.tsMax >= 1) score += 15;

    items.push({
      id: `sentry-${s.des}`,
      source: "SENTRY",
      title: `Sentry · ${s.fullname}`,
      detail: `IP ${s.ip.toExponential(2)} · Palermo ${s.psCum.toFixed(2)} · Torino ${s.tsMax} · ${s.range}`,
      level: levelFromScore(score),
      score: Math.min(100, score),
    });
  }

  for (const c of cad.slice(0, 8)) {
    let score = 15;
    if (c.distLd < 1) score += 45;
    else if (c.distLd < 3) score += 30;
    else if (c.distLd < 5) score += 18;
    else if (c.distLd < 10) score += 8;
    if (c.h < 22) score += 12;
    if (c.h < 20) score += 10;

    items.push({
      id: `cad-${c.des}-${c.cd}`,
      source: "CAD",
      title: `CAD · ${c.des}`,
      detail: `${c.distLd.toFixed(2)} LD · ${c.cd} · ${c.vRelKms.toFixed(1)} km/s · H ${c.h}`,
      level: levelFromScore(score),
      score: Math.min(100, score),
    });
  }

  for (const n of neos) {
    const ld = lunarDistances(n.missKm || 1);
    let score = 6;
    if (n.hazardous) score += 28;
    if (ld < 5) score += 30;
    else if (ld < 20) score += 14;
    if (n.diameterKm > 0.2) score += 10;

    items.push({
      id: `neo-${n.id}`,
      source: "NEO",
      title: n.hazardous ? `NeoWs PHA · ${n.name}` : `NeoWs · ${n.name}`,
      detail: `Miss ${ld.toFixed(2)} LD · Ø ${n.diameterKm} km · ${n.approachDate}`,
      level: levelFromScore(score),
      score: Math.min(100, score),
    });
  }

  for (const w of weather) {
    const t = `${w.type} ${w.note}`.toUpperCase();
    let score = 20;
    if (t.includes("G3") || t.includes("SEVERE") || t.includes("X-CLASS"))
      score = 78;
    else if (t.includes("G2") || t.includes("M-CLASS") || t.includes("CME"))
      score = 55;
    else if (t.includes("G1") || t.includes("FLARE") || t.includes("STORM"))
      score = 35;

    items.push({
      id: `donki-${w.id}`,
      source: "DONKI",
      title: w.type || "Space weather advisory",
      detail: (w.note || w.startTime).slice(0, 120),
      level: levelFromScore(score),
      score,
    });
  }

  if (items.length === 0) {
    items.push({
      id: "sys-clear",
      source: "SYSTEM",
      title: "No elevated indicators",
      detail: "CAD, Sentry, NeoWs, and DONKI quiet for this window",
      level: "CLEAR",
      score: 0,
    });
  }

  return items.sort((a, b) => b.score - a.score).slice(0, 10);
}

export function boardSeverity(items: ThreatItem[]): ThreatLevel {
  if (items.some((i) => i.level === "SEVERE")) return "SEVERE";
  if (items.some((i) => i.level === "ELEVATED")) return "ELEVATED";
  if (items.some((i) => i.level === "WATCH")) return "WATCH";
  return "CLEAR";
}
