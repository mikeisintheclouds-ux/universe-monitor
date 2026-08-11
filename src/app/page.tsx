import { getUniverseSnapshot, formatKm } from "@/lib/data";
import { alignmentLabel, alignmentScore } from "@/lib/astro";
import { ZoomStage } from "@/components/ZoomStage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const snap = await getUniverseSnapshot();
  const score = alignmentScore(snap.planets);
  const haz = snap.neos.filter((n) => n.hazardous).length;

  return (
    <div className="shell">
      <ZoomStage
        planets={snap.planets}
        iss={snap.iss}
        observer={snap.observer}
      />

      <div className="stat-strip">
        <div className="stat">
          <div className="label">NEOs today</div>
          <div className="value" style={{ color: "#22d3ee" }}>
            {snap.neos.length}
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
            {snap.starlink.catalogCount.toLocaleString()}
          </div>
        </div>
        <div className="stat">
          <div className="label">ISS altitude</div>
          <div className="value" style={{ color: "#fbbf24" }}>
            {snap.iss ? `${Math.round(snap.iss.altitudeKm)} km` : "\u2014"}
          </div>
        </div>
      </div>

      {snap.epic && (
        <section className="panel" style={{ marginBottom: "1rem" }}>
          <h2>DSCOVR EPIC \u00b7 satellite camera \u00b7 Earth from L1</h2>
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "minmax(0, 280px) minmax(0, 1fr)",
            }}
          >
            <div>
              <img
                src={snap.epic.url}
                alt={snap.epic.caption}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid rgba(99,140,255,0.25)",
                }}
              />
            </div>
            <div>
              <div className="name" style={{ marginBottom: "0.5rem" }}>
                {snap.epic.caption}
              </div>
              <div className="meta">
                Frame {snap.epic.image}
                <br />
                {snap.epic.date}
                <br />
                Centroid {snap.epic.lat.toFixed(2)}\u00b0, {snap.epic.lon.toFixed(2)}\u00b0
              </div>
              <p
                style={{
                  marginTop: "0.85rem",
                  fontSize: "0.8rem",
                  color: "#7b8bb0",
                  lineHeight: 1.45,
                }}
              >
                Real camera on DSCOVR at the Earth\u2013Sun Lagrange point \u2014 full-disk
                Earth, not a render. Parent signal for the World Monitor chain.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="grid-panels">
        <section className="panel">
          <h2>Near-Earth Objects \u00b7 meteors & asteroids</h2>
          {snap.neos.map((n) => (
            <div className="row" key={n.id}>
              <div>
                <div className="name">{n.name}</div>
                <div className="meta">
                  \u00d8 {n.diameterKm} km \u00b7 miss {formatKm(n.missKm)} \u00b7{" "}
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
          <h2>Planetary ecliptic \u00b7 alignment \u00b7 {alignmentLabel(score)}</h2>
          {snap.planets.map((p) => (
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
                \u03bb {p.longitude.toFixed(1)}\u00b0
              </span>
            </div>
          ))}
        </section>
      </div>

      <div className="grid-panels" style={{ marginTop: "1rem" }}>
        <section className="panel">
          <h2>Starlink constellation \u00b7 TLE track</h2>
          <div className="row">
            <div>
              <div className="name">
                {snap.starlink.catalogCount.toLocaleString()} objects in catalog
              </div>
              <div className="meta">{snap.starlink.source}</div>
            </div>
            <span className="badge ok">TLE</span>
          </div>
          {snap.starlink.sampleNames.map((n) => (
            <div className="row" key={n}>
              <div
                className="name"
                style={{ fontWeight: 500, fontSize: "0.82rem" }}
              >
                {n}
              </div>
            </div>
          ))}
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.75rem",
              color: "#7b8bb0",
              lineHeight: 1.4,
            }}
          >
            Starlink has no public optical camera API. Public data is orbital
            elements (TLE) \u2014 we track the swarm, not customer downlinks.
          </p>
        </section>

        <section className="panel">
          <h2>DONKI \u00b7 space weather</h2>
          {snap.weather.length === 0 && (
            <p style={{ color: "#7b8bb0", fontSize: "0.85rem" }}>
              No recent notifications (or DEMO_KEY limit).
            </p>
          )}
          {snap.weather.map((w) => (
            <div className="row" key={w.id}>
              <div>
                <div className="name">{w.type}</div>
                <div className="meta">
                  {w.startTime}
                  {w.note ? ` \u00b7 ${w.note}` : ""}
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2>ISS \u00b7 live track</h2>
        {snap.iss ? (
          <div className="row">
            <div>
              <div className="name">International Space Station</div>
              <div className="meta">
                {snap.iss.latitude.toFixed(2)}\u00b0, {snap.iss.longitude.toFixed(2)}
                \u00b0 \u00b7 {Math.round(snap.iss.velocityKph).toLocaleString()} km/h
              </div>
            </div>
            <span className="badge ok">ON ORBIT</span>
          </div>
        ) : (
          <p style={{ color: "#7b8bb0" }}>ISS feed unavailable</p>
        )}
        <div className="row">
          <div>
            <div className="name">Observer</div>
            <div className="meta">{snap.observer.label}</div>
          </div>
          <span className="badge ok">LOCKED</span>
        </div>
      </section>

      <footer className="footer">
        Universe Monitor \u00b7 parent link to World Monitor
        <br />
        Feeds: NASA NeoWs \u00b7 EPIC \u00b7 DONKI \u00b7 ISS \u00b7 Celestrak Starlink
        <br />
        <span style={{ color: "#a78bfa" }}>{snap.loadedBy}</span>
        <br />
        Snapshot {new Date(snap.generatedAt).toLocaleString()} \u00b7{" "}
        <a href="https://github.com/mikeisintheclouds-ux/universe-monitor">
          source
        </a>
      </footer>
    </div>
  );
}
