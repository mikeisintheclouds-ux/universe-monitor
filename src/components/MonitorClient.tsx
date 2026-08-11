"use client";

import { useCallback, useState } from "react";
import type {
  IssState,
  Observer,
  PlanetState,
  StarlinkSummary,
  ThreatItem,
  EpicFrame,
  NeoObject,
  SpaceWeatherEvent,
} from "@/lib/types";
import { ZoomStage } from "@/components/ZoomStage";
import { ThreatBoard } from "@/components/ThreatBoard";
import { EpicScrubber } from "@/components/EpicScrubber";
import { PassPredictor } from "@/components/PassPredictor";
import { OrbitPanel } from "@/components/OrbitPanel";
import { alignmentLabel, alignmentScore } from "@/lib/astro";

function formatKm(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M km`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k km`;
  return `${Math.round(n)} km`;
}

type Props = {
  planets: PlanetState[];
  iss: IssState | null;
  defaultObserver: Observer;
  threats: ThreatItem[];
  neos: NeoObject[];
  weather: SpaceWeatherEvent[];
  starlink: StarlinkSummary;
  epic: EpicFrame | null;
  generatedAt: string;
};

export function MonitorClient({
  planets,
  iss,
  defaultObserver,
  threats,
  neos,
  weather,
  starlink,
  epic,
  generatedAt,
}: Props) {
  const [observer, setObserver] = useState<Observer>(defaultObserver);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);

  const score = alignmentScore(planets);
  const haz = neos.filter((n) => n.hazardous).length;
  const tle = starlink.issTle ?? starlink.sampleTle ?? null;

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not available in this browser.");
      return;
    }
    setGeoBusy(true);
    setGeoStatus("Requesting location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setObserver({
          latitude,
          longitude,
          label: "Local observer",
        });
        setGeoStatus(
          `Observer locked · ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`
        );
        setGeoBusy(false);
      },
      (err) => {
        setGeoStatus(
          err.code === 1
            ? "Location permission denied."
            : "Unable to resolve location."
        );
        setGeoBusy(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 }
    );
  }, []);

  const resetObserver = useCallback(() => {
    setObserver(defaultObserver);
    setGeoStatus(`Reset · ${defaultObserver.label}`);
  }, [defaultObserver]);

  return (
    <>
      <ZoomStage planets={planets} iss={iss} observer={observer} />

      <div className="observer-bar panel">
        <div>
          <div className="name">Observer</div>
          <div className="meta">
            {observer.label} · {observer.latitude.toFixed(4)}°,{" "}
            {observer.longitude.toFixed(4)}°
            {geoStatus ? (
              <>
                <br />
                {geoStatus}
              </>
            ) : null}
          </div>
        </div>
        <div className="observer-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={useMyLocation}
            disabled={geoBusy}
          >
            {geoBusy ? "Locating…" : "Use my location"}
          </button>
          <button type="button" className="btn-ghost" onClick={resetObserver}>
            Reset default
          </button>
        </div>
      </div>

      <ThreatBoard items={threats} />

      <div className="stat-strip">
        <div className="stat">
          <div className="label">NEOs today</div>
          <div className="value" style={{ color: "#22d3ee" }}>
            {neos.length}
          </div>
        </div>
        <div className="stat">
          <div className="label">Hazardous</div>
          <div className="value" style={{ color: haz ? "#f43f5e" : "#34d399" }}>
            {haz}
          </div>
        </div>
        <div className="stat">
          <div className="label">Starlink catalog</div>
          <div className="value" style={{ color: "#a78bfa" }}>
            {starlink.catalogCount.toLocaleString()}
          </div>
        </div>
        <div className="stat">
          <div className="label">ISS altitude</div>
          <div className="value" style={{ color: "#fbbf24" }}>
            {iss ? `${Math.round(iss.altitudeKm)} km` : "—"}
          </div>
        </div>
      </div>

      <EpicScrubber initial={epic} />

      <div className="grid-panels">
        <PassPredictor observer={observer} issTle={starlink.issTle} />
        {tle ? (
          <OrbitPanel name={tle.name} line1={tle.line1} line2={tle.line2} />
        ) : (
          <section className="panel">
            <h2>SGP4 propagator</h2>
            <p className="meta">TLE unavailable from Celestrak this cycle.</p>
          </section>
        )}
      </div>

      <div className="grid-panels" style={{ marginTop: "1rem" }}>
        <section className="panel">
          <h2>Near-Earth objects</h2>
          {neos.map((n) => (
            <div className="row" key={n.id}>
              <div>
                <div className="name">{n.name}</div>
                <div className="meta">
                  Ø {n.diameterKm} km · miss {formatKm(n.missKm)} ·{" "}
                  {Math.round(n.velocityKph).toLocaleString()} km/h
                </div>
              </div>
              <span className={`badge ${n.hazardous ? "haz" : "ok"}`}>
                {n.hazardous ? "PHA" : "CLEAR"}
              </span>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Planetary ecliptic · {alignmentLabel(score)}</h2>
          {planets.map((p) => (
            <div className="row" key={p.name}>
              <div>
                <div className="name">
                  <span style={{ color: p.color, marginRight: 6 }}>
                    {p.symbol}
                  </span>
                  {p.name}
                </div>
                <div className="meta">{p.distanceAu} AU from Sun</div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#7b8bb0" }}>
                λ {p.longitude.toFixed(1)}°
              </span>
            </div>
          ))}
        </section>
      </div>

      <div className="grid-panels" style={{ marginTop: "1rem" }}>
        <section className="panel">
          <h2>Starlink constellation · TLE</h2>
          <div className="row">
            <div>
              <div className="name">
                {starlink.catalogCount.toLocaleString()} objects in catalog
              </div>
              <div className="meta">{starlink.source}</div>
            </div>
            <span className="badge ok">TLE</span>
          </div>
          {starlink.sampleNames.map((n) => (
            <div className="row" key={n}>
              <div
                className="name"
                style={{ fontWeight: 500, fontSize: "0.82rem" }}
              >
                {n}
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>DONKI · space weather</h2>
          {weather.length === 0 && (
            <p style={{ color: "#7b8bb0", fontSize: "0.85rem" }}>
              No recent notifications for this window.
            </p>
          )}
          {weather.map((w) => (
            <div className="row" key={w.id}>
              <div>
                <div className="name">{w.type}</div>
                <div className="meta">
                  {w.startTime}
                  {w.note ? ` · ${w.note}` : ""}
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2>ISS · live track</h2>
        {iss ? (
          <div className="row">
            <div>
              <div className="name">International Space Station</div>
              <div className="meta">
                {iss.latitude.toFixed(2)}°, {iss.longitude.toFixed(2)}° ·{" "}
                {Math.round(iss.velocityKph).toLocaleString()} km/h
              </div>
            </div>
            <span className="badge ok">ON ORBIT</span>
          </div>
        ) : (
          <p style={{ color: "#7b8bb0" }}>ISS feed unavailable</p>
        )}
        <div className="row">
          <div>
            <div className="name">Active observer</div>
            <div className="meta">{observer.label}</div>
          </div>
          <span className="badge ok">LOCKED</span>
        </div>
      </section>

      <footer className="footer">
        Universe Monitor · space situational awareness
        <br />
        NASA NeoWs · EPIC · DONKI · GIBS · ISS · Celestrak TLE · SGP4
        <br />
        Snapshot {new Date(generatedAt).toLocaleString()} ·{" "}
        <a href="https://github.com/mikeisintheclouds-ux/universe-monitor">
          source
        </a>
      </footer>
    </>
  );
}
