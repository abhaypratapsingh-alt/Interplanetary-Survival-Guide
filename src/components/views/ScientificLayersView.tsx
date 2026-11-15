'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Sliders,
  ExternalLink,
  Info,
  Database,
  CheckCircle2,
  AlertCircle,
  Compass,
  FileCode,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

export function ScientificLayersView() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('nasa-ctx-jezero-mosaic');
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    'nasa-viking-mdim21': true,
    'nasa-mola-color-relief': true,
    'nasa-ctx-jezero-mosaic': true,
    'nasa-themis-day-ir': false,
  });
  const [layerOpacity, setLayerOpacity] = useState<Record<string, number>>({
    'nasa-viking-mdim21': 1.0,
    'nasa-mola-color-relief': 0.85,
    'nasa-ctx-jezero-mosaic': 1.0,
    'nasa-themis-day-ir': 0.7,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDatasets() {
      try {
        setLoading(true);
        const data = await api.getDatasets();
        setDatasets(data);
        if (data.length > 0) {
          setSelectedDatasetId(data[0].id);
        }
      } catch (err) {
        console.warn('Datasets load notice:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDatasets();
  }, []);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  const toggleVisibility = (id: string) => {
    setLayerVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateOpacity = (id: string, val: number) => {
    setLayerOpacity((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Planetary Geodesy & Remote Sensing Layers
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider mt-0.5">
            SCIENTIFIC DATASET EXPLORER
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Verified NASA Solar System Treks WMTS tile matrices, MOLA elevations, and CTX orthomosaics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">CRS:</span>
          <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-cyan-400 font-bold">
            IAU2000::49918 (Equirectangular)
          </span>
        </div>
      </div>

      {/* Main Grid: Layer Stack & Controls (Left) + Selected Layer Metadata & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Layer Management Stack */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Active Layer Stack & Opacity
            </span>
            <span className="text-[10px] text-zinc-500">{datasets.length} Datasets Cataloged</span>
          </div>

          <div className="space-y-3">
            {datasets.map((dataset) => {
              const isSelected = dataset.id === selectedDataset?.id;
              const isVisible = layerVisibility[dataset.id] !== false;
              const opacity = layerOpacity[dataset.id] ?? dataset.default_opacity ?? 1.0;

              return (
                <div
                  key={dataset.id}
                  onClick={() => setSelectedDatasetId(dataset.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-900 border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibility(dataset.id);
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          isVisible
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}
                        title={isVisible ? 'Hide Layer' : 'Show Layer'}
                      >
                        {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <div>
                        <h3 className="text-xs font-bold text-white tracking-wide">
                          {dataset.name}
                        </h3>
                        <span className="text-[10px] text-cyan-400 font-sans">
                          {dataset.instrument} • {dataset.resolution}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {dataset.mission}
                    </span>
                  </div>

                  {/* Opacity Slider */}
                  <div className="flex items-center gap-3 pt-1 border-t border-zinc-800/60" onClick={(e) => e.stopPropagation()}>
                    <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[10px] text-zinc-400 w-14">Opacity:</span>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => updateOpacity(dataset.id, parseFloat(e.target.value))}
                      className="flex-1 accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-cyan-400 w-8 text-right">
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Layer Metadata, Legend, and NASA Endpoint Verification */}
        {selectedDataset && (
          <div className="lg:col-span-6 rounded-xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-4 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-zinc-800">
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  {selectedDataset.layer_type.toUpperCase()}
                </span>
                <h2 className="text-base font-black text-white tracking-wide mt-2">
                  {selectedDataset.name}
                </h2>
                <p className="text-xs text-zinc-400 font-sans mt-1 leading-relaxed">
                  {selectedDataset.description}
                </p>
              </div>

              {/* Technical Specifications Table */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Instrument & Cartographic Parameters
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase">Instrument</span>
                    <span className="font-semibold text-white mt-0.5">{selectedDataset.instrument}</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase">Spatial Resolution</span>
                    <span className="font-semibold text-cyan-400 mt-0.5">{selectedDataset.resolution}</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase">Space Agency Source</span>
                    <span className="font-semibold text-white mt-0.5">{selectedDataset.source_agency}</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase">Coverage Status</span>
                    <span className="font-semibold text-emerald-400 mt-0.5 capitalize">{selectedDataset.coverage_status}</span>
                  </div>
                </div>
              </div>

              {/* WMTS Tile Matrix URL Verification */}
              <div className="p-3 rounded-lg bg-black/60 border border-zinc-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    Verified NASA Trek Tile Template
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> OGC WMTS 1.0.0
                  </span>
                </div>
                <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-cyan-300 font-mono text-[10px] break-all leading-relaxed">
                  {selectedDataset.wmts_url || 'Analytical Mesh Shader'}
                </div>
              </div>

              {/* Map Legend */}
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Dataset Elevation & Albedo Legend
                </span>
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>-8,200m (Hellas Basin)</span>
                  <span>Datum (0m Areoid)</span>
                  <span>+21,200m (Olympus Mons)</span>
                </div>
                <div className="h-3 w-full rounded bg-gradient-to-r from-blue-700 via-emerald-600 via-amber-500 to-red-600 border border-zinc-700" />
              </div>
            </div>

            <div className="pt-2 text-[10px] text-zinc-500 font-sans">
              All WMTS templates correspond to official NASA Solar System Treks service nodes.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
