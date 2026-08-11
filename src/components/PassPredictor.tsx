"use client";

import { useEffect, useState } from "react";
import type { Observer } from "@/lib/types";
import { nextPasses } from "@/lib/sgp4";

type Pass = {
  start: string;
  max: string;
  end: string;
  maxElevationDeg: number;
  durationMin: number;
};

export function PassPredictor({
  observer,
  issTle,
}: {
  observer: Observer;
  issTle: { name: string; line1: string; line2: string } | null | undefined;
}) {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [status, setStatus] = useState("Computing passes…");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!issTle?.line1 || !issTle?.line2) {
        setStatus("ISS TLE unavailable — Celestrak CATNR 25544");
        return;
      }
      setStatus("Propagating ISS (SGP4)…");
      const raw = await nextPasses(
        issTle.line1,
        issTle.line2,
        observer.latitude,
        observer.longitude,
        { hoursAhead: 36, minEl: 10, maxPasses: 4 }
      );
      if (cancelled) return;
      if (raw.length === 0) {
        setStatus("No passes above 10° elevation in the next 36 hours");
        setPasses([]);
        return;
      }
      setPasses(
        raw.map((p) => ({
          start: p.start.toISOString(),
          max: p.max.toISOString(),
          end: p.end.toISOString(),
          maxElevationDeg: Math.round(p.maxElevationDeg * 10) / 10,
          durationMin: Math.round(
            (p.end.getTime() - p.start.getTime()) / 60_000
          ),
        }))
      );
      setStatus(`${raw.length} visible pass(es) · min elevation 10°`);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [observer, issTle]);

  return (
    <section className="panel">
      <h2>ISS pass windows</h2>
      <div className="meta" style={{ marginBottom: "0.75rem" }}>
        {observer.label} · {observer.latitude.toFixed(3)}°,{" "}
        {observer.longitude.toFixed(3)}°
        <br />
        {status}
      </div>
      {passes.map((p) => (
        <div className="row" key={p.start}>
          <div>
            <div className="name">
              Max elev {p.maxElevationDeg}° · {p.durationMin} min
            </div>
            <div className="meta">
              Rise {new Date(p.start).toLocaleString()}
              <br />
              Culmination {new Date(p.max).toLocaleString()}
            </div>
          </div>
          <span className="badge ok">VIS</span>
        </div>
      ))}
    </section>
  );
}
