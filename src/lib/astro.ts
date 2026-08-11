import type { PlanetState } from "./types";

const PLANETS: Array<{
  name: string;
  symbol: string;
  color: string;
  periodDays: number;
  longitudeAtEpoch: number;
  distanceAu: number;
}> = [
  { name: "Mercury", symbol: "☿", color: "#a8a29e", periodDays: 87.97, longitudeAtEpoch: 250, distanceAu: 0.39 },
  { name: "Venus", symbol: "♀", color: "#fbbf24", periodDays: 224.7, longitudeAtEpoch: 180, distanceAu: 0.72 },
  { name: "Earth", symbol: "♁", color: "#38bdf8", periodDays: 365.25, longitudeAtEpoch: 100, distanceAu: 1.0 },
  { name: "Mars", symbol: "♂", color: "#f87171", periodDays: 686.98, longitudeAtEpoch: 30, distanceAu: 1.52 },
  { name: "Jupiter", symbol: "♃", color: "#fdba74", periodDays: 4332.6, longitudeAtEpoch: 90, distanceAu: 5.2 },
  { name: "Saturn", symbol: "♄", color: "#fde68a", periodDays: 10759, longitudeAtEpoch: 320, distanceAu: 9.58 },
  { name: "Uranus", symbol: "♅", color: "#67e8f9", periodDays: 30687, longitudeAtEpoch: 200, distanceAu: 19.2 },
  { name: "Neptune", symbol: "♆", color: "#60a5fa", periodDays: 60190, longitudeAtEpoch: 280, distanceAu: 30.05 },
];

const J2000 = Date.UTC(2000, 0, 1, 12);

export function planetStates(at: Date = new Date()): PlanetState[] {
  const days = (at.getTime() - J2000) / 86_400_000;
  return PLANETS.map((p) => {
    const meanMotion = 360 / p.periodDays;
    const lon = ((p.longitudeAtEpoch + meanMotion * days) % 360 + 360) % 360;
    return {
      name: p.name,
      symbol: p.symbol,
      color: p.color,
      longitude: lon,
      distanceAu: p.distanceAu,
    };
  });
}

export function alignmentScore(planets: PlanetState[]): number {
  const longs = planets.map((p) => p.longitude).sort((a, b) => a - b);
  let best = 360;
  const n = longs.length;
  for (let i = 0; i < n; i++) {
    const ordered = [...longs.slice(i), ...longs.slice(0, i)];
    const s = (ordered[n - 1] - ordered[0] + 360) % 360;
    best = Math.min(best, s || 360);
  }
  return best;
}

export function alignmentLabel(scoreDeg: number): string {
  if (scoreDeg < 30) return "TIGHT ALIGNMENT";
  if (scoreDeg < 60) return "NOTABLE CLUSTER";
  if (scoreDeg < 120) return "PARTIAL GROUPING";
  return "SPREAD";
}
