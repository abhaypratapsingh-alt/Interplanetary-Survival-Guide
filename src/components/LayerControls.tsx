'use client';

import React, { useState } from 'react';
import { Layers, Database, ExternalLink, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { OFFICIAL_NASA_LAYERS, OFFICIAL_ELEVATION_SOURCES } from '@/lib/nasaLayerAdapter';
import { ImageryLayer, ElevationSource } from '@/types/layers';

interface LayerControlsProps {
  activeLayerId: string;
  onSelectLayer: (layerId: string) => void;
  activeElevationId: string;
  onSelectElevation: (sourceId: string) => void;
}

export function LayerControls({
  activeLayerId,
  onSelectLayer,
  activeElevationId,
  onSelectElevation,
}: LayerControlsProps) {
  const [activeTab, setActiveTab] = useState<'imagery' | 'elevation'>('imagery');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative pointer-events-auto">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all backdrop-blur-md shadow-xl ${
          isOpen
            ? 'bg-mars-950/90 border-mars-500 text-mars-300'
            : 'bg-zinc-950/85 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
        }`}
      >
        <Database className="w-3.5 h-3.5 text-mars-400" />
        <span>NASA Data Layers</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Layer Modal / Dropdown */}
      {isOpen && (
        <div className="absolute top-10 left-0 w-80 max-h-[80vh] overflow-y-auto bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 rounded-lg p-3 shadow-2xl z-50 flex flex-col gap-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-mars-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Planetary Data Adapters
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          {/* Sub tabs */}
          <div className="flex rounded bg-zinc-900/80 p-0.5 text-[11px]">
            <button
              onClick={() => setActiveTab('imagery')}
              className={`flex-1 py-1 rounded transition-all ${
                activeTab === 'imagery'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Raster Imagery
            </button>
            <button
              onClick={() => setActiveTab('elevation')}
              className={`flex-1 py-1 rounded transition-all ${
                activeTab === 'elevation'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Elevation (DEM)
            </button>
          </div>

          {/* Tab 1: Imagery Layers */}
          {activeTab === 'imagery' && (
            <div className="flex flex-col gap-2">
              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-mars-400" />
                <span>WMTS & Planetary Mosaic Providers</span>
              </div>

              {OFFICIAL_NASA_LAYERS.map((layer) => {
                const isSelected = activeLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-mars-950/40 border-mars-500/80 shadow-[0_0_10px_rgba(217,83,47,0.2)]'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">
                          {layer.name}
                        </span>
                        <span className="text-[10px] text-mars-400 font-medium">
                          {layer.provider}
                        </span>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0 mt-0.5" />
                      )}
                    </div>

                    <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed font-sans">
                      {layer.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[9px] text-zinc-500 pt-1.5 border-t border-zinc-800/60">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800/70 text-zinc-300">
                        {layer.dataQuality === 'official-nasa-ready'
                          ? 'NASA WMTS Ready'
                          : layer.dataQuality === 'high-res'
                          ? 'HiRISE PDS Ready'
                          : 'Procedural Prototype'}
                      </span>
                      {layer.wmtsUrlPattern && (
                        <span className="text-blue-400 flex items-center gap-0.5 hover:underline">
                          Trek Tile <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Elevation Sources */}
          {activeTab === 'elevation' && (
            <div className="flex flex-col gap-2">
              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-mars-400" />
                <span>Topographic Displacement Datasets</span>
              </div>

              {OFFICIAL_ELEVATION_SOURCES.map((source) => {
                const isSelected = activeElevationId === source.id;
                return (
                  <div
                    key={source.id}
                    onClick={() => onSelectElevation(source.id)}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-mars-950/40 border-mars-500/80 shadow-[0_0_10px_rgba(217,83,47,0.2)]'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">
                          {source.name}
                        </span>
                        <span className="text-[10px] text-mars-400 font-medium">
                          {source.instrument}
                        </span>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0 mt-0.5" />
                      )}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-zinc-400 bg-zinc-900/70 p-1.5 rounded">
                      <div>
                        <span className="text-zinc-500 block text-[9px]">Vertical:</span>
                        <span>{source.verticalResolution}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px]">Horizontal:</span>
                        <span>{source.spatialResolution}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                      <span>Datum: IAU 2000 Areoid</span>
                      <span className="text-emerald-400">
                        {source.geotiffReady ? 'GeoTIFF Ready' : 'Analytical Mesh'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* NASA Integration Notice */}
          <div className="p-2 bg-zinc-900/80 rounded border border-zinc-800 text-[10px] text-zinc-400 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-tight font-sans">
              Configured for NASA Space Apps 2026. Data adapters match NASA Mars Trek WMTS and USGS GeoTIFF specifications.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
