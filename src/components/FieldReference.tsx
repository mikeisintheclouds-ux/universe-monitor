"use client";

import { useState } from "react";

type Entry = {
  term: string;
  def: string;
};

const SECTIONS: { title: string; items: Entry[] }[] = [
  {
    title: "Close approaches & risk",
    items: [
      {
        term: "NEO",
        def: "Near-Earth Object — asteroid or comet whose orbit brings it near Earth.",
      },
      {
        term: "PHA",
        def: "Potentially Hazardous Asteroid — size and orbit criteria only. Not a forecast of impact.",
      },
      {
        term: "CAD",
        def: "Close Approach Data (JPL CNEOS) — predicted miss distance and time for Earth encounters.",
      },
      {
        term: "LD",
        def: "Lunar Distance — average Earth–Moon separation (~384,400 km). Used to express miss distance.",
      },
      {
        term: "H",
        def: "Absolute magnitude — brightness proxy for size. Lower H generally means a larger body.",
      },
      {
        term: "Sentry",
        def: "JPL impact monitoring system. Publishes virtual impact solutions with IP and Palermo values.",
      },
      {
        term: "IP",
        def: "Impact probability from published Sentry solutions. Often very small and decades away.",
      },
      {
        term: "Palermo scale",
        def: "Logarithmic risk relative to the background impact rate. Less negative (or positive) is more notable.",
      },
      {
        term: "Torino scale",
        def: "0–10 public communication scale for impact risk. Current published solutions are typically 0.",
      },
    ],
  },
  {
    title: "Orbit & satellites",
    items: [
      {
        term: "TLE",
        def: "Two-Line Element set — compact orbital elements used to predict satellite positions.",
      },
      {
        term: "SGP4",
        def: "Standard propagator that turns TLEs into position/velocity over time.",
      },
      {
        term: "ISS",
        def: "International Space Station (NORAD catalog 25544). Tracked live and via TLE.",
      },
      {
        term: "Observer",
        def: "Ground location used for pass prediction and map locking. Set via geolocation or default.",
      },
      {
        term: "SSC",
        def: "NASA Satellite Situation Center — heliophysics spacecraft location and region context.",
      },
    ],
  },
  {
    title: "Earth & space weather",
    items: [
      {
        term: "EPIC",
        def: "Earth Polychromatic Imaging Camera on DSCOVR (L1) — full-disk views of Earth.",
      },
      {
        term: "GIBS",
        def: "NASA Global Imagery Browse Services — true-color and science map tiles for Earth zoom.",
      },
      {
        term: "DONKI",
        def: "Space Weather Database Of Notifications, Knowledge, Information — flares, CMEs, storms.",
      },
      {
        term: "EONET",
        def: "Earth Observatory Natural Event Tracker — curated active events (storms, fires, volcanoes).",
      },
      {
        term: "APOD",
        def: "Astronomy Picture of the Day — daily NASA briefing image with caption.",
      },
    ],
  },
  {
    title: "How to read this console",
    items: [
      {
        term: "Severity index",
        def: "Relative ranking of published indicators across feeds. Not an impact probability or damage forecast.",
      },
      {
        term: "Hazardous flag",
        def: "Catalog classification (PHA/hazard criteria). Does not mean impact is expected.",
      },
      {
        term: "Data freshness",
        def: "Snapshot time is shown in the footer. Feeds revalidate on server intervals; not continuous telemetry.",
      },
    ],
  },
];

export function FieldReference() {
  const [open, setOpen] = useState(false);

  return (
    <section className="panel field-ref" aria-label="Field reference">
      <button
        type="button"
        className="field-ref-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <div className="name">Field reference</div>
          <div className="meta">
            Terms used on this console · SSA / planetary defense vocabulary
          </div>
        </div>
        <span className="badge ok">{open ? "COLLAPSE" : "EXPAND"}</span>
      </button>

      {open && (
        <div className="field-ref-body">
          <p className="field-ref-note">
            Published NASA/JPL indicators only. Values here are not impact
            forecasts or damage predictions.
          </p>
          <div className="field-ref-grid">
            {SECTIONS.map((sec) => (
              <div key={sec.title} className="field-ref-section">
                <h3>{sec.title}</h3>
                <dl>
                  {sec.items.map((item) => (
                    <div className="field-ref-row" key={item.term}>
                      <dt>{item.term}</dt>
                      <dd>{item.def}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
