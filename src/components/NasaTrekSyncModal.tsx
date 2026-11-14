'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Radio,
  Satellite,
  Compass,
  Layers,
  CheckCircle,
  Copy,
  Check,
  Maximize2,
  RefreshCw,
  Globe2,
} from 'lucide-react';
import { NASATrekEngine } from '@/lib/nasaTrekEngine';

interface NasaTrekSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayer: string;
  onSelectLayer: (layer: string) => void;
  streamProgress: number;
  isStreaming: boolean;
}

export function NasaTrekSyncModal({
  isOpen,
  onClose,
  activeLayer,
  onSelectLayer,
  streamProgress,
  isStreaming,
}: NasaTrekSyncModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(NASATrekEngine.USER_TREK_PORTAL_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openNASAWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=1280,height=800');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-[0_0_50px_rgba(217,83,47,0.25)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-mars-600/30 border border-mars-500/50 flex items-center justify-center">
              <Satellite className="w-4 h-4 text-mars-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  NASA Mars Trek Live Connection
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CORS Connected
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Official NASA JPL Web Map Tile Service (WMTS) integration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Active Live Tile Stream Status */}
          <div className="p-3.5 rounded-lg bg-gradient-to-r from-mars-950/70 via-zinc-900/80 to-zinc-900 border border-mars-500/40 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-semibold flex items-center gap-2">
                <Radio className="w-4 h-4 text-mars-400 animate-pulse" />
                Real NASA Trek Tile Streaming Engine
              </span>
              <span className="text-mars-400 font-bold">
                {isStreaming ? `Streaming (${streamProgress}%)` : 'Active in 3D Viewport'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-mars-500 to-amber-400 h-1.5 transition-all duration-300"
                style={{ width: `${isStreaming ? streamProgress : 100}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              Real binary JPEG tiles are fetched asynchronously from <code className="text-mars-300">trek.nasa.gov</code> and mapped onto the 3D globe and Jezero 3D terrain mesh in real time with elevation displacement.
            </p>
          </div>

          {/* Quick Select Real NASA Layers */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-mars-400" /> Choose Real NASA Imagery
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onSelectLayer('nasa-viking-mdim21')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeLayer === 'nasa-viking-mdim21'
                    ? 'bg-mars-950/80 border-mars-500 shadow-[0_0_15px_rgba(217,83,47,0.3)] text-white'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Viking MDIM 2.1 Color</span>
                  {activeLayer === 'nasa-viking-mdim21' && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 font-sans">
                  Real photographic global color mosaic (USGS / NASA JPL).
                </p>
              </button>

              <button
                onClick={() => onSelectLayer('nasa-mola-color-relief')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeLayer === 'nasa-mola-color-relief'
                    ? 'bg-mars-950/80 border-mars-500 shadow-[0_0_15px_rgba(217,83,47,0.3)] text-white'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">MOLA Shaded Elevation</span>
                  {activeLayer === 'nasa-mola-color-relief' && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 font-sans">
                  Topographic laser altimeter elevation color relief.
                </p>
              </button>
            </div>
          </div>

          {/* NASA Trek Exact Session Launchers */}
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-mars-400" /> Launch Exact NASA Trek Session
            </span>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => openNASAWindow(NASATrekEngine.USER_TREK_PORTAL_URL)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-medium text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-mars-400" />
                <span>Open User Session Map</span>
              </button>

              <button
                onClick={() => openNASAWindow(NASATrekEngine.JEZERO_TREK_PORTAL_URL)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-mars-600 to-mars-500 hover:from-mars-500 hover:to-mars-400 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(217,83,47,0.4)]"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Open Jezero Crater on Trek (Zoom 6)</span>
              </button>
            </div>
          </div>

          {/* Exact Connection URL Parameter Inspector */}
          <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 text-[10px] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-bold uppercase tracking-wider">
                Target Projection & CRS Parameters
              </span>
              <button
                onClick={handleCopyLink}
                className="text-zinc-400 hover:text-white flex items-center gap-1 text-[10px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy NASA URL'}</span>
              </button>
            </div>
            <div className="bg-black/60 p-2 rounded border border-zinc-800/80 text-zinc-300 break-all font-mono leading-relaxed">
              {NASATrekEngine.USER_TREK_PORTAL_URL}
            </div>
            <div className="flex flex-wrap gap-2 text-zinc-400 mt-1">
              <span>CRS: <strong className="text-white">IAU2000::49918 (Equirectangular)</strong></span>
              <span>•</span>
              <span>Body: <strong className="text-white">Mars</strong></span>
              <span>•</span>
              <span>TileMatrixSet: <strong className="text-white">default028mm</strong></span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 flex justify-end bg-zinc-900/40">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
          >
            Close & Return to 3D Map
          </button>
        </div>
      </div>
    </div>
  );
}
