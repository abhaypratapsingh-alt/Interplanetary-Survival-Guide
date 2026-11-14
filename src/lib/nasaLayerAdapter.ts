import { ImageryLayer, ElevationSource } from '@/types/layers';

/**
 * NASA Mars Trek WMTS & PDS Geosciences Official Endpoints Architecture
 * 
 * Mars Trek provides WMTS (Web Map Tile Service) tile pyramids for global and regional data:
 * Official documentation & Trek API:
 * - NASA Solar System Treks: https://trek.nasa.gov
 * - Mars Trek WMTS Base: https://api.nasa.gov / https://trek.nasa.gov/tiles/Mars/EQ/
 * - PDS Geosciences Node: https://pds-geosciences.wustl.edu/
 * - HiRISE PDS Data: https://hirise.lpl.arizona.edu/
 * - USGS Astrogeology Mars Digital Elevation Models: https://astrogeology.usgs.gov
 */

export const OFFICIAL_NASA_LAYERS: ImageryLayer[] = [
  {
    id: 'nasa-viking-mdim21',
    name: 'Viking MDIM 2.1 Colorized Global Mosaic',
    provider: 'NASA Mars Trek',
    description:
      'USGS & NASA compiled moderate resolution (~231m/pixel) global orthorectified color mosaic of Mars, standard basemap for planetary exploration.',
    type: 'global-texture',
    active: true,
    opacity: 1.0,
    wmtsUrlPattern: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    capabilitiesUrl: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/WMTSCapabilities.xml',
    projection: 'urn:ogc:def:crs:EPSG::104905 (Equirectangular Mars IAU 2000)',
    maxZoomLevel: 7,
    dataQuality: 'official-nasa-ready',
  },
  {
    id: 'nasa-mola-color-relief',
    name: 'MOLA Shaded Color Relief Elevation',
    provider: 'MOLA',
    description:
      'Mars Orbiter Laser Altimeter elevation colored by altitude from -8,200m to +21,200m relative to Mars datum (areoid).',
    type: 'dem-heightmap',
    active: false,
    opacity: 0.8,
    wmtsUrlPattern: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    capabilitiesUrl: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/WMTSCapabilities.xml',
    projection: 'Equirectangular',
    maxZoomLevel: 6,
    dataQuality: 'official-nasa-ready',
  },
  {
    id: 'nasa-ctx-jezero-mosaic',
    name: 'CTX Jezero Regional Mosaic (6m/pixel)',
    provider: 'CTX',
    description:
      'Mars Reconnaissance Orbiter Context Camera high-resolution regional mosaic centered on Jezero Crater and Nili Fossae.',
    type: 'regional-wmts',
    active: false,
    opacity: 1.0,
    wmtsUrlPattern: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MRO_CTX_Jezero_Mosaic_6m/1.0.0/default/default028mm/{z}/{y}/{x}.png',
    capabilitiesUrl: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MRO_CTX_Jezero_Mosaic_6m/1.0.0/WMTSCapabilities.xml',
    projection: 'Equirectangular',
    maxZoomLevel: 14,
    dataQuality: 'high-res',
  },
  {
    id: 'nasa-hirise-jezero-delta',
    name: 'HiRISE Jezero Western Fan Delta (0.25m/pixel)',
    provider: 'HiRISE',
    description:
      'Ultra high-resolution stereo-derived imagery over Perseverance Rover primary exploration corridor and delta front deposits.',
    type: 'regional-wmts',
    active: false,
    opacity: 0.9,
    wmtsUrlPattern: 'https://hirise-pds.lpl.arizona.edu/PDS/RDR/PSP/ORB_002300_002399/PSP_002387_1985/PSP_002387_1985_RED.JP2',
    projection: 'Mars 2000 Equirectangular',
    maxZoomLevel: 18,
    dataQuality: 'high-res',
  },
  {
    id: 'procedural-scientific-layer',
    name: 'Synthesized Martian Mineral & Geomorphic Prototype',
    provider: 'Procedural Scientific Canvas',
    description:
      'Self-contained, high-performance offline procedural texture generator displaying Jezero crater rim, western fan delta, clay bed deposits and dune fields.',
    type: 'dem-heightmap',
    active: true,
    opacity: 1.0,
    dataQuality: 'prototype',
  },
];

export const OFFICIAL_ELEVATION_SOURCES: ElevationSource[] = [
  {
    id: 'mgs-mola-megdr',
    name: 'MOLA Mission Experiment Gridded Data Record (MEGDR)',
    instrument: 'MOLA (Mars Orbiter Laser Altimeter)',
    mission: 'Mars Global Surveyor',
    verticalResolution: '1 meter vertical accuracy',
    spatialResolution: '128 pixels per degree (~463 meters at equator)',
    geotiffReady: true,
    referenceDatum: 'Areoid (Mars Geoid Datum IAU 2000)',
  },
  {
    id: 'mro-hirise-dtm',
    name: 'HiRISE Digital Terrain Model (DTM)',
    instrument: 'HiRISE Stereo DEM',
    mission: 'Mars Reconnaissance Orbiter',
    verticalResolution: '0.2 meter relative precision',
    spatialResolution: '1.0 meter horizontal grid',
    geotiffReady: true,
    referenceDatum: 'Areoid (Mars Geoid Datum IAU 2000)',
  },
  {
    id: 'procedural-jezero-prototype',
    name: 'Jezero Crater Geomorphic Simulation Model',
    instrument: 'Procedural Jezero Model',
    mission: 'Mars Pathfinder AI Prototype',
    verticalResolution: 'Continuous analytical displacement (128x128 grid)',
    spatialResolution: 'Simulated 50-meter equivalent over 45km crater domain',
    geotiffReady: false,
    referenceDatum: 'Areoid (Mars Geoid Datum IAU 2000)',
  },
];

/**
 * Adapter interface for loading GeoTIFF or standard DEM array buffers into 3D height arrays
 */
export interface DEMGridData {
  width: number;
  height: number;
  elevations: Float32Array;
  minElevation: number;
  maxElevation: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * GeoTIFF Integration Architecture
 * When geotiff.js is connected with real NASA PDS/USGS GeoTIFF files:
 * 1. Fetch arrayBuffer from NASA endpoint or local asset
 * 2. GeoTIFF.fromArrayBuffer(buffer)
 * 3. Read image raster bands
 * 4. Apply scale and offset: elevation = rawValue * scale + offset
 */
export async function loadNASAGeoTIFF(url: string): Promise<DEMGridData | null> {
  // Graceful fallback when running in prototype environment or offline:
  // Architecture returns null and alerts caller to use procedural prototype
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      console.info(`[NASA Adapter] GeoTIFF at ${url} not reachable, falling back to prototype DEM.`);
      return null;
    }
    // Return placeholder DEM structure
    return null;
  } catch {
    return null;
  }
}
