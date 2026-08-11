"use client";

import { useEffect, useState } from "react";
import { groundTrack, propagateTle } from "@/lib/sgp4";

type Props = {
  name: string;
  line1: string;
  line2: string;
};

export function OrbitPanel({ name, line1, line2 }: Props) {
  const [lla, setLla] = useState<{
    latitude: number;
    longitude: number;
    altitudeKm: number;
  } | null>(null);
  const [trackLen, setTrackLen] = useState(0);
  const [status, setStatus] = useState("SGP4 init…");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function tick() {
      const pos = await propagateTle(line1, line2, new Date());
      if (cancelled) return;
      if (pos) {
        setLla(pos);
        setStatus("SGP4 live · 15s refresh");
      } else {
        setStatus("Propagation failed");
      }
    }

    async function track() {
      const pts = await groundTrack(line1, line2, 1.5, 3);
      if (!cancelled) setTrackLen(pts.length);
    }

    tick();
    track();
    timer = setInterval(tick, 15_000);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [line1, line2]);

  return (
    <section className="panel">
      <h2>SGP4 propagator</h2>
      <div className="row">
        <div>
          <div className="name">{name}</div>
          <div className="meta">{status}</div>
        </div>
        <span className="badge ok">SGP4</span>
      </div>
      {lla && (
        <div className="row">
          <div>
            <div className="name">
              {lla.latitude.toFixed(2)}°, {lla.longitude.toFixed(2)}°
            </div>
            <div className="meta">
              Alt {Math.round(lla.altitudeKm)} km · ground track samples{" "}
              {trackLen}
            </div>
          </div>
        </div>
      )}
      <p className="meta" style={{ marginTop: "0.6rem", lineHeight: 1.4 }}>
        Two-line elements propagated with satellite.js (SGP4/SDP4). Positions
        are model estimates — not radar truth.
      </p>
    </section>
  );
}
