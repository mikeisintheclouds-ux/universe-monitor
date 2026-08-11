# Universe Monitor

**Cosmic ops dashboard.** Zoom from the observable universe → Milky Way → solar system → Earth orbit → your pin on the ground.

Live feeds:

| Feed | Source | What you get |
|------|--------|----------------|
| **EPIC** | NASA DSCOVR | Real satellite camera — full-disk Earth from L1 |
| **NeoWs** | NASA | Near-Earth objects / meteors (size, miss, velocity, PHA) |
| **DONKI** | NASA | Space weather notifications |
| **ISS** | wheretheiss.at | Live lat/lon/altitude/speed |
| **Starlink** | Celestrak TLE | Constellation catalog count + sample names |
| **Alignment** | Local ephemeris | Planetary ecliptic clustering score |

**Starlink note:** No public optical camera API exists. We track the swarm via TLE orbital elements only.

Loaded by **AFRO SATOSHI · Crypt Keeper uplink** — parent link to World Monitor.

## Zoom stack

| Level | View |
|-------|------|
| Universe | Observable-universe scale |
| Galaxy | Milky Way / Orion Arm / Sol |
| Solar | Planets + alignment score |
| Earth | Globe + ISS + observer |
| Surface | Coordinate lock → Google Maps |

## Run

```bash
npm install && npm run dev
```

Optional free key from [api.nasa.gov](https://api.nasa.gov/):

```bash
NASA_API_KEY=your_key npm run dev
```

`DEMO_KEY` works with rate limits.

## Stack

Next.js 15 · TypeScript · NASA Open APIs · Celestrak · pure SVG stages

## Topics

`nextjs` `typescript` `nasa` `epic` `starlink` `astronomy` `dashboard` `space` `neo` `iss` `portfolio`

## License

MIT © Mike O'Connor
