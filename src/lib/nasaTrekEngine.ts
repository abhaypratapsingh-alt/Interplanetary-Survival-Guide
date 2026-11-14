import * as THREE from 'three';

export type NASALayerKind = 'viking' | 'mola' | 'jezero-highres';

export interface NASATileLoadState {
  isLoading: boolean;
  progressPercent: number;
  totalTiles: number;
  loadedTiles: number;
  activeLayer: NASALayerKind;
  sourceUrl: string;
  error?: string;
}

/**
 * Real NASA Mars Trek Tile Streaming Engine
 * 
 * Directly queries NASA JPL Solar System Treks WMTS tile server:
 * - Viking MDIM 2.1 Global Color Mosaic (232m/pixel)
 * - MGS MOLA Shaded Color Relief (463m/pixel)
 * - Jezero Crater High-Res Regional Tiles (TileMatrix 6)
 * 
 * Supports CORS ('anonymous') and renders directly into Three.js CanvasTextures.
 */
export class NASATrekEngine {
  private static globalVikingTexture: THREE.CanvasTexture | null = null;
  private static globalMolaTexture: THREE.CanvasTexture | null = null;
  private static jezeroLocalRealTexture: THREE.CanvasTexture | null = null;

  public static VIKING_WMTS_BASE =
    'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm';

  public static MOLA_WMTS_BASE =
    'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm';

  public static USER_TREK_PORTAL_URL =
    'https://trek.nasa.gov/mars/?utm_source=chatgpt.com#v=0.1&x=-20.55099999997765&y=20.55099999997765&z=1&p=urn%3Aogc%3Adef%3Acrs%3AIAU2000%3A%3A49918&d=&locale=&b=mars&e=-5427920.554839317%2C-2579645.466449675%2C5427879.452839317%2C2579686.568449675&sfz=&w=';

  public static JEZERO_TREK_PORTAL_URL =
    'https://trek.nasa.gov/mars/#v=0.1&x=77.58&y=18.38&z=6&p=urn%3Aogc%3Adef%3Acrs%3AIAU2000%3A%3A49918&b=mars';

  /**
   * Helper to load an image with CORS
   */
  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error(`Failed to load tile from ${url}`));
      img.src = url;
    });
  }

  /**
   * Streams genuine NASA Viking MDIM 2.1 tiles from NASA Mars Trek.
   * TileMatrix 1: 4 columns x 2 rows (1024 x 512)
   */
  public static async loadRealNASAVikingMosaic(
    onProgress?: (progress: number) => void
  ): Promise<THREE.CanvasTexture> {
    if (this.globalVikingTexture) return this.globalVikingTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Initial placeholder fill
    ctx.fillStyle = '#9e3f1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const zoom = 1;
    const cols = 4;
    const rows = 2;
    const tileSize = 256;
    const total = cols * rows;
    let completed = 0;

    const tilePromises: Promise<void>[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const url = `${this.VIKING_WMTS_BASE}/${zoom}/${r}/${c}.jpg`;
        const p = this.loadImage(url)
          .then((img) => {
            ctx.drawImage(img, c * tileSize, r * tileSize, tileSize, tileSize);
            completed++;
            if (onProgress) onProgress(Math.round((completed / total) * 100));
          })
          .catch((err) => {
            console.warn(`[NASA Trek] Tile fallback for ${r}/${c}:`, err);
          });
        tilePromises.push(p);
      }
    }

    await Promise.all(tilePromises);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    this.globalVikingTexture = texture;
    return texture;
  }

  /**
   * Streams genuine NASA MGS MOLA elevation relief tiles from NASA Mars Trek.
   */
  public static async loadRealNASAMolaMosaic(
    onProgress?: (progress: number) => void
  ): Promise<THREE.CanvasTexture> {
    if (this.globalMolaTexture) return this.globalMolaTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#2d5a7b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const zoom = 1;
    const cols = 4;
    const rows = 2;
    const tileSize = 256;
    const total = cols * rows;
    let completed = 0;

    const tilePromises: Promise<void>[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const url = `${this.MOLA_WMTS_BASE}/${zoom}/${r}/${c}.jpg`;
        const p = this.loadImage(url)
          .then((img) => {
            ctx.drawImage(img, c * tileSize, r * tileSize, tileSize, tileSize);
            completed++;
            if (onProgress) onProgress(Math.round((completed / total) * 100));
          })
          .catch((err) => {
            console.warn(`[NASA Trek] MOLA tile fallback for ${r}/${c}:`, err);
          });
        tilePromises.push(p);
      }
    }

    await Promise.all(tilePromises);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    this.globalMolaTexture = texture;
    return texture;
  }

  /**
   * Streams high-resolution real NASA tiles specifically covering Jezero Crater.
   * Zoom Level 6: Rows 24..26, Cols 90..92 centered on Jezero Crater (Lat 18.38°N, Lon 77.58°E).
   * Result is a 768x768 real photographic terrain texture for the 3D local terrain mesh.
   */
  public static async loadRealNASAJezeroTerrain(
    layer: 'viking' | 'mola' = 'viking',
    onProgress?: (progress: number) => void
  ): Promise<THREE.CanvasTexture> {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = layer === 'viking' ? '#8a3c20' : '#45728a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const baseUrl = layer === 'viking' ? this.VIKING_WMTS_BASE : this.MOLA_WMTS_BASE;
    const zoom = 6;
    const startRow = 24;
    const startCol = 90;
    const size = 3; // 3x3 grid
    const tileSize = 256;
    const total = size * size;
    let completed = 0;

    const tilePromises: Promise<void>[] = [];

    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const row = startRow + dy;
        const col = startCol + dx;
        const url = `${baseUrl}/${zoom}/${row}/${col}.jpg`;

        const p = this.loadImage(url)
          .then((img) => {
            ctx.drawImage(img, dx * tileSize, dy * tileSize, tileSize, tileSize);
            completed++;
            if (onProgress) onProgress(Math.round((completed / total) * 100));
          })
          .catch((err) => {
            console.warn(`[NASA Trek] Jezero tile fallback for ${row}/${col}:`, err);
          });
        tilePromises.push(p);
      }
    }

    await Promise.all(tilePromises);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    this.jezeroLocalRealTexture = texture;
    return texture;
  }
}
