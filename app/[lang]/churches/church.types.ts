// app/[lang]/churches/church.types.ts
export interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    denomination?: string;
    religion?: string;
    "addr:street"?: string;
    "addr:housenumber"?: string;
    "addr:city"?: string;
    "addr:town"?: string;
    "addr:village"?: string;
    "addr:hamlet"?: string;
    "addr:place"?: string;
    "addr:county"?: string;
    "addr:district"?: string;
    "addr:country"?: string;
  };
}

export interface Church {
  name: string;
  address: string;
  lat: number;
  lng: number;
  denomination?: string;
}

export interface ChurchWithDistance extends Church {
  distance: number;
}

export interface CacheData {
  elements: OsmElement[];
  timestamp: number;
}

export type Lang = 'cs' | 'en' | 'ur';