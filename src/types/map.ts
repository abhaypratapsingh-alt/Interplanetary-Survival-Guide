export type MapViewMode = 'globe' | 'jezero-orbit' | 'jezero-terrain';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitudeKm?: number;
}

export interface MarsLocation {
  id: string;
  name: string;
  type: 'crater' | 'volcano' | 'canyon' | 'landing_site' | 'plain';
  coordinates: GeoCoordinates;
  description: string;
  diameterKm?: number;
  depthMeters?: number;
  missionConnection?: string;
  historicalSignificance?: string;
  roverSite?: string;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export interface MapDisplaySettings {
  showAtmosphere: boolean;
  showStarfield: boolean;
  autoRotate: boolean;
  rotationSpeed: number;
  showCoordinateGrid: boolean;
  showLabels: boolean;
  enableTerrainShading: boolean;
  elevationExaggeration: number;
  wireframeMode: boolean;
  sunLighting: boolean;
  sunAngle: number; // in degrees
}
