# Universe Monitor

Operational space situational-awareness dashboard for near-Earth space and Earth observation.

## Capabilities (v1.1)

| Feature | Implementation |
|---------|----------------|
| **Threat board** | Unified NEO + DONKI severity scoring |
| **Pass predictor** | ISS visibility windows over observer (SGP4) |
| **EPIC time scrubber** | Historical DSCOVR full-disk archive (30-day) |
| **SGP4 propagator** | satellite.js live lat/lon/alt + ground track |
| **3D solar system** | Three.js ecliptic + alignment wedge |
| **Earth map** | MapLibre + NASA GIBS true-color + ISS/observer markers |
| **Feeds** | NeoWs, EPIC, DONKI, ISS API, Celestrak TLE |

## Stack

Next.js 15 · TypeScript · MapLibre GL · Three.js · satellite.js · NASA Open APIs · Celestrak

## Run

```bash
npm install
npm run dev
```

Optional: `NASA_API_KEY=your_key npm run dev`

## License

MIT · Copyright (c) 2026 Mike O'Connor
