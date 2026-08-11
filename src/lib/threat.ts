import type {
  NeoObject,
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
  weather: SpaceWeatherEvent[]
): ThreatItem[] {
  const items: ThreatItem[] = [];

  for (const n of neos) {
    const ld = lunarDistances(n.missKm || 1);
    let score = 10;
    if (n.hazardous) score += 35;
    if (ld < 5) score += 40;
    else if (ld < 20) score += 20;
    else if (ld < 50) score += 10;
    if (n.diameterKm > 0.2) score += 15;
    if (n.diameterKm > 0.5) score += 15;

    items.push({
      id: `neo-${n.id}`,
      source: "NEO",
      title: n.hazardous ? `PHA · ${n.name}` : `NEO · ${n.name}`,
      detail: `Miss ${ld.toFixed(2)} LD · Ø ${n.diameterKm} km · ${n.approachDate}`,
      level: levelFromScore(score),
      score: Math.min(100, score),
    });
  }

  for (const w of weather) {
    const t = `${w.type} ${w.note}`.toUpperCase();
    let score = 25;
    if (t.includes("G3") || t.includes("SEVERE") || t.includes("X-CLASS"))
      score = 85;
    else if (t.includes("G2") || t.includes("M-CLASS") || t.includes("CME"))
      score = 60;
    else if (t.includes("G1") || t.includes("FLARE") || t.includes("STORM"))
      score = 40;

    items.push({
      id: `donki-${w.id}`,
      source: "DONKI",
      title: w.type || "Space weather",
      detail: (w.note || w.startTime).slice(0, 120),
      level: levelFromScore(score),
      score,
    });
  }

  if (items.length === 0) {
    items.push({
      id: "sys-clear",
      source: "SYSTEM",
      title: "No active elevated threats",
      detail: "NeoWs and DONKI quiet for the current window",
      level: "CLEAR",
      score: 0,
    });
  }

  return items.sort((a, b) => b.score - a.score).slice(0, 8);
}

export function boardSeverity(items: ThreatItem[]): ThreatLevel {
  if (items.some((i) => i.level === "SEVERE")) return "SEVERE";
  if (items.some((i) => i.level === "ELEVATED")) return "ELEVATED";
  if (items.some((i) => i.level === "WATCH")) return "WATCH";
  return "CLEAR";
}
