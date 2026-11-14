import * as THREE from 'three';
import { MarsLocation } from '@/types/map';

// Mars physical constants
export const MARS_RADIUS_KM = 3389.5;
export const MARS_OBLATENESS = 0.00589; // Flattening factor

/**
 * Converts Martian Latitude & Longitude to 3D Cartesian coordinates for Three.js.
 * 
 * In Martian mapping conventions:
 * - Latitude ranges from -90° (South Pole) to +90° (North Pole)
 * - Longitude ranges from 0° to 360° East (or -180° to +180°)
 * 
 * Standard Three.js sphere with UV texture mapping:
 * - Y is the rotation axis (North Pole = +Y, South Pole = -Y)
 * - Prime meridian (0° Lon) aligns with standard UV texture orientation
 * 
 * @param lat Latitude in decimal degrees (-90 to 90)
 * @param lon Longitude in decimal degrees (0 to 360 or -180 to 180)
 * @param radius Radius of the 3D globe in Three.js units (default: 2.0)
 * @param altitudeOffset Additional elevation offset above surface
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number = 2.0,
  altitudeOffset: number = 0
): THREE.Vector3 {
  const effectiveRadius = radius + altitudeOffset;
  const phi = (90 - lat) * (Math.PI / 180); // Polar angle from +Y axis (0 to PI)
  // Martian standard texture mapping: 0° Lon is usually mapped at center or specific UV offset
  // In standard Three.js SphereGeometry equirectangular texture:
  // theta = (lon + 180) * (Math.PI / 180) or with offset for Mars prime meridian alignment
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -effectiveRadius * Math.sin(phi) * Math.cos(theta);
  const y = effectiveRadius * Math.cos(phi);
  const z = effectiveRadius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Converts a 3D Cartesian position on the globe back to Martian Latitude & Longitude.
 */
export function vector3ToLatLon(position: THREE.Vector3): { lat: number; lon: number } {
  const norm = position.clone().normalize();
  const lat = 90 - Math.acos(norm.y) * (180 / Math.PI);
  let lon = (Math.atan2(norm.z, -norm.x) * (180 / Math.PI)) - 180;
  
  // Normalize lon to -180 to 180
  while (lon < -180) lon += 360;
  while (lon > 180) lon -= 360;

  return {
    lat: Number(lat.toFixed(4)),
    lon: Number(lon.toFixed(4)),
  };
}

/**
 * Calculates Great Circle distance between two Martian coordinates in kilometers.
 */
export function marsHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return MARS_RADIUS_KM * c;
}

/**
 * Key Martian Locations for Mission Control Exploration
 */
export const MARS_LANDMARKS: MarsLocation[] = [
  {
    id: 'jezero-crater',
    name: 'Jezero Crater',
    type: 'crater',
    coordinates: {
      latitude: 18.38,
      longitude: 77.58,
      altitudeKm: -2.5,
    },
    description:
      'Ancient Martian paleolake crater with a prominent river delta deposit. Landing site of NASA Perseverance Rover and Ingenuity Helicopter.',
    diameterKm: 45.0,
    depthMeters: 500,
    missionConnection: 'NASA Mars 2020 (Perseverance & Ingenuity)',
    historicalSignificance:
      'Contains clay minerals formed in neutral pH water, making it prime astrobiological search terrain for fossilized microbial biosignatures.',
    roverSite: 'Octavia E. Butler Landing (18.4447° N, 77.4508° E)',
  },
  {
    id: 'olympus-mons',
    name: 'Olympus Mons',
    type: 'volcano',
    coordinates: {
      latitude: 18.65,
      longitude: 226.2, // ~ -133.8° W
      altitudeKm: 21.2,
    },
    description:
      'The largest known shield volcano in the solar system, rising approximately 21.9 km above Mars datum.',
    diameterKm: 600,
    depthMeters: 21900,
    historicalSignificance: 'Formed by persistent basaltic lava flows over billions of years without plate tectonics.',
  },
  {
    id: 'valles-marineris',
    name: 'Valles Marineris',
    type: 'canyon',
    coordinates: {
      latitude: -13.9,
      longitude: 300.8, // ~ -59.2° W
      altitudeKm: -7.0,
    },
    description:
      'Vast canyon system stretching over 4,000 km along the Martian equator, up to 7 km deep.',
    diameterKm: 4000,
    depthMeters: 7000,
    historicalSignificance: 'Tectonic crack in the Martian crust associated with the uplift of the Tharsis volcanic region.',
  },
  {
    id: 'gale-crater',
    name: 'Gale Crater',
    type: 'crater',
    coordinates: {
      latitude: -5.37,
      longitude: 137.81,
      altitudeKm: -4.5,
    },
    description:
      'Landing site of NASA Curiosity Rover (Mars Science Laboratory). Houses Mount Sharp (Aeolis Mons) in the center.',
    diameterKm: 154,
    depthMeters: 5500,
    missionConnection: 'NASA MSL Curiosity Rover (2012-Present)',
    roverSite: 'Bradbury Landing (-4.5895° S, 137.4417° E)',
  },
  {
    id: 'elysium-planitia',
    name: 'Elysium Planitia',
    type: 'plain',
    coordinates: {
      latitude: 4.5,
      longitude: 135.62,
      altitudeKm: -2.6,
    },
    description:
      'Smooth volcanic plain near the equator. Operational site of the NASA InSight seismological lander.',
    diameterKm: 1000,
    missionConnection: 'NASA InSight Lander (2018-2022)',
  },
  {
    id: 'meridiani-planum',
    name: 'Meridiani Planum',
    type: 'plain',
    coordinates: {
      latitude: -1.95,
      longitude: 354.47,
      altitudeKm: -1.4,
    },
    description:
      'Hematite-rich plain explored by NASA Opportunity rover for over 14 years, finding evidence of ancient liquid groundwater.',
    diameterKm: 800,
    missionConnection: 'NASA Mars Exploration Rover (Opportunity)',
  },
];

export const JEZERO_CRATER_TARGET = MARS_LANDMARKS[0];
