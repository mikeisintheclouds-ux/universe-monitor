# Universe Monitor

Operational situational-awareness dashboard for near-Earth space and Earth observation.

Integrates NASA scientific data products and open orbital catalogs into a single scale-navigation interface—from deep-space context through solar-system geometry to surface coordinates.

## Capabilities

| Product | Provider | Function |
|---------|----------|----------|
| **EPIC** | NASA / DSCOVR | Full-disk Earth imagery from Sun–Earth L1 |
| **GIBS WMTS** | NASA ESDIS | Global true-color and thermal map tiles (MapLibre) |
| **NeoWs** | NASA JPL | Near-Earth object close-approach feed |
| **DONKI** | NASA CCMC | Space-weather notifications |
| **ISS telemetry** | Open ISS API | Real-time position, altitude, and velocity |
| **TLE catalogs** | Celestrak | Starlink, stations, and related orbital groups |
| **Planetary alignment** | Local ephemeris | Ecliptic longitude clustering score |

Starlink data is limited to published two-line element sets. No public optical payload is available for that constellation.

## Interface

Five discrete zoom levels:

1. **Universe** — observable-universe scale frame  
2. **Galaxy** — Milky Way / local arm context  
3. **Solar** — planetary positions and alignment metric  
4. **Earth** — MapLibre map with NASA GIBS true-color base, ISS marker, and observer lock  
5. **Surface** — coordinate handoff to external mapping services  

Default observer location: York, South Carolina (configurable in `src/lib/data.ts`).

## Technology

- Next.js 15 (App Router) and TypeScript  
- MapLibre GL for the Earth stage  
- NASA Open APIs (NeoWs, EPIC, DONKI)  
- NASA GIBS Web Map Tile Service  
- Celestrak General Perturbations (GP) / TLE distribution  

Integration notes: [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md)

## Getting started

```bash
npm install
npm run dev
```

Optional NASA developer key (higher rate limits):

```bash
NASA_API_KEY=your_key npm run dev
```

A free key is available at [api.nasa.gov](https://api.nasa.gov/). The shared `DEMO_KEY` is sufficient for local evaluation.

## Repository purpose

This project demonstrates production-oriented integration of public scientific APIs, client-side geospatial rendering, and structured TypeScript architecture suitable for operations and portfolio review.

## License

MIT License. Copyright (c) 2026 Mike O'Connor.
