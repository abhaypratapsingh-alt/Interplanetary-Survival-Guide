'use client';

import React from 'react';
import {
  Globe,
  Compass,
  Mountain,
  Navigation,
  Target,
  ChevronRight,
  Flame,
  Radio,
} from 'lucide-react';
import { MARS_LANDMARKS, JEZERO_CRATER_TARGET } from '@/lib/marsCoordinates';
import { MarsLocation, MapViewMode } from '@/types/map';

interface NavigationSidebarProps {
  selectedLocation: MarsLocation | null;
  onSelectLocation: (loc: MarsLocation) => void;
  viewMode: MapViewMode;
  onSetViewMode: (mode: MapViewMode) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function NavigationSidebar({
  selectedLocation,
  onSelectLocation,
  viewMode,
  onSetViewMode,
  isOpen,
  onToggle,
}: NavigationSidebarProps) {
  return (
    <aside
      className={`fixed top-14 left-0 bottom-8 z-20 flex flex-col transition-all duration-300 font-mono pointer-events-auto ${
        isOpen ? 'w-72 bg-zinc-950/90 backdrop-blur-md border-r border-zinc-800/80 shadow-2xl' : 'w-12 bg-zinc-950/60'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="h-10 px-3 flex items-center justify-between border-b border-zinc-800/80 text-zinc-400 hover:text-white transition-colors"
        title={isOpen ? 'Collapse Navigation Sidebar' : 'Expand Navigation Sidebar'}
      >
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-mars-400" />
          {isOpen && <span className="text-xs font-bold uppercase tracking-wider text-white">Navigation</span>}
        </div>
        <ChevronRight
          className={`w-4 h-4 text-zinc-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 text-xs">
          {/* Primary Mission Focus: Jezero Crater Spotlight Banner */}
          <div
            onClick={() => {
              onSelectLocation(JEZERO_CRATER_TARGET);
              if (viewMode === 'globe') {
                onSetViewMode('jezero-orbit');
              }
            }}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedLocation?.id === 'jezero-crater'
                ? 'bg-gradient-to-br from-mars-950/80 to-zinc-900 border-mars-500 shadow-[0_0_15px_rgba(217,83,47,0.3)]'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-mars-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-mars-400 animate-pulse" />
                <span className="font-bold text-white tracking-wide">Jezero Crater</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-mars-500/20 text-mars-300 font-bold border border-mars-500/30">
                PRIMARY
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Ancient paleolake delta & Perseverance rover landing corridor.
            </p>

            <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800/60 font-mono">
              <span>18.38° N, 77.58° E</span>
              <span className="text-mars-400 flex items-center gap-1">
                Explore <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Quick View Modes */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Camera Viewport
            </span>

            <button
              onClick={() => onSetViewMode('globe')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded border text-left transition-all ${
                viewMode === 'globe'
                  ? 'bg-zinc-800 text-white border-zinc-700 font-semibold'
                  : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Globe className="w-4 h-4 text-mars-400" />
              <div className="flex flex-col">
                <span className="text-xs">Global Planetary View</span>
                <span className="text-[9px] text-zinc-500">Free orbital spherical exploration</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectLocation(JEZERO_CRATER_TARGET);
                onSetViewMode('jezero-terrain');
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded border text-left transition-all ${
                viewMode === 'jezero-terrain'
                  ? 'bg-mars-950/70 border-mars-500 text-white font-semibold'
                  : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Mountain className="w-4 h-4 text-mars-400" />
              <div className="flex flex-col">
                <span className="text-xs">3D Local Terrain (Jezero)</span>
                <span className="text-[9px] text-zinc-500">High-resolution elevation mesh</span>
              </div>
            </button>
          </div>

          {/* Other Planetary Landmarks */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Planetary Catalog
            </span>

            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
              {MARS_LANDMARKS.map((landmark) => {
                const isSelected = selectedLocation?.id === landmark.id;
                return (
                  <button
                    key={landmark.id}
                    onClick={() => {
                      onSelectLocation(landmark);
                      if (viewMode === 'jezero-terrain' && landmark.id !== 'jezero-crater') {
                        onSetViewMode('globe');
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded border text-left transition-all ${
                      isSelected
                        ? 'bg-mars-950/50 border-mars-500 text-white font-semibold'
                        : 'bg-zinc-900/30 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs">{landmark.name}</span>
                      <span className="text-[9px] text-zinc-500 capitalize">
                        {landmark.type} • {landmark.coordinates.latitude > 0 ? `${landmark.coordinates.latitude}°N` : `${Math.abs(landmark.coordinates.latitude)}°S`}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-mars-400 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
