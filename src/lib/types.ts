export type ZoomLevel =
  | "universe"
  | "galaxy"
  | "solar"
  | "earth"
  | "surface";

export interface NeoObject {
  id: string;
  name: string;
  hazardous: boolean;
  diameterKm: number;
  missKm: number;
  velocityKph: number;
  approachDate: string;
}

export interface PlanetState {
  name: string;
  symbol: string;
  longitude: number;
  distanceAu: number;
  color: string;
}

export interface IssState {
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKph: number;
  timestamp: number;
}

export interface Observer {
  latitude: number;
  longitude: number;
  label: string;
}

export interface EpicFrame {
  image: string;
  date: string;
  caption: string;
  url: string;
  lat: number;
  lon: number;
}

export interface SpaceWeatherEvent {
  id: string;
  type: string;
  startTime: string;
  note: string;
}

export interface StarlinkSummary {
  catalogCount: number;
  sampleNames: string[];
  source: string;
  sampleTle?: { name: string; line1: string; line2: string } | null;
  issTle?: { name: string; line1: string; line2: string } | null;
}

export interface CadApproach {
  des: string;
  cd: string;
  distAu: number;
  distMinAu: number;
  distLd: number;
  vRelKms: number;
  h: number;
  orbitId: string;
}

export interface SentryObject {
  des: string;
  fullname: string;
  ip: number;
  psCum: number;
  psMax: number;
  tsMax: number;
  diameterKm: number | null;
  nImp: number;
  range: string;
  lastObs: string;
}

export type ThreatLevel = "CLEAR" | "WATCH" | "ELEVATED" | "SEVERE";

export interface ThreatItem {
  id: string;
  source: "CAD" | "SENTRY" | "NEO" | "DONKI" | "SYSTEM";
  title: string;
  detail: string;
  level: ThreatLevel;
  score: number;
}

export interface UniverseSnapshot {
  generatedAt: string;
  zoom: ZoomLevel;
  neos: NeoObject[];
  planets: PlanetState[];
  iss: IssState | null;
  observer: Observer;
  epic: EpicFrame | null;
  weather: SpaceWeatherEvent[];
  starlink: StarlinkSummary;
  cad: CadApproach[];
  sentry: SentryObject[];
  threats: ThreatItem[];
  loadedBy: string;
}
