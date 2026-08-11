import type { ThreatItem, ThreatLevel } from "@/lib/types";
import { boardSeverity } from "@/lib/threat";

const LEVEL_COLOR: Record<ThreatLevel, string> = {
  CLEAR: "#34d399",
  WATCH: "#fbbf24",
  ELEVATED: "#fb923c",
  SEVERE: "#f43f5e",
};

const LEVEL_NOTE: Record<ThreatLevel, string> = {
  CLEAR: "No elevated indicators in the current data window",
  WATCH: "Indicators present — monitor scheduled updates",
  ELEVATED: "Multiple or higher-weight indicators active",
  SEVERE: "Highest-weight indicators in this window",
};

export function ThreatBoard({ items }: { items: ThreatItem[] }) {
  const top = boardSeverity(items);
  const topScore = items.length ? Math.max(...items.map((i) => i.score)) : 0;

  return (
    <section className="panel threat-board" style={{ marginBottom: "1rem" }}>
      <div className="row" style={{ borderBottom: "none", paddingTop: 0 }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem" }}>Threat board</h2>
          <div className="meta">{LEVEL_NOTE[top]}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            className="badge"
            style={{
              color: LEVEL_COLOR[top],
              borderColor: LEVEL_COLOR[top],
              background: `${LEVEL_COLOR[top]}22`,
            }}
          >
            {top}
          </span>
          <div className="meta" style={{ marginTop: "0.35rem" }}>
            Severity index {topScore}
          </div>
        </div>
      </div>
      <div className="threat-list">
        {items.slice(0, 5).map((t) => (
          <div className="row" key={t.id}>
            <div>
              <div className="name">{t.title}</div>
              <div className="meta">
                {t.source} · {t.detail}
              </div>
            </div>
            <div style={{ textAlign: "right", minWidth: 72 }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: LEVEL_COLOR[t.level],
                }}
              >
                {t.level}
              </div>
              <div className="meta">{t.score}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="meta" style={{ marginTop: "0.75rem", lineHeight: 1.4 }}>
        Severity index is a relative ranking of published NeoWs and DONKI
        indicators for this window. It is not an impact probability or damage
        forecast.
      </p>
    </section>
  );
}
