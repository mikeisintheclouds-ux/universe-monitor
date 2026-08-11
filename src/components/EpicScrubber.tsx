"use client";

import { useMemo, useState, useTransition } from "react";
import type { EpicFrame } from "@/lib/types";

function daysBackIso(n: number): string {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString().slice(0, 10);
}

export function EpicScrubber({ initial }: { initial: EpicFrame | null }) {
  const [frame, setFrame] = useState<EpicFrame | null>(initial);
  const [offset, setOffset] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dateLabel = useMemo(() => daysBackIso(offset), [offset]);

  function onScrub(days: number) {
    setOffset(days);
    startTransition(async () => {
      setError(null);
      try {
        const iso = daysBackIso(days);
        const res = await fetch(`/api/epic?date=${iso}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data?.url) {
          setError("No EPIC frames for that date");
          return;
        }
        setFrame(data as EpicFrame);
      } catch {
        setError("EPIC fetch failed (rate limit or archive gap)");
      }
    });
  }

  return (
    <section className="panel" style={{ marginBottom: "1rem" }}>
      <h2>DSCOVR EPIC · archive scrubber</h2>
      <div className="scrub-rail">
        <label className="meta">
          Days back: <strong style={{ color: "#e8eefc" }}>{offset}</strong> ·{" "}
          {dateLabel}
        </label>
        <input
          type="range"
          min={0}
          max={30}
          value={offset}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="scrub-input"
        />
        <div className="meta">
          {pending
            ? "Loading archive…"
            : error ?? "NASA EPIC natural-color archive"}
        </div>
      </div>
      {frame && (
        <div className="epic-hero" style={{ marginTop: "0.85rem" }}>
          <div>
            <img src={frame.url} alt={frame.caption} loading="lazy" />
          </div>
          <div>
            <div className="name" style={{ marginBottom: "0.5rem" }}>
              {frame.caption}
            </div>
            <div className="meta">
              Instrument: EPIC aboard DSCOVR (Earth–Sun L1)
              <br />
              Frame ID: {frame.image}
              <br />
              Observation time: {frame.date}
              <br />
              Earth centroid: {frame.lat.toFixed(2)}°, {frame.lon.toFixed(2)}°
            </div>
            <div className="row" style={{ marginTop: "0.75rem" }}>
              <div className="meta">Historical replay · natural color JPEG</div>
              <span className="badge ok">ARCHIVE</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
