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
  CadApproach,
  SentryObject,
  ApodBrief,
  EonetEvent,
  NasaTleRecord,
  SscObservatory,
} from "@/lib/types";
import { ZoomStage } from "@/components/ZoomStage";
import { ThreatBoard } from "@/components/ThreatBoard";
import { EpicScrubber } from "@/components/EpicScrubber";
import { PassPredictor } from "@/components/PassPredictor";
import { OrbitPanel } from "@/components/OrbitPanel";
import { FieldReference } from "@/components/FieldReference";
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
  cad: CadApproach[];
  sentry: SentryObject[];
  apod: ApodBrief | null;
  eonet: EonetEvent[];
  nasaTle: NasaTleRecord | null;
  ssc: SscObservatory[];
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
  cad,
  sentry,
  apod,
  eonet,
  nasaTle,
  ssc,
  generatedAt,
}: Props) {
  const [observer, setObserver] = useState<Observer>(defaultObserver);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);

  const score = alignmentScore(planets);
  const haz = neos.filter((n) => n.hazardous).length;
  const tle =
    nasaTle && nasaTle.line1 && nasaTle.line2
      ? { name: nasaTle.name, line1: nasaTle.line1, line2: nasaTle.line2 }
      : starlink.issTle ?? starlink.sampleTle ?? null;

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

      <FieldReference />

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
            {starlink.count ?? "—"}
          </div>
        </div>
        <div className="stat">
          <div className="label">Alignment</div>
          <div className="value" style={{ color: "#fbbf24" }}>
            {alignmentLabel(score)}
          </div>
        </div>
      </div>

      <div className="grid-panels">
        <section className="panel">
          <h2>CNEOS CAD · next approaches</h2>
          {cad.length === 0 && <p className="meta">No CAD rows this cycle.</p>}
          {cad.map((c) => (
            <div className="row" key={`${c.des}-${c.cd}`}>
              <div>
                <div className="name">{c.des}</div>
                <div className="meta">
                  {c.cd} · {c.distLd != null ? `${c.distLd.toFixed(2)} LD` : "—"}
                  {c.vRel != null ? ` · ${c.vRel.toFixed(1)} km/s` : ""}
                  {c.h != null ? ` · H ${c.h}` : ""}
                </div>
              </div>
              <span className="badge ok">CAD</span>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Sentry · published solutions</h2>
          {sentry.length === 0 && <p className="meta">No Sentry rows this cycle.</p>}
          {sentry.map((s) => (
            <div className="row" key={s.des}>
              <div>
                <div className="name">{s.des}</div>
                <div className="meta">
                  IP {s.ip != null ? s.ip.toExponential(2) : "—"}
                  {s.psCum != null ? ` · PS ${s.psCum.toFixed(2)}` : ""}
                  {s.diameter != null ? ` · Ø ${s.diameter} km` : ""}
                  {s.range ? ` · ${s.range}` : ""}
                </div>
              </div>
              <span className="badge ok">SENTRY</span>
            </div>
          ))}
        </section>
      </div>

      <div className="grid-panels" style={{ marginTop: "1rem" }}>
        <section className="panel">
          <h2>EONET · active Earth events</h2>
          {eonet.length === 0 && (
            <p className="meta">No open events this cycle.</p>
          )}
          {eonet.map((ev) => (
            <div className="row" key={ev.id}>
              <div>
                <div className="name">{ev.title}</div>
                <div className="meta">
                  {ev.category}
                  {ev.magnitude ? ` · ${ev.magnitude}` : ""}
                  {ev.lat != null && ev.lon != null
                    ? ` · ${ev.lat.toFixed(1)}°, ${ev.lon.toFixed(1)}°`
                    : ""}
                  {ev.date ? ` · ${ev.date}` : ""}
                </div>
              </div>
              <span className="badge ok">{ev.source}</span>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>SSC · heliophysics observatories</h2>
          <div className="meta" style={{ marginBottom: "0.6rem" }}>
            NASA Satellite Situation Center catalog (sample)
          </div>
          {ssc.length === 0 && <p className="meta">SSC catalog unavailable.</p>}
          {ssc.map((o) => (
            <div className="row" key={o.id}>
              <div>
                <div className="name">{o.name}</div>
                <div className="meta">
                  id {o.id}
                  {o.resolutionSec ? ` · res ${o.resolutionSec}s` : ""}
                </div>
              </div>
              <span className="badge ok">SSC</span>
            </div>
          ))}
        </section>
      </div>

      {apod && (
        <section className="panel" style={{ marginTop: "1rem" }}>
          <h2>APOD · daily briefing</h2>
          <div className="epic-hero">
            {apod.mediaType === "image" && apod.url ? (
              <div>
                <img src={apod.url} alt={apod.title} loading="lazy" />
              </div>
            ) : (
              <div className="meta">Media: {apod.mediaType}</div>
            )}
            <div>
              <div className="name" style={{ marginBottom: "0.4rem" }}>
                {apod.title}
              </div>
              <div className="meta">
                {apod.date}
                {apod.copyright ? ` · ${apod.copyright}` : ""}
              </div>
              <p className="meta" style={{ marginTop: "0.6rem", lineHeight: 1.45 }}>
                {apod.explanation}
              </p>
            </div>
          </div>
        </section>
      )}

      {nasaTle && (
        <section className="panel" style={{ marginTop: "1rem" }}>
          <h2>NASA TLE API · ISS elements</h2>
          <div className="row">
            <div>
              <div className="name">{nasaTle.name}</div>
              <div className="meta">
                NORAD {nasaTle.satelliteId} · epoch {nasaTle.date}
                <br />
                {nasaTle.source}
              </div>
            </div>
            <span className="badge ok">TLE</span>
          </div>
        </section>
      )}

      <div className="grid-panels" style={{ marginTop: "1rem" }}>
        <section className="panel">
          <h2>Near-Earth objects</h2>
          {neos.slice(0, 8).map((n) => (
            <div className="row" key={n.id}>
              <div>
                <div className="name">{n.name}</div>
                <div className="meta">
                  {n.closeApproachDate ?? "—"}
                  {n.missDistanceKm != null
                    ? ` · ${formatKm(n.missDistanceKm)}`
                    : ""}
                </div>
              </div>
              <span className={`badge ${n.hazardous ? "danger" : "ok"}`}>
                {n.hazardous ? "HAZ" : "NEO"}
              </span>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Space weather · DONKI</h2>
          {weather.length === 0 && <p className="meta">Quiet this cycle.</p>}
          {weather.slice(0, 8).map((w, i) => (
            <div className="row" key={`${w.type}-${i}`}>
              <div>
                <div className="name">{w.type}</div>
                <div className="meta">{w.startTime ?? w.message ?? "—"}</div>
              </div>
              <span className="badge ok">DONKI</span>
            </div>
          ))}
        </section>
      </div>

      <div className="grid-panels" style={{ marginTop: "1rem" }}>
        <EpicScrubber epic={epic} />
        <PassPredictor iss={iss} observer={observer} />
      </div>

      <div className="grid-panels" style={{ marginTop: "1rem" }}>
        <OrbitPanel tle={tle} />
        <section className="panel">
          <h2>Observer lock</h2>
          <div className="row">
            <div>
              <div className="name">Active observer</div>
              <div className="meta">{observer.label}</div>
            </div>
            <span className="badge ok">LOCKED</span>
          </div>
        </section>
      </div>

      <footer className="footer">
        Universe Monitor · space situational awareness
        <br />
        CNEOS · NeoWs · EPIC · DONKI · EONET · APOD · TLE · SSC · GIBS · Starlink · SGP4
        <br />
        Snapshot {new Date(generatedAt).toLocaleString()} ·{" "}
        <a href="https://github.com/mikeisintheclouds-ux/universe-monitor">
          source
        </a>
      </footer>
    </>
  );
}
