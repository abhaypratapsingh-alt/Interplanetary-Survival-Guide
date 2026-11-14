'use client';

import React from 'react';
import {
  Globe,
  Mountain,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Sun,
  Layers,
  Tag,
  Play,
  Pause,
  Box,
} from 'lucide-react';
import { MapViewMode, MapDisplaySettings } from '@/types/map';

interface MapControlsProps {
  viewMode: MapViewMode;
  onSetViewMode: (mode: MapViewMode) => void;
  settings: MapDisplaySettings;
  onUpdateSettings: (updater: (prev: MapDisplaySettings) => MapDisplaySettings) => void;
  onResetCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function MapControls({
  viewMode,
  onSetViewMode,
  settings,
  onUpdateSettings,
  onResetCamera,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  return (
    <div className="flex flex-col gap-2 pointer-events-auto">
      {/* View Mode Switcher */}
      <div className="bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 rounded-md p-1.5 shadow-xl flex items-center gap-1">
        <button
          onClick={() => onSetViewMode('globe')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all ${
            viewMode === 'globe'
              ? 'bg-mars-600 text-white font-semibold shadow-[0_0_12px_rgba(217,83,47,0.5)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
          title="Global Mars Planetary View"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Global Mars</span>
        </button>

        <button
          onClick={() => onSetViewMode('jezero-orbit')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all ${
            viewMode === 'jezero-orbit'
              ? 'bg-mars-600 text-white font-semibold shadow-[0_0_12px_rgba(217,83,47,0.5)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
          title="Jezero Orbital Focus"
        >
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-mars-400" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
          </div>
          <span>Jezero Orbit</span>
        </button>

        <button
          onClick={() => onSetViewMode('jezero-terrain')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all ${
            viewMode === 'jezero-terrain'
              ? 'bg-mars-600 text-white font-semibold shadow-[0_0_12px_rgba(217,83,47,0.5)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
          title="Jezero 3D Local Terrain Exploration"
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>3D Local Terrain</span>
        </button>
      </div>

      {/* Camera & Zoom Quick Controls */}
      <div className="bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 rounded-md p-1 shadow-xl flex items-center justify-between gap-1">
        <button
          onClick={onZoomIn}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/70 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/70 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-zinc-800" />
        <button
          onClick={onResetCamera}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/70 rounded transition-colors flex items-center gap-1.5 text-xs font-mono"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Layer & Display Toggles */}
      <div className="bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 rounded-md p-2 shadow-xl flex flex-col gap-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold px-1">
          Display Overlays
        </div>

        <div className="grid grid-cols-2 gap-1 text-xs font-mono">
          {/* Coordinate Grid Toggle */}
          <button
            onClick={() =>
              onUpdateSettings((s) => ({ ...s, showCoordinateGrid: !s.showCoordinateGrid }))
            }
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all ${
              settings.showCoordinateGrid
                ? 'bg-zinc-800 text-mars-400 border border-mars-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          {/* Labels Toggle */}
          <button
            onClick={() => onUpdateSettings((s) => ({ ...s, showLabels: !s.showLabels }))}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all ${
              settings.showLabels
                ? 'bg-zinc-800 text-mars-400 border border-mars-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Labels</span>
          </button>

          {/* Sunlight Toggle */}
          <button
            onClick={() =>
              onUpdateSettings((s) => ({ ...s, sunLighting: !s.sunLighting }))
            }
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all ${
              settings.sunLighting
                ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Sunlight</span>
          </button>

          {/* Terrain Shading / Flat Toggle */}
          <button
            onClick={() =>
              onUpdateSettings((s) => ({
                ...s,
                enableTerrainShading: !s.enableTerrainShading,
              }))
            }
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all ${
              settings.enableTerrainShading
                ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Shading</span>
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() =>
              onUpdateSettings((s) => ({ ...s, wireframeMode: !s.wireframeMode }))
            }
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all ${
              settings.wireframeMode
                ? 'bg-zinc-800 text-cyan-400 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>

          {/* Auto Rotate (globe mode only) */}
          {viewMode !== 'jezero-terrain' && (
            <button
              onClick={() =>
                onUpdateSettings((s) => ({ ...s, autoRotate: !s.autoRotate }))
              }
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all ${
                settings.autoRotate
                  ? 'bg-zinc-800 text-indigo-400 border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {settings.autoRotate ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>Orbit</span>
            </button>
          )}
        </div>

        {/* Elevation Exaggeration Slider (Terrain Mode) */}
        {viewMode === 'jezero-terrain' && (
          <div className="mt-2 pt-2 border-t border-zinc-800/80 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span>Elevation Exaggeration</span>
              <span className="text-mars-400 font-bold">
                {settings.elevationExaggeration}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.25"
              value={settings.elevationExaggeration}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings((s) => ({ ...s, elevationExaggeration: val }));
              }}
              className="w-full accent-mars-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Sun Angle Slider */}
        <div className="mt-1 pt-1.5 border-t border-zinc-800/80 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <span>Solar Azimuth</span>
            <span className="text-amber-400 font-bold">{settings.sunAngle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="15"
            value={settings.sunAngle}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onUpdateSettings((s) => ({ ...s, sunAngle: val }));
            }}
            className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
