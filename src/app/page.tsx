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
          <div className="label">Alignment</div>
          <div className="value" style={{ color: "#a78bfa", fontSize: "1rem" }}>
            {alignmentLabel(score)}
          </div>
        </div>
        <div className="stat">
          <div className="label">ISS altitude</div>
          <div className="value" style={{ color: "#fbbf24" }}>
            {snap.iss ? `${Math.round(snap.iss.altitudeKm)} km` : "—"}
          </div>
        </div>
      </div>

      <div className="grid-panels">
        <section className="panel">
          <h2>Near-Earth Objects · meteors &amp; asteroids</h2>
          {snap.neos.map((n) => (
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
          <h2>Planetary ecliptic · alignment</h2>
          {snap.planets.map((p) => (
            <div className="row" key={p.name}>
              <div>
                <div className="name">
                  <span style={{ color: p.color, marginRight: 6 }}>{p.symbol}</span>
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

      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2>ISS · live track</h2>
        {snap.iss ? (
          <div className="row">
            <div>
              <div className="name">International Space Station</div>
              <div className="meta">
                {snap.iss.latitude.toFixed(2)}°, {snap.iss.longitude.toFixed(2)}° ·{" "}
                {Math.round(snap.iss.velocityKph).toLocaleString()} km/h
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
        Universe Monitor · NASA NeoWs + ISS telemetry ·{" "}
        <a href="https://github.com/mikeisintheclouds-ux/universe-monitor">source</a>
        <br />
        Snapshot {new Date(snap.generatedAt).toLocaleString()}
      </footer>
    </div>
  );
}
