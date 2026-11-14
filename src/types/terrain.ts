export interface TerrainDataSpecs {
  centerCoord: {
    lat: number;
    lon: number;
  };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  resolutionMeters: number;
  gridSize: [number, number]; // width, height in vertices
  sourceType: 'procedural-prototype' | 'nasa-mola' | 'nasa-hirise-dem' | 'nasa-ctx-mosaic';
  datasetName: string;
  elevationMin: number;
  elevationMax: number;
}

export interface TerrainMeshOptions {
  width: number;
  height: number;
  segmentsX: number;
  segmentsY: number;
  displacementScale: number;
  roughness: number;
  metalness: number;
  wireframe: boolean;
}

export interface TerrainFeature {
  id: string;
  name: string;
  category: 'crater-rim' | 'delta-deposit' | 'rover-site' | 'sampling-site' | 'inlet-valley';
  coordinates: {
    lat: number;
    lon: number;
  };
  localOffset: [number, number, number]; // x, y, z in local scene
  description: string;
  elevationMeters?: number;
}
