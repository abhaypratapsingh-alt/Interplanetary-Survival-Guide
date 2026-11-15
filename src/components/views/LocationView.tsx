'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Compass,
  Search,
  MapPin,
  Mountain,
  Globe,
  Layers,
  ChevronRight,
  Database,
  Crosshair,
  Info,
  Radio,
  Loader2,
} from 'lucide-react';
import { MarsGlobe } from '../MarsGlobe';
import { TerrainViewer } from '../TerrainViewer';
import { Starfield } from '../Starfield';
import { MapControls } from '../MapControls';
import { LayerControls } from '../LayerControls';
import { RegionInfoPanel } from '../RegionInfoPanel';
import { CoordinateDisplay } from '../CoordinateDisplay';
import { MARS_LANDMARKS, JEZERO_CRATER_TARGET } from '@/lib/marsCoordinates';
import { JEZERO_LOCAL_FEATURES } from '@/lib/terrainAdapter';
import { MapViewMode, MapDisplaySettings, MarsLocation } from '@/types/map';
import { TerrainFeature } from '@/types/terrain';

interface LocationViewProps {
  overrideTexture?: THREE.CanvasTexture | null;
  overrideTerrainTexture?: THREE.CanvasTexture | null;
  isStreamingNASA?: boolean;
  streamProgress?: number;
}

export function LocationView({
  overrideTexture = null,
  overrideTerrainTexture = null,
  isStreamingNASA = false,
  streamProgress = 100,
}: LocationViewProps) {
  const [viewMode, setViewMode] = useState<MapViewMode>('globe');
  const [selectedLocation, setSelectedLocation] = useState<MarsLocation>(JEZERO_CRATER_TARGET);
  const [selectedFeature, setSelectedFeature] = useState<TerrainFeature | null>(
    JEZERO_LOCAL_FEATURES[0] // Octavia E. Butler Landing site
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [activeLayerId, setActiveLayerId] = useState('nasa-viking-mdim21');
  const [activeElevationId, setActiveElevationId] = useState('procedural-jezero-prototype');

  // Display Settings
  const [settings, setSettings] = useState<MapDisplaySettings>({
    showAtmosphere: true,
    showStarfield: true,
    autoRotate: false,
    rotationSpeed: 0.8,
    showCoordinateGrid: false,
    showLabels: true,
    enableTerrainShading: true,
    elevationExaggeration: 1.25,
    wireframeMode: false,
    sunLighting: true,
    sunAngle: 45,
  });

  const [cameraResetKey, setCameraResetKey] = useState(0);

  const filteredLandmarks = MARS_LANDMARKS.filter((lm) =>
    lm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lm.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (loc: MarsLocation) => {
    setSelectedLocation(loc);
    if (loc.id === 'jezero-crater') {
      setViewMode('jezero-orbit');
    } else {
      setViewMode('globe');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col font-mono select-none overflow-hidden bg-black">
      {/* Search & Top Coordinates Ribbon */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 max-w-md w-full">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Martian locations, craters, plains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 shadow-xl"
          />
        </div>
      </div>

      {/* Floating Search Autocomplete Dropdown */}
      {searchQuery && (
        <div className="absolute top-12 left-4 z-30 w-80 max-h-56 overflow-y-auto bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-lg p-2 shadow-2xl space-y-1">
          {filteredLandmarks.map((lm) => (
            <div
              key={lm.id}
              onClick={() => {
                handleSelectLocation(lm);
                setSearchQuery('');
              }}
              className="p-2 rounded hover:bg-zinc-800/80 cursor-pointer flex items-center justify-between text-xs"
            >
              <div className="flex flex-col">
                <span className="font-bold text-white">{lm.name}</span>
                <span className="text-[10px] text-zinc-400 capitalize">{lm.type}</span>
              </div>
              <span className="text-[10px] text-cyan-400">
                {lm.coordinates.latitude > 0 ? `${lm.coordinates.latitude}°N` : `${Math.abs(lm.coordinates.latitude)}°S`},{' '}
                {lm.coordinates.longitude}°E
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 3D WebGL Canvas */}
      <div className="relative flex-1 w-full h-full">
        <Suspense
          fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 font-mono text-xs text-zinc-400">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <span>Rendering 3D Planetary Geodesy Engine...</span>
            </div>
          }
        >
          <Canvas
            key={`${viewMode}-${cameraResetKey}`}
            camera={
              viewMode === 'jezero-terrain'
                ? { position: [0, 8, 12], fov: 45, near: 0.1, far: 1000 }
                : { position: [0, 1.2, 5.2], fov: 45, near: 0.1, far: 1000 }
            }
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            {settings.showStarfield && <Starfield count={2800} />}

            {viewMode === 'jezero-terrain' ? (
              <TerrainViewer
                settings={settings}
                selectedFeature={selectedFeature}
                onSelectFeature={setSelectedFeature}
                onCursorCoordinates={setCursorCoords}
                overrideTexture={overrideTerrainTexture}
              />
            ) : (
              <MarsGlobe
                selectedLocation={selectedLocation}
                onSelectLocation={handleSelectLocation}
                onCursorCoordinates={setCursorCoords}
                settings={settings}
                globeRadius={2.0}
                isFocusedOnJezero={viewMode === 'jezero-orbit'}
                overrideTexture={overrideTexture}
              />
            )}
          </Canvas>
        </Suspense>

        {/* Floating HUD Reticle in center */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-8 h-8 opacity-25">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400 -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400 -translate-x-1/2" />
          </div>
        </div>

        {/* Floating Layer Controls (Top Left) */}
        <div className="absolute top-14 left-4 z-10">
          <LayerControls
            activeLayerId={activeLayerId}
            onSelectLayer={setActiveLayerId}
            activeElevationId={activeElevationId}
            onSelectElevation={setActiveElevationId}
          />
        </div>

        {/* Floating Map Controls (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10">
          <MapControls
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            settings={settings}
            onUpdateSettings={setSettings}
            onResetCamera={() => setCameraResetKey((prev) => prev + 1)}
            onZoomIn={() => {}}
            onZoomOut={() => {}}
          />
        </div>

        {/* Floating Region Information Panel (Top Right) */}
        <div className="absolute top-3 right-4 z-10 hidden sm:block">
          <RegionInfoPanel
            location={selectedLocation}
            selectedFeature={selectedFeature}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            onSelectFeature={setSelectedFeature}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <CoordinateDisplay
        cursorCoords={cursorCoords}
        selectedCoords={selectedLocation?.coordinates}
        viewMode={viewMode}
        sunAngle={settings.sunAngle}
      />
    </div>
  );
}
