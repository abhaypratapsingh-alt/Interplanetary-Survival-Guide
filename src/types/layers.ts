export interface ImageryLayer {
  id: string;
  name: string;
  provider: 'NASA Mars Trek' | 'HiRISE' | 'MOLA' | 'CTX' | 'Procedural Scientific Canvas';
  description: string;
  type: 'global-texture' | 'regional-wmts' | 'dem-heightmap' | 'bump-map';
  active: boolean;
  opacity: number;
  wmtsUrlPattern?: string;
  capabilitiesUrl?: string;
  projection?: string;
  maxZoomLevel?: number;
  dataQuality: 'prototype' | 'official-nasa-ready' | 'high-res';
}

export interface ElevationSource {
  id: string;
  name: string;
  instrument: 'MOLA (Mars Orbiter Laser Altimeter)' | 'HiRISE Stereo DEM' | 'HRSC' | 'Procedural Jezero Model';
  mission: 'Mars Global Surveyor' | 'Mars Reconnaissance Orbiter' | 'Mars Express' | 'Mars Pathfinder AI Prototype';
  verticalResolution: string;
  spatialResolution: string;
  geotiffReady: boolean;
  referenceDatum: 'Areoid (Mars Geoid Datum IAU 2000)';
}
