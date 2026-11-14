import * as THREE from 'three';
import { TerrainFeature, TerrainDataSpecs } from '@/types/terrain';

export const JEZERO_DATASET_SPECS: TerrainDataSpecs = {
  centerCoord: {
    lat: 18.38,
    lon: 77.58,
  },
  bounds: {
    north: 18.85,
    south: 17.9,
    west: 77.05,
    east: 78.15,
  },
  resolutionMeters: 25.0, // Simulated DEM grid step
  gridSize: [128, 128],
  sourceType: 'procedural-prototype',
  datasetName: 'Jezero Crater Geomorphic Analytical Elevation Model (NASA Mars 2020 Target Zone)',
  elevationMin: -2700,
  elevationMax: -1800,
};

export const JEZERO_LOCAL_FEATURES: TerrainFeature[] = [
  {
    id: 'perseverance-landing',
    name: 'Octavia E. Butler Landing',
    category: 'rover-site',
    coordinates: { lat: 18.4447, lon: 77.4508 },
    localOffset: [-1.2, 0.45, -0.6],
    description: 'NASA Perseverance Rover touchdown site (February 18, 2021). Flat regolith plain adjacent to the delta front.',
    elevationMeters: -2570,
  },
  {
    id: 'western-delta-scarp',
    name: 'Western Fan Delta Scarp',
    category: 'delta-deposit',
    coordinates: { lat: 18.42, lon: 77.38 },
    localOffset: [-3.4, 0.95, -0.2],
    description: 'Steep sedimentary scarp exposing layered mudstones and siltstones deposited in an ancient Martian lakebed.',
    elevationMeters: -2480,
  },
  {
    id: 'neretva-vallis-inlet',
    name: 'Neretva Vallis Inflow Channel',
    category: 'inlet-valley',
    coordinates: { lat: 18.39, lon: 77.22 },
    localOffset: [-6.8, 1.25, 0.1],
    description: 'Deep breach in the western crater rim carved by an ancient river system that fed Lake Jezero ~3.7 billion years ago.',
    elevationMeters: -2300,
  },
  {
    id: 'kodiak-butte',
    name: 'Kodiak Butte',
    category: 'delta-deposit',
    coordinates: { lat: 18.41, lon: 77.42 },
    localOffset: [-2.1, 0.72, 1.3],
    description: 'Prominent eroded butte preserving ancient dipping delta bottomset and topset strata photographed by SuperCam.',
    elevationMeters: -2510,
  },
  {
    id: 'seitah-formation',
    name: 'Séítah Geological Formation',
    category: 'sampling-site',
    coordinates: { lat: 18.43, lon: 77.47 },
    localOffset: [-0.3, 0.35, 1.5],
    description: 'Rugged olivine-rich igneous rock units showing eolian sand dunes and cumulate volcanic crystallization.',
    elevationMeters: -2585,
  },
  {
    id: 'crater-rim-crest',
    name: 'Northwestern Rim Crest',
    category: 'crater-rim',
    coordinates: { lat: 18.65, lon: 77.32 },
    localOffset: [-5.5, 2.1, -5.2],
    description: 'Peak impact crater wall rising >700 meters above the crater floor, part of the Isidis impact basin megabreccia.',
    elevationMeters: -1950,
  },
];

/**
 * Procedural Geomorphic Elevation Generator for Jezero Crater
 * Generates an authentic heightfield:
 * - Crater rim (raised ring)
 * - Deep central lakebed basin
 * - West-to-east river breach (Neretva Vallis)
 * - Fan-shaped delta deposit expanding into the basin
 * - Kodiak butte isolation
 * - High-frequency terrain roughness (boulders, dunes)
 */
export function generateJezeroTerrainMesh(
  width: number = 18,
  depth: number = 18,
  segmentsX: number = 120,
  segmentsY: number = 120,
  elevationScale: number = 1.0
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsY);
  geometry.rotateX(-Math.PI / 2); // Orient horizontal in XZ plane (Y is up)

  const posAttr = geometry.attributes.position;
  const count = posAttr.count;

  const craterRadius = width * 0.44;

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);

    const distFromCenter = Math.sqrt(x * x + z * z);
    const normalizedDist = distFromCenter / craterRadius;

    let height = 0;

    // 1. Crater rim wall profile
    // Rim crest around normalizedDist = 1.0
    if (normalizedDist < 1.0) {
      // Inside crater: bowl shape with flat floor
      const bowl = Math.pow(normalizedDist, 2.8) * 1.8;
      height += bowl - 1.2;
    } else {
      // Outside rim: gradual drop-off into regional terrain
      const outerSlope = 1.8 - Math.min(1.8, (normalizedDist - 1.0) * 2.2);
      height += outerSlope - 1.2;
    }

    // 2. Western river delta formation (X < 0, centered around Z = 0)
    const deltaCenterX = -width * 0.22;
    const deltaCenterZ = 0;
    const distToDelta = Math.hypot(x - deltaCenterX, z - deltaCenterZ);
    if (x < 0.5 && distToDelta < width * 0.28) {
      // Fan lobe elevated above crater floor
      const deltaWeight = (1 - distToDelta / (width * 0.28));
      const deltaHeight = Math.max(0, deltaWeight) * 0.95;
      height += deltaHeight;

      // Delta front scarp: sharp drop-off towards the east (x > -1.5)
      if (x > -1.8 && x < 0.2) {
        const scarpDrop = Math.sin((x + 1.8) / 2.0 * Math.PI) * 0.3;
        height -= scarpDrop;
      }
    }

    // 3. Neretva Vallis canyon breach (enters from X = -width/2, Z ~ 0)
    if (x < -width * 0.25 && Math.abs(z) < 1.6) {
      const channelDepth = (1.6 - Math.abs(z)) * 0.65;
      height -= channelDepth;
    }

    // 4. Kodiak Butte (isolated mesa: x ~ -2.1, z ~ 1.3)
    const distToKodiak = Math.hypot(x - (-2.1), z - 1.3);
    if (distToKodiak < 0.65) {
      const butteHeight = Math.cos((distToKodiak / 0.65) * Math.PI * 0.5) * 0.42;
      height += butteHeight;
    }

    // 5. Martian rocky micro-relief / dunes (multi-frequency Perlin-style noise)
    const micro1 = Math.sin(x * 1.8 + z * 1.4) * Math.cos(x * 1.2 - z * 1.6) * 0.08;
    const micro2 = Math.sin(x * 4.2 + z * 3.8) * 0.035;
    const micro3 = Math.cos(x * 8.5) * Math.sin(z * 8.5) * 0.015;
    height += micro1 + micro2 + micro3;

    // Apply elevation exaggeration scale
    posAttr.setY(i, height * elevationScale);
  }

  // Recalculate vertex normals for accurate realistic lighting
  geometry.computeVertexNormals();
  return geometry;
}
