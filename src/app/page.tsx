import { getUniverseSnapshot } from "@/lib/data";
import { MonitorClient } from "@/components/MonitorClient";

export const revalidate = 1800;

export default async function HomePage() {
  const snap = await getUniverseSnapshot();
  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <h1>Universe Monitor</h1>
          <div className="sub">Space situational awareness console</div>
        </div>
      </header>
      <MonitorClient
        planets={snap.planets}
        iss={snap.iss}
        defaultObserver={snap.observer}
        threats={snap.threats}
        neos={snap.neos}
        weather={snap.weather}
        starlink={snap.starlink}
        epic={snap.epic}
        cad={snap.cad}
        phaCad={snap.phaCad}
        scout={snap.scout}
        sentry={snap.sentry}
        apod={snap.apod}
        eonet={snap.eonet}
        nasaTle={snap.nasaTle}
        ssc={snap.ssc}
        generatedAt={snap.generatedAt}
      />
    </main>
  );
}
