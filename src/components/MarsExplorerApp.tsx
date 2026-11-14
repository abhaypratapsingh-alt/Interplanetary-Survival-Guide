'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { MarsGlobe } from './MarsGlobe';
import { TerrainViewer } from './TerrainViewer';
import { Starfield } from './Starfield';
import { MissionHeader } from './MissionHeader';
import { MapControls } from './MapControls';
import { LayerControls } from './LayerControls';
import { RegionInfoPanel } from './RegionInfoPanel';
import { NavigationSidebar } from './NavigationSidebar';
import { CoordinateDisplay } from './CoordinateDisplay';
import { NasaTrekSyncModal } from './NasaTrekSyncModal';
import { MissionPrefaceModal } from './MissionPrefaceModal';
import { MARS_LANDMARKS, JEZERO_CRATER_TARGET } from '@/lib/marsCoordinates';
import { JEZERO_LOCAL_FEATURES } from '@/lib/terrainAdapter';
import { NASATrekEngine } from '@/lib/nasaTrekEngine';
import { MapViewMode, MapDisplaySettings, MarsLocation } from '@/types/map';
import { TerrainFeature } from '@/types/terrain';
import { Loader2, Satellite, Radio } from 'lucide-react';

export function MarsExplorerApp() {
  const [viewMode, setViewMode] = useState<MapViewMode>('globe');
  const [selectedLocation, setSelectedLocation] = useState<MarsLocation>(JEZERO_CRATER_TARGET);
  const [selectedFeature, setSelectedFeature] = useState<TerrainFeature | null>(
    JEZERO_LOCAL_FEATURES[0] // Octavia E. Butler Landing site
  );
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isPrefaceOpen, setIsPrefaceOpen] = useState(true);

  // Check if preface was previously dismissed
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const dismissed = localStorage.getItem('mars_pathfinder_preface_dismissed');
        if (dismissed === 'true') {
          setIsPrefaceOpen(false);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Active layers state (default: real NASA Viking MDIM 2.1)
  const [activeLayerId, setActiveLayerId] = useState('nasa-viking-mdim21');
  const [activeElevationId, setActiveElevationId] = useState('procedural-jezero-prototype');

  // Real NASA Streamed Textures
  const [nasaGlobeTexture, setNasaGlobeTexture] = useState<THREE.CanvasTexture | null>(null);
  const [nasaTerrainTexture, setNasaTerrainTexture] = useState<THREE.CanvasTexture | null>(null);
  const [isStreamingNASA, setIsStreamingNASA] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);

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

  // Camera reset trigger count
  const [cameraResetKey, setCameraResetKey] = useState(0);

  // Load real NASA Viking/MOLA tiles when layer changes or on mount
  useEffect(() => {
    let isMounted = true;

    async function streamNASATextures() {
      setIsStreamingNASA(true);
      setStreamProgress(10);

      try {
        if (activeLayerId === 'nasa-viking-mdim21') {
          const tex = await NASATrekEngine.loadRealNASAVikingMosaic((pct) => {
            if (isMounted) setStreamProgress(pct);
          });
          if (isMounted) {
            setNasaGlobeTexture(tex);
          }
        } else if (activeLayerId === 'nasa-mola-color-relief') {
          const tex = await NASATrekEngine.loadRealNASAMolaMosaic((pct) => {
            if (isMounted) setStreamProgress(pct);
          });
          if (isMounted) {
            setNasaGlobeTexture(tex);
          }
        } else {
          if (isMounted) setNasaGlobeTexture(null);
        }

        const jezeroTex = await NASATrekEngine.loadRealNASAJezeroTerrain(
          activeLayerId === 'nasa-mola-color-relief' ? 'mola' : 'viking'
        );
        if (isMounted) {
          setNasaTerrainTexture(jezeroTex);
        }
      } catch (err) {
        console.warn('NASA streaming note:', err);
      } finally {
        if (isMounted) {
          setIsStreamingNASA(false);
          setStreamProgress(100);
        }
      }
    }

    streamNASATextures();

    return () => {
      isMounted = false;
    };
  }, [activeLayerId]);

  const handleSelectLocation = (location: MarsLocation) => {
    setSelectedLocation(location);
    if (location.id === 'jezero-crater') {
      setViewMode('jezero-orbit');
    } else {
      setViewMode('globe');
    }
  };

  const handleResetCamera = () => {
    setCameraResetKey((prev) => prev + 1);
  };

  const handleZoom = (deltaFactor: number) => {
    // Zoom trigger
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 text-white font-sans flex flex-col select-none">
      {/* 1. Top Navigation */}
      <MissionHeader
        viewMode={viewMode}
        dataSource={
          activeLayerId === 'nasa-viking-mdim21'
            ? 'NASA Trek Viking MDIM 2.1 (Live)'
            : activeLayerId === 'nasa-mola-color-relief'
            ? 'NASA Trek MGS MOLA (Live)'
            : 'Procedural Analytical Canvas'
        }
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenPreface={() => setIsPrefaceOpen(true)}
        isStreamingNASA={isStreamingNASA}
      />

      {/* 2. Main Viewport Container */}
      <div className="relative flex-1 w-full h-[calc(100vh-5.5rem)]">
        {/* Left Sidebar */}
        <NavigationSidebar
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          isOpen={isNavOpen}
          onToggle={() => setIsNavOpen(!isNavOpen)}
        />

        {/* Real NASA Live Streaming HUD Banner */}
        {isStreamingNASA && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-zinc-950/90 backdrop-blur-md border border-mars-500/80 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(217,83,47,0.4)] flex items-center gap-2.5 font-mono text-xs">
            <Radio className="w-3.5 h-3.5 text-mars-400 animate-pulse" />
            <span className="text-zinc-200">
              Streaming Real NASA Mars Trek Tiles: <strong className="text-amber-400">{streamProgress}%</strong>
            </span>
          </div>
        )}

        {/* 3D WebGL Canvas */}
        <Suspense
          fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 font-mono text-xs text-zinc-400">
              <Loader2 className="w-8 h-8 text-mars-500 animate-spin" />
              <span>Initializing Martian 3D Terrain Engine...</span>
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
                overrideTexture={nasaTerrainTexture}
              />
            ) : (
              <MarsGlobe
                selectedLocation={selectedLocation}
                onSelectLocation={handleSelectLocation}
                onCursorCoordinates={setCursorCoords}
                settings={settings}
                globeRadius={2.0}
                isFocusedOnJezero={viewMode === 'jezero-orbit'}
                overrideTexture={nasaGlobeTexture}
              />
            )}
          </Canvas>
        </Suspense>

        {/* Floating HUD Reticle in center */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-8 h-8 opacity-25">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-mars-400 -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-mars-400 -translate-x-1/2" />
          </div>
        </div>

        {/* Floating Layer Controls (Top Left near sidebar) */}
        <div
          className={`absolute top-4 transition-all duration-300 z-10 ${
            isNavOpen ? 'left-76 md:left-80' : 'left-16'
          }`}
        >
          <LayerControls
            activeLayerId={activeLayerId}
            onSelectLayer={setActiveLayerId}
            activeElevationId={activeElevationId}
            onSelectElevation={setActiveElevationId}
          />
        </div>

        {/* Floating Map Interaction Controls (Bottom Left) */}
        <div
          className={`absolute bottom-4 transition-all duration-300 z-10 ${
            isNavOpen ? 'left-76 md:left-80' : 'left-16'
          }`}
        >
          <MapControls
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            settings={settings}
            onUpdateSettings={setSettings}
            onResetCamera={handleResetCamera}
            onZoomIn={() => handleZoom(0.8)}
            onZoomOut={() => handleZoom(1.2)}
          />
        </div>

        {/* Floating Region Information Panel (Top/Middle Right) */}
        <div className="absolute top-4 right-4 z-10 hidden sm:block">
          <RegionInfoPanel
            location={selectedLocation}
            selectedFeature={selectedFeature}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            onSelectFeature={setSelectedFeature}
          />
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <CoordinateDisplay
        cursorCoords={cursorCoords}
        selectedCoords={selectedLocation?.coordinates}
        viewMode={viewMode}
        sunAngle={settings.sunAngle}
      />

      {/* 4. Mission Preface & Briefing Modal (Shows on startup or via header button) */}
      <MissionPrefaceModal
        isOpen={isPrefaceOpen}
        onEnter={() => setIsPrefaceOpen(false)}
      />

      {/* 5. NASA Mars Trek Live Sync Modal */}
      <NasaTrekSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        activeLayer={activeLayerId}
        onSelectLayer={setActiveLayerId}
        streamProgress={streamProgress}
        isStreaming={isStreamingNASA}
      />
    </div>
  );
}
