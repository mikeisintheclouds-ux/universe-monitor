/**
 * NASA GIBS (Global Imagery Browse Services) — WMTS tile helpers
 *
 * Web Mercator (EPSG:3857) REST template used by Leaflet / MapLibre:
 *   https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/
 *     {layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg
 *
 * TIME is YYYY-MM-DD. Prefer 1–3 days behind "today" for full global coverage.
 */

export type GibsLayerId =
  | "MODIS_Terra_CorrectedReflectance_TrueColor"
  | "MODIS_Aqua_CorrectedReflectance_TrueColor"
  | "VIIRS_SNPP_CorrectedReflectance_TrueColor"
  | "VIIRS_NOAA20_CorrectedReflectance_TrueColor"
  | "MODIS_Terra_CorrectedReflectance_Bands721"
  | "MODIS_Terra_Land_Surface_Temp_Day"
  | "VIIRS_SNPP_Thermal_Anomalies_375m_All"
  | "MODIS_Combined_Thermal_Anomalies_All";

export interface GibsLayerSpec {
  id: GibsLayerId;
  label: string;
  tileMatrixSet: string;
  maxZoom: number;
  format: "jpg" | "png";
  kind: "truecolor" | "falsecolor" | "thermal" | "science";
}

export const GIBS_LAYERS: GibsLayerSpec[] = [
  {
    id: "MODIS_Terra_CorrectedReflectance_TrueColor",
    label: "MODIS Terra True Color",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxZoom: 9,
    format: "jpg",
    kind: "truecolor",
  },
  {
    id: "MODIS_Aqua_CorrectedReflectance_TrueColor",
    label: "MODIS Aqua True Color",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxZoom: 9,
    format: "jpg",
    kind: "truecolor",
  },
  {
    id: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    label: "VIIRS SNPP True Color",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxZoom: 9,
    format: "jpg",
    kind: "truecolor",
  },
  {
    id: "MODIS_Terra_CorrectedReflectance_Bands721",
    label: "MODIS Terra 7-2-1 (fires/burn)",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxZoom: 9,
    format: "jpg",
    kind: "falsecolor",
  },
  {
    id: "VIIRS_SNPP_Thermal_Anomalies_375m_All",
    label: "VIIRS Thermal Anomalies",
    tileMatrixSet: "GoogleMapsCompatible_Level8",
    maxZoom: 8,
    format: "png",
    kind: "thermal",
  },
];

export function gibsTileUrlTemplate(
  layer: GibsLayerSpec,
  timeIsoDate: string
): string {
  const ext = layer.format;
  return (
    `https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/` +
    `${layer.id}/default/${timeIsoDate}/${layer.tileMatrixSet}/{z}/{y}/{x}.${ext}`
  );
}

export function gibsSingleTileUrl(
  layer: GibsLayerSpec,
  timeIsoDate: string,
  z: number,
  y: number,
  x: number
): string {
  const ext = layer.format;
  return (
    `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/` +
    `${layer.id}/default/${timeIsoDate}/${layer.tileMatrixSet}/${z}/${y}/{x}.${ext}`
  );
}

export function gibsRecommendedDate(offsetDays = 2): string {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function defaultTrueColorLayer(): GibsLayerSpec {
  return GIBS_LAYERS[0];
}
