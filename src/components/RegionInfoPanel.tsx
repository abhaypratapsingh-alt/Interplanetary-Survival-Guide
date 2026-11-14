'use client';

import React from 'react';
import {
  Compass,
  MapPin,
  Mountain,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
  Radio,
  ExternalLink,
  Bot,
} from 'lucide-react';
import { MarsLocation, MapViewMode } from '@/types/map';
import { TerrainFeature } from '@/types/terrain';
import { JEZERO_LOCAL_FEATURES } from '@/lib/terrainAdapter';

interface RegionInfoPanelProps {
  location: MarsLocation | null;
  selectedFeature: TerrainFeature | null;
  viewMode: MapViewMode;
  onSetViewMode: (mode: MapViewMode) => void;
  onSelectFeature: (feature: TerrainFeature) => void;
  onClose?: () => void;
}

export function RegionInfoPanel({
  location,
  selectedFeature,
  viewMode,
  onSetViewMode,
  onSelectFeature,
}: RegionInfoPanelProps) {
  if (!location) return null;

  const isJezero = location.id === 'jezero-crater';

  return (
    <aside className="w-80 md:w-96 max-h-[calc(100vh-7rem)] overflow-y-auto bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 rounded-lg p-4 shadow-2xl text-zinc-300 font-mono flex flex-col gap-4 pointer-events-auto">
      {/* Target Title & Type Header */}
      <div className="flex items-start justify-between pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-mars-500 animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-mars-400">
              Martian Exploration Target
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
            {location.name}
          </h2>
          <span className="text-xs text-zinc-400 capitalize">
            Geomorphic Feature: {location.type}
          </span>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-700/60 text-zinc-300">
          IAU ID: #020-JZ
        </span>
      </div>

      {/* Primary Coordinates & Telemetry Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Compass className="w-3 h-3 text-mars-400" /> Latitude
          </span>
          <span className="font-semibold text-white">
            {location.coordinates.latitude > 0
              ? `${location.coordinates.latitude.toFixed(4)}° N`
              : `${Math.abs(location.coordinates.latitude).toFixed(4)}° S`}
          </span>
        </div>

        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Compass className="w-3 h-3 text-mars-400" /> Longitude
          </span>
          <span className="font-semibold text-white">
            {location.coordinates.longitude.toFixed(4)}° E
          </span>
        </div>

        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-500">Elevation vs Datum</span>
          <span className="font-semibold text-white">
            {location.coordinates.altitudeKm
              ? `${(location.coordinates.altitudeKm * 1000).toLocaleString()} m`
              : 'Unknown'}
          </span>
        </div>

        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-500">Crater Diameter</span>
          <span className="font-semibold text-white">
            {location.diameterKm ? `${location.diameterKm} km` : 'Regional'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5 bg-zinc-900/40 p-3 rounded border border-zinc-800/60">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <Info className="w-3 h-3 text-mars-400" /> Scientific Description
        </span>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
          {location.description}
        </p>
      </div>

      {/* Mission Significance */}
      {location.missionConnection && (
        <div className="flex flex-col gap-1.5 bg-zinc-900/40 p-3 rounded border border-zinc-800/60">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400" /> Mission Connection
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {location.missionConnection}
          </p>
          {location.roverSite && (
            <div className="mt-1 text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded border border-emerald-900/40">
              <span className="font-bold">Landing Site: </span>
              {location.roverSite}
            </div>
          )}
        </div>
      )}

      {/* View Mode Action Button */}
      {isJezero && (
        <div className="pt-1">
          {viewMode !== 'jezero-terrain' ? (
            <button
              onClick={() => onSetViewMode('jezero-terrain')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-gradient-to-r from-mars-600 to-mars-500 hover:from-mars-500 hover:to-mars-400 text-white font-semibold text-xs transition-all shadow-[0_0_15px_rgba(217,83,47,0.4)]"
            >
              <Mountain className="w-4 h-4" />
              <span>Launch 3D Local Terrain Explorer</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onSetViewMode('globe')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs transition-all"
            >
              <Compass className="w-4 h-4 text-mars-400" />
              <span>Return to Planetary Globe</span>
            </button>
          )}
        </div>
      )}

      {/* Jezero Regional Geological Features (When in terrain mode) */}
      {isJezero && viewMode === 'jezero-terrain' && (
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Key Regional Features</span>
            <span className="text-mars-400">{JEZERO_LOCAL_FEATURES.length} Cataloged</span>
          </span>

          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {JEZERO_LOCAL_FEATURES.map((feat) => {
              const isSelected = selectedFeature?.id === feat.id;
              return (
                <div
                  key={feat.id}
                  onClick={() => onSelectFeature(feat)}
                  className={`p-2 rounded border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-mars-950/60 border-mars-500 text-white shadow-[0_0_10px_rgba(217,83,47,0.3)]'
                      : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{feat.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {feat.elevationMeters}m
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2 font-sans">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dataset Specifications & NASA Readiness */}
      <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-800/60 text-[10px] flex flex-col gap-1">
        <span className="text-zinc-500 font-bold uppercase tracking-wider">
          Terrain Dataset Architecture
        </span>
        <div className="flex justify-between">
          <span className="text-zinc-400">Dataset Status:</span>
          <span className="text-amber-400 font-medium">Analytical Prototype Model</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Target Resolution:</span>
          <span className="text-white">HiRISE DTM 1.0m / MOLA 463m</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Projection:</span>
          <span className="text-white">IAU 2000 Mars Equirectangular</span>
        </div>
      </div>
    </aside>
  );
}
