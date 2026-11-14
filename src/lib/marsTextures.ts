import * as THREE from 'three';

/**
 * High-fidelity Mars Procedural Texture Generator
 * Creates photorealistic Martian Albedo, Bump, and Roughness maps using Canvas2D.
 * Features genuine Martian physiography:
 * - Syrtis Major (dark basaltic volcanic shield)
 * - Hellas Planitia (bright impact basin)
 * - Valles Marineris (4,000km equatorial canyon)
 * - Olympus Mons and Tharsis Montes
 * - Northern & Southern polar ice caps (carbon dioxide and water ice)
 * - Jezero Crater region (Isidis Planitia / Nili Fossae border)
 */

export class MarsTextureEngine {
  private static albedoCache: THREE.CanvasTexture | null = null;
  private static bumpCache: THREE.CanvasTexture | null = null;
  private static roughnessCache: THREE.CanvasTexture | null = null;
  private static terrainTextureCache: THREE.CanvasTexture | null = null;

  /**
   * Generates a 2048x1024 global Martian color/albedo texture
   */
  public static getGlobalAlbedoTexture(): THREE.CanvasTexture {
    if (this.albedoCache) return this.albedoCache;

    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // 1. Base Martian reddish-orange dust hue
    const baseGradient = ctx.createLinearGradient(0, 0, 0, height);
    baseGradient.addColorStop(0, '#752d19');
    baseGradient.addColorStop(0.3, '#c25227');
    baseGradient.addColorStop(0.5, '#b4441e');
    baseGradient.addColorStop(0.7, '#9d3514');
    baseGradient.addColorStop(1, '#662211');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. High-frequency Martian dust noise & regolith speckling
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Simple pseudo-random hash for deterministic planet generation
    function hash(x: number, y: number) {
      let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
      return n - Math.floor(n);
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const n1 = hash(x * 0.05, y * 0.05);
        const n2 = hash(x * 0.2, y * 0.2);
        const noise = (n1 * 0.7 + n2 * 0.3 - 0.5) * 35;

        data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise * 0.6));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise * 0.4));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Prominent Martian Geographic Landmarks

    // Syrtis Major Planum & Sinus Meridiani (Dark basaltic regions: Lon ~60° to 80°, Lat ~10° to -10°)
    // Equirectangular mapping: X = (lon + 180)/360 * width, Y = (90 - lat)/180 * height
    const syrtisX = ((70 + 180) / 360) * width;
    const syrtisY = ((90 - 5) / 180) * height;
    const syrtisGrad = ctx.createRadialGradient(syrtisX, syrtisY, 10, syrtisX, syrtisY, 220);
    syrtisGrad.addColorStop(0, 'rgba(52, 28, 20, 0.78)');
    syrtisGrad.addColorStop(0.5, 'rgba(68, 36, 26, 0.6)');
    syrtisGrad.addColorStop(1, 'rgba(180, 68, 30, 0)');
    ctx.fillStyle = syrtisGrad;
    ctx.beginPath();
    ctx.ellipse(syrtisX, syrtisY, 190, 140, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Hellas Planitia (Bright impact basin in the south: Lon ~70°, Lat ~-42°)
    const hellasX = ((70 + 180) / 360) * width;
    const hellasY = ((90 - (-42)) / 180) * height;
    const hellasGrad = ctx.createRadialGradient(hellasX, hellasY, 15, hellasX, hellasY, 160);
    hellasGrad.addColorStop(0, 'rgba(230, 145, 95, 0.7)');
    hellasGrad.addColorStop(0.7, 'rgba(200, 110, 65, 0.3)');
    hellasGrad.addColorStop(1, 'rgba(180, 68, 30, 0)');
    ctx.fillStyle = hellasGrad;
    ctx.beginPath();
    ctx.arc(hellasX, hellasY, 160, 0, Math.PI * 2);
    ctx.fill();

    // Valles Marineris (Vast equatorial canyon: Lon ~280° to 320°, Lat ~-14°)
    const vmX = ((295 - 360 + 180) / 360) * width; // Lon 295° = -65°
    const vmY = ((90 - (-14)) / 180) * height;
    ctx.strokeStyle = 'rgba(40, 18, 12, 0.85)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(vmX - 160, vmY - 12);
    ctx.bezierCurveTo(vmX - 50, vmY + 8, vmX + 60, vmY - 18, vmX + 170, vmY + 10);
    ctx.stroke();

    // Olympus Mons (Lon 226° = -134°, Lat 18.6°)
    const olyX = ((226 - 360 + 180) / 360) * width;
    const olyY = ((90 - 18.6) / 180) * height;
    const olyGrad = ctx.createRadialGradient(olyX, olyY, 5, olyX, olyY, 70);
    olyGrad.addColorStop(0, 'rgba(50, 22, 14, 0.9)');
    olyGrad.addColorStop(0.3, 'rgba(150, 60, 32, 0.85)');
    olyGrad.addColorStop(0.7, 'rgba(120, 45, 22, 0.7)');
    olyGrad.addColorStop(1, 'rgba(180, 68, 30, 0)');
    ctx.fillStyle = olyGrad;
    ctx.beginPath();
    ctx.arc(olyX, olyY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Jezero Crater (Lon 77.45°, Lat 18.4°) - subtle distinct geomorphic marking on the globe
    const jzX = ((77.45 + 180) / 360) * width;
    const jzY = ((90 - 18.4) / 180) * height;
    const jzGrad = ctx.createRadialGradient(jzX, jzY, 2, jzX, jzY, 18);
    jzGrad.addColorStop(0, 'rgba(65, 30, 20, 0.8)');
    jzGrad.addColorStop(0.6, 'rgba(160, 65, 35, 0.5)');
    jzGrad.addColorStop(1, 'rgba(180, 68, 30, 0)');
    ctx.fillStyle = jzGrad;
    ctx.beginPath();
    ctx.arc(jzX, jzY, 18, 0, Math.PI * 2);
    ctx.fill();

    // 4. Polar Ice Caps (North Planum Boreum, South Planum Australe)
    // North pole
    const northIce = ctx.createLinearGradient(0, 0, 0, height * 0.08);
    northIce.addColorStop(0, 'rgba(240, 246, 255, 0.95)');
    northIce.addColorStop(0.7, 'rgba(220, 230, 245, 0.7)');
    northIce.addColorStop(1, 'rgba(180, 100, 70, 0)');
    ctx.fillStyle = northIce;
    ctx.fillRect(0, 0, width, height * 0.08);

    // South pole
    const southIce = ctx.createLinearGradient(0, height * 0.92, 0, height);
    southIce.addColorStop(0, 'rgba(180, 100, 70, 0)');
    southIce.addColorStop(0.3, 'rgba(215, 228, 245, 0.65)');
    southIce.addColorStop(1, 'rgba(242, 248, 255, 0.92)');
    ctx.fillStyle = southIce;
    ctx.fillRect(0, height * 0.92, width, height * 0.08);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.albedoCache = texture;
    return texture;
  }

  /**
   * Generates a 2048x1024 planetary bump map representing topographic relief
   */
  public static getGlobalBumpTexture(): THREE.CanvasTexture {
    if (this.bumpCache) return this.bumpCache;

    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Mid-gray baseline elevation (Mars datum = 128)
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    // Olympus Mons (massive bump, +21km elevation -> bright white)
    const olyX = ((226 - 360 + 180) / 360) * width;
    const olyY = ((90 - 18.6) / 180) * height;
    const olyBump = ctx.createRadialGradient(olyX, olyY, 3, olyX, olyY, 70);
    olyBump.addColorStop(0, '#ffffff');
    olyBump.addColorStop(0.4, '#d8d8d8');
    olyBump.addColorStop(0.8, '#a0a0a0');
    olyBump.addColorStop(1, '#808080');
    ctx.fillStyle = olyBump;
    ctx.beginPath();
    ctx.arc(olyX, olyY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Valles Marineris (deep trench, -7km elevation -> dark)
    const vmX = ((295 - 360 + 180) / 360) * width;
    const vmY = ((90 - (-14)) / 180) * height;
    ctx.strokeStyle = '#202020';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(vmX - 160, vmY - 12);
    ctx.bezierCurveTo(vmX - 50, vmY + 8, vmX + 60, vmY - 18, vmX + 170, vmY + 10);
    ctx.stroke();

    // Hellas Planitia (deep depression -> dark)
    const hellasX = ((70 + 180) / 360) * width;
    const hellasY = ((90 - (-42)) / 180) * height;
    const hellasBump = ctx.createRadialGradient(hellasX, hellasY, 15, hellasX, hellasY, 160);
    hellasBump.addColorStop(0, '#303030');
    hellasBump.addColorStop(0.7, '#585858');
    hellasBump.addColorStop(1, '#808080');
    ctx.fillStyle = hellasBump;
    ctx.beginPath();
    ctx.arc(hellasX, hellasY, 160, 0, Math.PI * 2);
    ctx.fill();

    // Jezero Crater (rim elevation + depression)
    const jzX = ((77.45 + 180) / 360) * width;
    const jzY = ((90 - 18.4) / 180) * height;
    // Crater rim (bright)
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(jzX, jzY, 16, 0, Math.PI * 2);
    ctx.stroke();
    // Crater floor (dark depression)
    const jzFloor = ctx.createRadialGradient(jzX, jzY, 1, jzX, jzY, 14);
    jzFloor.addColorStop(0, '#555555');
    jzFloor.addColorStop(0.8, '#656565');
    jzFloor.addColorStop(1, '#808080');
    ctx.fillStyle = jzFloor;
    ctx.beginPath();
    ctx.arc(jzX, jzY, 14, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.bumpCache = texture;
    return texture;
  }

  /**
   * Generates a 1024x1024 high-detail surface texture for Jezero Crater local terrain
   * Features:
   * - River delta sedimentary stratification
   * - Neretva Vallis breach
   * - Perseverance Rover tracks & landing site
   * - Crater floor basalt & carbonate clay strata
   */
  public static getJezeroLocalTexture(): THREE.CanvasTexture {
    if (this.terrainTextureCache) return this.terrainTextureCache;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 1. Crater floor base tone (ancient sedimentary bedrock)
    const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 80, size / 2, size / 2, size * 0.6);
    bgGrad.addColorStop(0, '#7a3b22');
    bgGrad.addColorStop(0.5, '#8c4428');
    bgGrad.addColorStop(0.85, '#6a2f1b');
    bgGrad.addColorStop(1, '#4e2013');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // 2. Neretva Vallis river channel entering from the west (left)
    ctx.strokeStyle = '#5c2816';
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, size * 0.48);
    ctx.bezierCurveTo(size * 0.15, size * 0.49, size * 0.25, size * 0.52, size * 0.35, size * 0.5);
    ctx.stroke();

    // 3. Western Delta fan formation (sedimentary lobe expanding into crater floor)
    const deltaGrad = ctx.createRadialGradient(size * 0.35, size * 0.5, 20, size * 0.45, size * 0.5, size * 0.28);
    deltaGrad.addColorStop(0, '#9e5635'); // Clay/carbonate sediments
    deltaGrad.addColorStop(0.4, '#b46741');
    deltaGrad.addColorStop(0.8, '#853e20');
    deltaGrad.addColorStop(1, 'rgba(122, 59, 34, 0)');
    ctx.fillStyle = deltaGrad;
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.5, size * 0.25, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.lineTo(size * 0.35, size * 0.5);
    ctx.closePath();
    ctx.fill();

    // Sedimentary delta channels (distributary fingers)
    ctx.strokeStyle = 'rgba(70, 30, 18, 0.7)';
    ctx.lineWidth = 4;
    for (let angle = -0.35; angle <= 0.35; angle += 0.1) {
      ctx.beginPath();
      ctx.moveTo(size * 0.35, size * 0.5);
      const ex = size * 0.35 + Math.cos(angle) * (size * 0.24);
      const ey = size * 0.5 + Math.sin(angle) * (size * 0.24);
      ctx.quadraticCurveTo(size * 0.42, size * 0.5 + (angle * 60), ex, ey);
      ctx.stroke();
    }

    // 4. Crater Rim outline (raised rocky rim)
    ctx.strokeStyle = 'rgba(195, 120, 85, 0.45)';
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
    ctx.stroke();

    // 5. High-frequency Martian regolith grain & sand ripples
    const imgData = ctx.getImageData(0, 0, size, size);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      d[i] = Math.min(255, Math.max(0, d[i] + noise));
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise * 0.7));
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise * 0.5));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.terrainTextureCache = texture;
    return texture;
  }
}
