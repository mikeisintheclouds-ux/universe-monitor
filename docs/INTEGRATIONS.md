# Universe Monitor — Integrations

## 1. NASA GIBS map tiles

**What:** Pre-rendered global satellite imagery as WMTS tiles (MODIS, VIIRS, thermal anomalies).

**No API key.** CORS open. Attribution: NASA GIBS / ESDIS.

### Web Mercator (EPSG:3857)

```
https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/
  {LAYER}/default/{YYYY-MM-DD}/{TileMatrixSet}/{z}/{y}/{x}.jpg
```

| Layer | TileMatrixSet | Max zoom |
|-------|---------------|----------|
| `MODIS_Terra_CorrectedReflectance_TrueColor` | `GoogleMapsCompatible_Level9` | 9 |
| `MODIS_Aqua_CorrectedReflectance_TrueColor` | `GoogleMapsCompatible_Level9` | 9 |
| `VIIRS_SNPP_CorrectedReflectance_TrueColor` | `GoogleMapsCompatible_Level9` | 9 |
| `VIIRS_SNPP_Thermal_Anomalies_375m_All` | `GoogleMapsCompatible_Level8` | 8 |

**Time tip:** Use today − 1..3 days for complete mosaics.

**Code:** `src/lib/gibs.ts`

Docs: https://nasa-gibs.github.io/gibs-api-docs/

## 2. Celestial TLE catalogs (Celestrak)

```
https://celestrak.org/NORAD/elements/gp.php?GROUP={name}&FORMAT=TLE
https://celestrak.org/NORAD/elements/gp.php?CATNR={norad}&FORMAT=TLE
```

**2026 note:** Default FORMAT is CSV — always pass `FORMAT=TLE` or `JSON`.

| Group | Contents |
|-------|----------|
| `starlink` | Full constellation |
| `stations` | ISS + related |
| `oneweb` | OneWeb LEO |
| `weather` / `goes` | Weather sats |
| `visual` | Bright objects |

Propagate with SGP4. **No public Starlink cameras** — positions only.

**Code:** `src/lib/tle.ts`

## 3. Live feeds already in app

NeoWs · EPIC · DONKI · ISS · Starlink count

## Next step

MapLibre + GIBS true-color on Earth zoom + ISS/observer markers.
