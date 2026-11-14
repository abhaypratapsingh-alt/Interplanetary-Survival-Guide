'use client';

import React from 'react';
import { Compass, Crosshair, Eye, Cpu, Activity } from 'lucide-react';
import { GeoCoordinates, MapViewMode } from '@/types/map';

interface CoordinateDisplayProps {
  cursorCoords: { lat: number; lon: number } | null;
  selectedCoords?: GeoCoordinates | null;
  viewMode: MapViewMode;
  sunAngle: number;
}

export function CoordinateDisplay({
  cursorCoords,
  selectedCoords,
  viewMode,
  sunAngle,
}: CoordinateDisplayProps) {
  const formatLat = (lat: number) => {
    return lat >= 0 ? `${lat.toFixed(3)}° N` : `${Math.abs(lat).toFixed(3)}° S`;
  };

  const formatLon = (lon: number) => {
    return `${lon.toFixed(3)}° E`;
  };

  return (
    <footer className="h-8 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/80 px-4 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none z-30">
      {/* Left: Active Cursor Position on Mars */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-mars-400" />
          <span className="text-zinc-500">Surface Cursor:</span>
          {cursorCoords ? (
            <span className="text-white font-medium">
              {formatLat(cursorCoords.lat)}, {formatLon(cursorCoords.lon)}
            </span>
          ) : (
            <span className="text-zinc-600 italic">Hover surface</span>
          )}
        </div>

        {selectedCoords && (
          <div className="hidden md:flex items-center gap-1.5 border-l border-zinc-800 pl-4">
            <Compass className="w-3.5 h-3.5 text-red-400" />
            <span className="text-zinc-500">Focal Target:</span>
            <span className="text-zinc-300 font-medium">
              {formatLat(selectedCoords.latitude)}, {formatLon(selectedCoords.longitude)}
            </span>
          </div>
        )}
      </div>

      {/* Center: Solar Lighting Angle / Subsolar Azimuth */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-zinc-500">Solar Elevation:</span>
        <span className="text-amber-400 font-medium">{sunAngle}°</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-500">Datum:</span>
        <span className="text-zinc-300">Areoid 3389.5 km</span>
      </div>

      {/* Right: Engine Telemetry & WebGL Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-semibold">WebGL 2.0</span>
          <span className="text-zinc-500 hidden md:inline">• 60 FPS</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[10px] text-zinc-500 border-l border-zinc-800 pl-3">
          <span>Three.js r174</span>
          <span>•</span>
          <span>BufferGeometry</span>
        </div>
      </div>
    </footer>
  );
}
