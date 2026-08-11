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

/** Upcoming Earth approaches within dist-max (default 10 LD), next N days */
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

/** Sentry summary table — objects with non-zero impact solutions */
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

/** PHA-only close approaches (catalog classification + close geometry) */
export async function fetchPhaApproaches(options?: {
  days?: number;
  limit?: number;
}): Promise<CadApproach[]> {
  const days = options?.days ?? 90;
  const limit = options?.limit ?? 10;
  try {
    const url =
      `https://ssd-api.jpl.nasa.gov/cad.api?` +
      `pha=true&dist-max=0.05&date-min=now&date-max=%2B${days}&sort=date&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`CAD PHA ${res.status}`);
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

export type ScoutObject = {
  objectName: string;
  H: number | null;
  neoScore: number | null;
  phaScore: number | null;
  rating: number | null;
  moid: number | null;
  caDist: number | null;
  arc: number | null;
  nObs: number | null;
  lastRun: string;
  Vmag: string | null;
};

/** NEOCP / day-zero hazard assessment from CNEOS Scout */
export async function fetchScoutList(limit = 12): Promise<ScoutObject[]> {
  try {
    const res = await fetch("https://ssd-api.jpl.nasa.gov/scout.api", {
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`Scout ${res.status}`);
    const json = await res.json();
    const rows: any[] = Array.isArray(json.data) ? json.data : [];
    return rows.slice(0, limit).map((r) => ({
      objectName: String(r.objectName ?? r.des ?? ""),
      H: r.H != null ? Number(r.H) : null,
      neoScore: r.neoScore != null ? Number(r.neoScore) : null,
      phaScore: r.phaScore != null ? Number(r.phaScore) : null,
      rating: r.rating != null ? Number(r.rating) : null,
      moid: r.moid != null ? Number(r.moid) : null,
      caDist: r.caDist != null ? Number(r.caDist) : null,
      arc: r.arc != null ? Number(r.arc) : null,
      nObs: r.nObs != null ? Number(r.nObs) : null,
      lastRun: String(r.lastRun ?? ""),
      Vmag: r.Vmag != null ? String(r.Vmag) : null,
    }));
  } catch {
    return [];
  }
}

export type SbdbSummary = {
  des: string;
  fullname: string;
  neo: boolean;
  pha: boolean;
  orbitClass: string;
  moidAu: number | null;
  H: number | null;
  conditionCode: string | null;
};

/** Small-Body Database lookup by designation */
export async function fetchSbdb(des: string): Promise<SbdbSummary | null> {
  if (!des?.trim()) return null;
  try {
    const q = encodeURIComponent(des.trim());
    const res = await fetch(
      `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${q}&neo=1`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code || json.message) return null;
    const obj = json.object ?? {};
    const orbit = json.orbit ?? {};
    const phys = json.phys_par ?? [];
    let H: number | null = null;
    if (Array.isArray(phys)) {
      const hRow = phys.find((p: any) => p.name === "H");
      if (hRow?.value != null) H = Number(hRow.value);
    }
    return {
      des: String(obj.des ?? des),
      fullname: String(obj.fullname ?? obj.shortname ?? obj.des ?? des),
      neo: Boolean(obj.neo),
      pha: Boolean(obj.pha),
      orbitClass: String(obj.orbit_class?.name ?? obj.orbit_class?.code ?? "—"),
      moidAu: orbit.moid != null ? Number(orbit.moid) : null,
      H,
      conditionCode:
        orbit.condition_code != null ? String(orbit.condition_code) : null,
    };
  } catch {
    return null;
  }
}

export { AU_KM, LD_KM, auToLd };
