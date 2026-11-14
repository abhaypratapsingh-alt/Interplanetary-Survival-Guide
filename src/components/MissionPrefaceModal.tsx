'use client';

import React, { useState } from 'react';
import {
  Rocket,
  Compass,
  Mountain,
  Satellite,
  Layers,
  ChevronRight,
  ShieldCheck,
  MousePointer,
  Sparkles,
  Award,
  Globe2,
} from 'lucide-react';

interface MissionPrefaceModalProps {
  isOpen: boolean;
  onEnter: () => void;
}

export function MissionPrefaceModal({ isOpen, onEnter }: MissionPrefaceModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleLaunch = () => {
    if (dontShowAgain && typeof window !== 'undefined') {
      try {
        localStorage.setItem('mars_pathfinder_preface_dismissed', 'true');
      } catch (e) {
        // ignore localStorage errors
      }
    }
    onEnter();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-[0_0_80px_rgba(217,83,47,0.35)] overflow-hidden flex flex-col my-auto">
        {/* Top Glowing Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-mars-700 via-mars-500 to-amber-500" />

        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-zinc-800/80 bg-zinc-900/40 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mars-500 via-mars-600 to-mars-800 flex items-center justify-center shadow-[0_0_20px_rgba(217,83,47,0.5)] border border-mars-400/50">
              <Rocket className="w-6 h-6 text-white -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-mars-500/20 text-mars-400 border border-mars-500/30 uppercase">
                  NASA Space Apps Challenge 2026
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Telemetry Online
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider mt-1">
                MARS PATHFINDER AI
              </h1>
              <p className="text-xs text-zinc-400">
                Martian 3D Terrain Explorer • Mission Preface & Briefing
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Mission v2.1</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 sm:px-8 py-5 flex flex-col gap-5 max-h-[65vh] overflow-y-auto text-zinc-300 font-sans text-sm">
          {/* Executive Overview */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-mars-950/60 to-zinc-900/60 border border-mars-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-mars-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Mission Overview & Scientific Context</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
              Welcome to the <strong>Martian 3D Terrain Explorer</strong>, an interactive planetary visualization platform developed for the <strong>NASA Space Apps Challenge 2026</strong>. This module delivers a photorealistic 3D exploration experience of Mars with dedicated high-resolution focus on <strong>Jezero Crater (18.38° N, 77.58° E)</strong>, the prime landing zone of NASA’s Perseverance Rover and Ingenuity Helicopter.
            </p>
          </div>

          {/* Three Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            {/* Pillar 1 */}
            <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-mars-400 text-xs font-bold uppercase">
                <Globe2 className="w-4 h-4" />
                <span>3D Mars Globe</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Full planetary sphere with procedural regolith bump maps, custom atmospheric Rayleigh limb glow, and key landmark beacons.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                <Satellite className="w-4 h-4" />
                <span>NASA Trek WMTS</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Live streaming connection to official NASA JPL Mars Trek tiles: Viking MDIM 2.1 color mosaic and MGS MOLA elevation relief.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                <Mountain className="w-4 h-4" />
                <span>Jezero 3D Terrain</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Analytical 3D elevation displacement capturing the crater wall, Western Fan Delta, Neretva Vallis breach, and rover landing site.
              </p>
            </div>
          </div>

          {/* Telemetry & Interaction Guide */}
          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col gap-2 font-mono">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <MousePointer className="w-3.5 h-3.5 text-mars-400" /> Navigation & Controls
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-300">
              <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[9px] uppercase">Rotate</span>
                <span className="font-semibold text-white">Left Click + Drag</span>
              </div>
              <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[9px] uppercase">Zoom</span>
                <span className="font-semibold text-white">Mouse Scroll Wheel</span>
              </div>
              <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[9px] uppercase">Target Focus</span>
                <span className="font-semibold text-white">Click any Beacon</span>
              </div>
              <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[9px] uppercase">Terrain Mode</span>
                <span className="font-semibold text-white">Click 3D Terrain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Launch Action */}
        <div className="px-6 sm:px-8 py-4 border-t border-zinc-800/80 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="accent-mars-500 rounded cursor-pointer"
            />
            <span>Remember choice (do not show on startup)</span>
          </label>

          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-mars-600 via-mars-500 to-amber-500 hover:from-mars-500 hover:to-amber-400 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(217,83,47,0.5)] active:scale-95"
          >
            <span>Initialize Mission Control</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
