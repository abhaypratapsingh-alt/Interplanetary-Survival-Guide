'use client';

import React, { useState, useEffect } from 'react';
import {
  Maximize,
  Minimize,
  Radio,
  Rocket,
  Compass,
  Satellite,
  Eye,
  BookOpen,
} from 'lucide-react';
import { MapViewMode } from '@/types/map';

interface MissionHeaderProps {
  viewMode: MapViewMode;
  dataSource: string;
  onOpenSyncModal: () => void;
  onOpenPreface: () => void;
  isStreamingNASA?: boolean;
}

export function MissionHeader({
  viewMode,
  dataSource,
  onOpenSyncModal,
  onOpenPreface,
  isStreamingNASA = false,
}: MissionHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen request error:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen error:', err);
      });
    }
  };

  const getModeLabel = () => {
    switch (viewMode) {
      case 'globe':
        return 'Global Planetary Survey';
      case 'jezero-orbit':
        return 'Jezero Orbital Insertion';
      case 'jezero-terrain':
        return 'Jezero 3D Surface Topography';
    }
  };

  return (
    <header className="h-14 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 flex items-center justify-between select-none z-30 font-mono">
      {/* Left: Branding & Mission Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpenPreface} title="Open Mission Preface & Briefing">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-mars-500 via-mars-600 to-mars-800 flex items-center justify-center shadow-[0_0_15px_rgba(217,83,47,0.4)] border border-mars-400/40">
            <Rocket className="w-4 h-4 text-white -rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white">
                MARS PATHFINDER
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-mars-500/20 text-mars-400 font-bold border border-mars-500/30">
                AI
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 tracking-wide">
              NASA Space Apps 2026 • Martian 3D Terrain Explorer
            </span>
          </div>
        </div>

        <div className="hidden md:block w-[1px] h-6 bg-zinc-800 ml-2" />

        {/* Mission Target Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-xs">
          <Compass className="w-3.5 h-3.5 text-mars-400" />
          <span className="text-zinc-400">Target:</span>
          <span className="text-white font-semibold">Jezero Crater</span>
          <span className="text-[10px] text-zinc-500">(18.4°N, 77.5°E)</span>
        </div>
      </div>

      {/* Center: Live Mode Badge */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800/90 text-xs shadow-inner">
        <Eye className="w-3.5 h-3.5 text-mars-400 animate-pulse" />
        <span className="text-zinc-400 text-[11px]">Mode:</span>
        <span className="text-white font-medium text-[11px]">{getModeLabel()}</span>
      </div>

      {/* Right: Preface, NASA Trek Live Sync Button & Telemetry */}
      <div className="flex items-center gap-2.5">
        {/* Mission Preface Button */}
        <button
          onClick={onOpenPreface}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
          title="Open Mission Preface & Scientific Briefing"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Mission Preface</span>
        </button>

        {/* NASA Mars Trek Sync Button */}
        <button
          onClick={onOpenSyncModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-mars-950/90 to-zinc-900 border border-mars-500/60 hover:border-mars-400 text-xs font-semibold text-white shadow-[0_0_15px_rgba(217,83,47,0.3)] transition-all"
          title="Open NASA Mars Trek Live Connection & Telemetry"
        >
          <Satellite className="w-3.5 h-3.5 text-mars-400 animate-pulse" />
          <span className="hidden sm:inline">NASA Trek Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>

        {/* Data Source Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-xs">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-[11px] text-zinc-400">Stream:</span>
          <span className="text-[11px] text-emerald-300 font-medium truncate max-w-[160px]">
            {dataSource}
          </span>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
