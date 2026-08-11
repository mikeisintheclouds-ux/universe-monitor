import type { ThreatItem, ThreatLevel } from "@/lib/types";
import { boardSeverity } from "@/lib/threat";

const LEVEL_COLOR: Record<ThreatLevel, string> = {
  CLEAR: "#34d399",
  WATCH: "#fbbf24",
  ELEVATED: "#fb923c",
  SEVERE: "#f43f5e",
};

export function ThreatBoard({ items }: { items: ThreatItem[] }) {
  const top = boardSeverity(items);
  return (
    <section className="panel threat-board" style={{ marginBottom: "1rem" }}>
      <div className="row" style={{ borderBottom: "none", paddingTop: 0 }}>
        <h2 style={{ marginBottom: 0 }}>Threat board · unified risk</h2>
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
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: LEVEL_COLOR[t.level],
                }}
              >
                {t.level}
              </div>
              <div className="meta">score {t.score}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
