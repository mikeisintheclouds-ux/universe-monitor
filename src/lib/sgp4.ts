/**
 * Client-safe SGP4 helpers via satellite.js
 */

export type Lla = {
  latitude: number;
  longitude: number;
  altitudeKm: number;
};

export type GroundPoint = { lat: number; lon: number; t: number };

export async function propagateTle(
  line1: string,
  line2: string,
  when: Date = new Date()
): Promise<Lla | null> {
  try {
    const sat = await import("satellite.js");
    const satrec = sat.twoline2satrec(line1, line2);
    const pv = sat.propagate(satrec, when);
    if (!pv.position || typeof pv.position === "boolean") return null;
    const gmst = sat.gstime(when);
    const gd = sat.eciToGeodetic(pv.position as any, gmst);
    return {
      latitude: sat.degreesLat(gd.latitude),
      longitude: sat.degreesLong(gd.longitude),
      altitudeKm: gd.height,
    };
  } catch {
    return null;
  }
}

export async function groundTrack(
  line1: string,
  line2: string,
  hours = 1.5,
  stepMin = 2
): Promise<GroundPoint[]> {
  try {
    const sat = await import("satellite.js");
    const satrec = sat.twoline2satrec(line1, line2);
    const out: GroundPoint[] = [];
    const start = Date.now();
    const steps = Math.ceil((hours * 60) / stepMin);
    for (let i = 0; i <= steps; i++) {
      const when = new Date(start + i * stepMin * 60_000);
      const pv = sat.propagate(satrec, when);
      if (!pv.position || typeof pv.position === "boolean") continue;
      const gmst = sat.gstime(when);
      const gd = sat.eciToGeodetic(pv.position as any, gmst);
      out.push({
        lat: sat.degreesLat(gd.latitude),
        lon: sat.degreesLong(gd.longitude),
        t: when.getTime(),
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function nextPasses(
  line1: string,
  line2: string,
  observerLat: number,
  observerLon: number,
  options?: { hoursAhead?: number; minEl?: number; maxPasses?: number }
): Promise<
  {
    start: Date;
    max: Date;
    end: Date;
    maxElevationDeg: number;
  }[]
> {
  const hoursAhead = options?.hoursAhead ?? 24;
  const minEl = options?.minEl ?? 10;
  const maxPasses = options?.maxPasses ?? 4;

  try {
    const sat = await import("satellite.js");
    const satrec = sat.twoline2satrec(line1, line2);
    const observerGd = {
      latitude: sat.degreesToRadians(observerLat),
      longitude: sat.degreesToRadians(observerLon),
      height: 0.05,
    };

    const results: {
      start: Date;
      max: Date;
      end: Date;
      maxElevationDeg: number;
    }[] = [];

    let inPass = false;
    let passStart: Date | null = null;
    let maxEl = -90;
    let maxAt: Date | null = null;
    let lastEl = -90;

    const startMs = Date.now();
    const endMs = startMs + hoursAhead * 3600_000;

    for (let t = startMs; t <= endMs; t += 60_000) {
      const when = new Date(t);
      const pv = sat.propagate(satrec, when);
      if (!pv.position || typeof pv.position === "boolean") continue;
      const gmst = sat.gstime(when);
      const ecf = sat.eciToEcf(pv.position as any, gmst);
      const look = sat.ecfToLookAngles(observerGd, ecf);
      const el = sat.radiansToDegrees(look.elevation);

      if (el >= minEl) {
        if (!inPass) {
          inPass = true;
          passStart = when;
          maxEl = el;
          maxAt = when;
        } else if (el > maxEl) {
          maxEl = el;
          maxAt = when;
        }
      } else if (inPass && lastEl >= minEl) {
        inPass = false;
        if (passStart && maxAt) {
          results.push({
            start: passStart,
            max: maxAt,
            end: when,
            maxElevationDeg: maxEl,
          });
          if (results.length >= maxPasses) break;
        }
        passStart = null;
        maxEl = -90;
        maxAt = null;
      }
      lastEl = el;
    }

    return results;
  } catch {
    return [];
  }
}
