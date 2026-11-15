<<<<<<< HEAD
# Mars Pathfinder AI – Martian 3D Terrain Explorer
**NASA Space Apps Challenge 2026**

Interactive, realistic 3D Mars globe and local terrain visualization engine built with **React**, **Next.js**, **Three.js**, **React Three Fiber**, **Drei**, and **Tailwind CSS**.

---

## 🚀 Key Features

### 1. Planetary 3D Mars Globe
- Spherical Mars geometry with photorealistic reddish-orange regolith textures, Syrtis Major, Hellas Planitia, Valles Marineris, Olympus Mons, and polar ice caps.
- Dynamic bump mapping and realistic lighting (directional sunlight with adjustable azimuth angle, subtle ambient dust scattering, deep space starfield).
- Custom atmospheric limb glow shader with Fresnel scattering.
- Real-time mouse rotation, scroll-wheel zoom, click-and-drag, and coordinate raycasting.
- Key Martian landmark beacons (Jezero Crater, Olympus Mons, Valles Marineris, Gale Crater, Elysium Planitia, Meridiani Planum).

### 2. Jezero Crater Local 3D Terrain
- Dedicated local 3D terrain exploration mode centered on Jezero Crater (18.38° N, 77.58° E).
- High-resolution analytical elevation displacement model capturing:
  - 45 km circular crater rim and wall.
  - Ancient lakebed basin depression (-2,500m datum).
  - Western river breach (Neretva Vallis inlet).
  - Western fan delta with sedimentary stratification.
  - Kodiak Butte (isolated delta remnant).
  - Séítah formation (olivine bedrock).
  - Octavia E. Butler landing site (NASA Perseverance Rover touchdown).
- Real-time elevation exaggeration slider (0.5x to 2.5x).
- Martian UTM coordinate grid overlay.
- Wireframe / Shading toggle.
- Solar azimuth lighting control.

### 3. Scientific Mission Control Interface
- **Top Navigation Bar:** Mars Pathfinder AI mission badge, mission target badge, current viewing mode, and fullscreen toggle.
- **Left Sidebar:** Navigation panel with primary Jezero focus and planetary landmark catalog.
- **Floating Map Controls:** View mode switcher, zoom in/out, reset camera, grid toggle, label toggle, sun lighting toggle, wireframe toggle, and solar azimuth slider.
- **NASA Data Layer Modal:** Configurable imagery layers (Viking MDIM, MOLA Color, CTX Jezero, HiRISE Delta, Procedural Prototype) and elevation models.
- **Right Information Panel:** Detailed geological context, latitude/longitude, IAU identifiers, mission history, and quick navigation actions.
- **Bottom Status Bar:** Live cursor coordinates, subsolar azimuth, Mars areoid datum reference, and WebGL engine telemetry.

---

## 🛠️ Architecture & NASA Data Readiness

Data adapters in `src/lib/` are built for seamless drop-in integration of official NASA products:
- `nasaLayerAdapter.ts`: Preconfigured for NASA Solar System Treks WMTS endpoints (Viking MDIM 2.1, CTX mosaics, MOLA relief) and PDS Geosciences nodes.
- `terrainAdapter.ts`: Standardized displacement grid interface prepared for GeoTIFF / HiRISE DTM parsing (`geotiff.js`).
- `marsCoordinates.ts`: Exact geodesy transformations (Lat/Lon to 3D Cartesian Vector3 and Great-Circle Haversine calculations).
- `marsTextures.ts`: Self-contained procedural Mars planetary and terrain texture generators ensuring 100% offline reliability.

---

## 🏃 Getting Started

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```
=======
# Interplanetary-Survival-Guide
NASA has explored Mars robotically for decades, studying its extreme environment, mapping its surface, and collecting many types of data. Far from home, the first astronauts to set foot on Mars will want the best map possible, with information on the details of their routes and destinations, updates on current conditions.
>>>>>>> origin/main
