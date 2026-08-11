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
  loadedBy: string;
}
