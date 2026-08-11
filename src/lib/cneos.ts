/**
 * JPL SSD / CNEOS — authoritative NEO close approaches + Sentry impact risk
 * Base: https://ssd-api.jpl.nasa.gov/
 * Keyless. One request at a time. Check signature.version.
 */

const AU_KM = 149_597_870.7;
const LD_KM = 384_400;

export type CadApproach = {
  des: string;
  cd: string;
  distAu: number;
  distMinAu: number;
  distLd: number;
  vRelKms: number;
  h: number;
  orbitId: string;
};

export type SentryObject = {
  des: string;
  fullname: string;
  ip: number;
  psCum: number;
  psMax: number;
  tsMax: number;
  diameterKm: number | null;
  nImp: number;
  range: string;
  lastObs: string;
};

function auToLd(au: number): number {
  return (au * AU_KM) / LD_KM;
}

export async function fetchCadApproaches(options?: {
  days?: number;
  distMaxLd?: number;
  limit?: number;
}): Promise<CadApproach[]> {
  const days = options?.days ?? 30;
  const distMaxLd = options?.distMaxLd ?? 10;
  const limit = options?.limit ?? 12;
  try {
    const url =
      `https://ssd-api.jpl.nasa.gov/cad.api?` +
      `dist-max=${distMaxLd}LD&date-min=now&date-max=%2B${days}&sort=dist&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`CAD ${res.status}`);
    const json = await res.json();
    const fields: string[] = json.fields ?? [];
    const rows: any[][] = json.data ?? [];
    const idx = (k: string) => fields.indexOf(k);
    return rows.map((row) => {
      const distAu = Number(row[idx("dist")] ?? 0);
      return {
        des: String(row[idx("des")] ?? ""),
        cd: String(row[idx("cd")] ?? ""),
        distAu,
        distMinAu: Number(row[idx("dist_min")] ?? distAu),
        distLd: auToLd(distAu),
        vRelKms: Number(row[idx("v_rel")] ?? 0),
        h: Number(row[idx("h")] ?? 0),
        orbitId: String(row[idx("orbit_id")] ?? ""),
      };
    });
  } catch {
    return [];
  }
}

export async function fetchSentrySummary(limit = 12): Promise<SentryObject[]> {
  try {
    const res = await fetch("https://ssd-api.jpl.nasa.gov/sentry.api", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Sentry ${res.status}`);
    const json = await res.json();
    const rows: any[] = json.data ?? [];
    return rows.slice(0, limit).map((r) => ({
      des: String(r.des ?? ""),
      fullname: String(r.fullname ?? r.des ?? ""),
      ip: Number(r.ip ?? 0),
      psCum: Number(r.ps_cum ?? 0),
      psMax: Number(r.ps_max ?? 0),
      tsMax: Number(r.ts_max ?? 0),
      diameterKm: r.diameter != null ? Number(r.diameter) : null,
      nImp: Number(r.n_imp ?? 0),
      range: String(r.range ?? ""),
      lastObs: String(r.last_obs ?? ""),
    }));
  } catch {
    return [];
  }
}

export { AU_KM, LD_KM, auToLd };
