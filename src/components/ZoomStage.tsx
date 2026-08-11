"use client";

import { useMemo, useState } from "react";
import type { IssState, Observer, PlanetState, ZoomLevel } from "@/lib/types";
import { alignmentScore } from "@/lib/astro";
import { EarthMap } from "@/components/EarthMap";
import { Solar3D } from "@/components/Solar3D";

const LEVELS: ZoomLevel[] = ["universe", "galaxy", "solar", "earth", "surface"];

const LABELS: Record<ZoomLevel, string> = {
  universe: "Observable Universe",
  galaxy: "Milky Way",
  solar: "Solar System",
  earth: "Earth Orbit",
  surface: "Surface Lock",
};

export function ZoomStage({
  planets,
  iss,
  observer,
}: {
  planets: PlanetState[];
  iss: IssState | null;
  observer: Observer;
}) {
  const [zoom, setZoom] = useState<ZoomLevel>("solar");
  const score = useMemo(() => alignmentScore(planets), [planets]);

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <h1>Universe Monitor</h1>
          <span className="sub">Space situational awareness · scale navigation</span>
        </div>
        <div className="zoom-rail">
          {LEVELS.map((z) => (
            <button
              key={z}
              type="button"
              className={`zoom-btn${zoom === z ? " active" : ""}`}
              onClick={() => setZoom(z)}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      <div className="stage">
        <div className="stage-label">{LABELS[zoom]}</div>
        <div className="canvas-wrap">
          {zoom === "universe" && <UniverseView />}
          {zoom === "galaxy" && <GalaxyView />}
          {zoom === "solar" && <Solar3D planets={planets} />}
          {zoom === "earth" && <EarthMap iss={iss} observer={observer} />}
          {zoom === "surface" && <SurfaceView observer={observer} />}
        </div>
      </div>
    </>
  );
}

function UniverseView() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="voidG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#03040a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#voidG)" />
      {Array.from({ length: 80 }).map((_, i) => (
        <circle
          key={i}
          cx={(i * 97) % 800}
          cy={(i * 53) % 400}
          r={i % 7 === 0 ? 1.8 : 0.7}
          fill="#fff"
          opacity={0.2 + (i % 5) * 0.12}
        />
      ))}
      <circle cx="400" cy="200" r="40" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
      <circle cx="400" cy="200" r="90" fill="none" stroke="#22d3ee" strokeWidth="0.6" opacity="0.35" />
      <circle cx="400" cy="200" r="150" fill="none" stroke="#6366f1" strokeWidth="0.4" opacity="0.25" />
      <text x="400" y="205" textAnchor="middle" fill="#e8eefc" fontSize="11" opacity="0.8">
        ~93 billion light-years across
      </text>
    </svg>
  );
}

function GalaxyView() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
      <ellipse cx="400" cy="200" rx="280" ry="90" fill="none" stroke="#a78bfa" strokeWidth="1.2" opacity="0.4" />
      <ellipse cx="400" cy="200" rx="200" ry="60" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.35" />
      <ellipse cx="400" cy="200" rx="120" ry="35" fill="none" stroke="#e8eefc" strokeWidth="0.5" opacity="0.3" />
      <circle cx="400" cy="200" r="12" fill="#fbbf24" opacity="0.9" />
      <circle cx="520" cy="185" r="4" fill="#38bdf8" />
      <text x="530" y="188" fill="#7b8bb0" fontSize="10">Sol</text>
      <text x="400" y="320" textAnchor="middle" fill="#7b8bb0" fontSize="11">
        Milky Way · Orion Arm · ~26,000 ly from core
      </text>
    </svg>
  );
}

function SurfaceView({ observer }: { observer: Observer }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#22d3ee", marginBottom: "0.75rem" }}>
        SURFACE LOCK
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{observer.label}</div>
      <div style={{ color: "#7b8bb0", marginTop: "0.5rem", fontSize: "0.95rem" }}>
        {observer.latitude.toFixed(4)}°, {observer.longitude.toFixed(4)}°
      </div>
      <div style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#7b8bb0", maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
        Observable universe → galactic arm → solar ecliptic → Earth orbit → this coordinate.
      </div>
      <a
        href={`https://www.google.com/maps/@${observer.latitude},${observer.longitude},12z`}
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-block", marginTop: "1.25rem", color: "#22d3ee", fontSize: "0.85rem" }}
      >
        Open in maps →
      </a>
    </div>
  );
}
