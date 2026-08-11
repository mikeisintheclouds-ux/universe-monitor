# Universe Monitor

**Cosmic ops dashboard** — zoom from the observable universe down to a pin on Earth, backed by real NASA and orbital data.

> Portfolio flagship: systems thinking + live scientific APIs + intentional UI.

## Live capabilities

| Feed | Source | What it does |
|------|--------|----------------|
| **EPIC** | NASA DSCOVR | Real satellite camera — full-disk Earth from L1 |
| **GIBS** | NASA WMTS | Global true-color / thermal map tiles (Leaflet-ready) |
| **NeoWs** | NASA | Near-Earth objects & close approaches |
| **DONKI** | NASA | Space weather notifications |
| **ISS** | Live telemetry | Position, altitude, velocity |
| **TLE catalogs** | Celestrak | Starlink / stations / weather groups + SGP4-ready parse |
| **Alignment** | Local ephemeris | Planetary ecliptic clustering |

**Starlink:** public data is **TLE positions only** — no optical camera API.

## Zoom stack

`Universe` → `Galaxy` → `Solar` → `Earth` → `Surface`

Observer defaults to York, SC; Surface hands off to Google Maps.

## Stack

- Next.js 15 App Router + TypeScript
- NASA Open APIs (NeoWs, EPIC, DONKI)
- GIBS WMTS helpers (`src/lib/gibs.ts`)
- Celestrak TLE parser (`src/lib/tle.ts`)
- Pure SVG stages (MapLibre + GIBS planned for Earth)

## Run

```bash
npm install && npm run dev
```

```bash
NASA_API_KEY=your_key npm run dev   # free key: api.nasa.gov
```

`DEMO_KEY` works with rate limits.

## Architecture notes

See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for GIBS tile URLs, Celestrak GROUP list, TLE line layout, and the Earth-zoom map plan.

## Topics

`nextjs` `typescript` `nasa` `gibs` `epic` `starlink` `tle` `celestrak` `astronomy` `dashboard` `space` `neo` `iss` `portfolio`

## License

MIT © Mike O'Connor
