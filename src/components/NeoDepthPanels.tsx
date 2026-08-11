"use client";

import { useState } from "react";
import type { CadApproach, ScoutObject } from "@/lib/types";

type SbdbResult = {
  des: string;
  fullname: string;
  neo: boolean;
  pha: boolean;
  orbitClass: string;
  moidAu: number | null;
  H: number | null;
  conditionCode: string | null;
};

type Props = {
  cad: CadApproach[];
  phaCad: CadApproach[];
  scout: ScoutObject[];
};

export function NeoDepthPanels({ cad, phaCad, scout }: Props) {
  const [lookup, setLookup] = useState("");
  const [sbdb, setSbdb] = useState<SbdbResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runLookup(des: string) {
    const q = des.trim();
    if (!q) return;
    setBusy(true);
    setStatus("Querying SBDB…");
    setSbdb(null);
    try {
      const res = await fetch(`/api/sbdb?des=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setStatus(res.status === 404 ? "Object not found in SBDB." : "SBDB error.");
        setBusy(false);
        return;
      }
      const data = (await res.json()) as SbdbResult;
      setSbdb(data);
      setStatus(null);
    } catch {
      setStatus("SBDB request failed.");
    }
    setBusy(false);
  }

  return (
    <>
      <div className="grid-panels" style={{ marginTop: "1rem" }}>
        <section className="panel">
          <h2>CNEOS CAD · ≤10 LD</h2>
          {cad.length === 0 && <p className="meta">No CAD rows this cycle.</p>}
          {cad.map((c) => (
            <div className="row" key={`cad-${c.des}-${c.cd}`}>
              <div>
                <button
                  type="button"
                  className="name linkish"
                  onClick={() => {
                    setLookup(c.des);
                    void runLookup(c.des);
                  }}
                >
                  {c.des}
                </button>
                <div className="meta">
                  {c.cd} · {c.distLd.toFixed(2)} LD
                  {c.vRelKms ? ` · ${c.vRelKms.toFixed(1)} km/s` : ""}
                  {c.h ? ` · H ${c.h}` : ""}
                </div>
              </div>
              <span className="badge ok">CAD</span>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>PHA approaches · 90d</h2>
          <div className="meta" style={{ marginBottom: "0.55rem" }}>
            Catalog PHA flag · geometry only — not impact forecast
          </div>
          {phaCad.length === 0 && (
            <p className="meta">No PHA approaches in window.</p>
          )}
          {phaCad.map((c) => (
            <div className="row" key={`pha-${c.des}-${c.cd}`}>
              <div>
                <button
                  type="button"
                  className="name linkish"
                  onClick={() => {
                    setLookup(c.des);
                    void runLookup(c.des);
                  }}
                >
                  {c.des}
                </button>
                <div className="meta">
                  {c.cd} · {c.distLd.toFixed(2)} LD
                  {c.h ? ` · H ${c.h}` : ""}
                </div>
              </div>
              <span className="badge haz">PHA</span>
            </div>
          ))}
        </section>
      </div>

      <div className="grid-panels" style={{ marginTop: "1rem" }}>
        <section className="panel">
          <h2>Scout · NEOCP day-zero</h2>
          <div className="meta" style={{ marginBottom: "0.55rem" }}>
            Unconfirmed / early arc objects · neoScore / phaScore are Scout
            diagnostics, not final risk
          </div>
          {scout.length === 0 && <p className="meta">Scout quiet this cycle.</p>}
          {scout.map((s) => (
            <div className="row" key={s.objectName}>
              <div>
                <div className="name">{s.objectName}</div>
                <div className="meta">
                  {s.H != null ? `H ${s.H}` : "H —"}
                  {s.neoScore != null ? ` · NEO ${s.neoScore}` : ""}
                  {s.phaScore != null ? ` · PHA ${s.phaScore}` : ""}
                  {s.moid != null ? ` · MOID ${s.moid}` : ""}
                  {s.nObs != null ? ` · n=${s.nObs}` : ""}
                  {s.lastRun ? ` · ${s.lastRun}` : ""}
                </div>
              </div>
              <span
                className={`badge ${
                  (s.rating ?? 0) >= 2 || (s.phaScore ?? 0) >= 50 ? "haz" : "ok"
                }`}
              >
                {s.rating != null ? `R${s.rating}` : "SCOUT"}
              </span>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>SBDB · object lookup</h2>
          <div className="meta" style={{ marginBottom: "0.65rem" }}>
            Designation → orbit class, MOID, PHA flag (JPL Small-Body Database)
          </div>
          <div className="observer-actions" style={{ marginBottom: "0.75rem" }}>
            <input
              className="sbdb-input"
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="e.g. 2025 AL2 or Apophis"
              onKeyDown={(e) => {
                if (e.key === "Enter") void runLookup(lookup);
              }}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={busy || !lookup.trim()}
              onClick={() => void runLookup(lookup)}
            >
              {busy ? "Query…" : "Lookup"}
            </button>
          </div>
          {status && <p className="meta">{status}</p>}
          {sbdb && (
            <div>
              <div className="row">
                <div>
                  <div className="name">{sbdb.fullname}</div>
                  <div className="meta">des {sbdb.des}</div>
                </div>
                <span className={`badge ${sbdb.pha ? "haz" : "ok"}`}>
                  {sbdb.pha ? "PHA" : sbdb.neo ? "NEO" : "OBJ"}
                </span>
              </div>
              <div className="row">
                <div>
                  <div className="name">Orbit class</div>
                  <div className="meta">{sbdb.orbitClass}</div>
                </div>
              </div>
              <div className="row">
                <div>
                  <div className="name">MOID</div>
                  <div className="meta">
                    {sbdb.moidAu != null ? `${sbdb.moidAu} au` : "—"}
                  </div>
                </div>
              </div>
              <div className="row">
                <div>
                  <div className="name">Condition code</div>
                  <div className="meta">{sbdb.conditionCode ?? "—"}</div>
                </div>
              </div>
              {sbdb.H != null && (
                <div className="row">
                  <div>
                    <div className="name">H</div>
                    <div className="meta">{sbdb.H}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
