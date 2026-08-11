import { getUniverseSnapshot } from "@/lib/data";
import { MonitorClient } from "@/components/MonitorClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const snap = await getUniverseSnapshot();

  return (
    <div className="shell">
      <MonitorClient
        planets={snap.planets}
        iss={snap.iss}
        defaultObserver={snap.observer}
        threats={snap.threats}
        neos={snap.neos}
        weather={snap.weather}
        starlink={snap.starlink}
        epic={snap.epic}
        generatedAt={snap.generatedAt}
      />
    </div>
  );
}
