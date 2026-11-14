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
  Wifi,
  WifiOff,
  CircleDot,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

interface MissionHeaderProps {
  onOpenPreface: () => void;
  onOpenSyncModal: () => void;
  isStreamingNASA?: boolean;
}

export function MissionHeader({
  onOpenPreface,
  onOpenSyncModal,
  isStreamingNASA = false,
}: MissionHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [missionClock, setMissionClock] = useState('');

  // Backend health check
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkHealth = async () => {
      try {
        await api.getHealth();
        setBackendStatus('connected');
      } catch {
        setBackendStatus('disconnected');
      }
    };

    checkHealth();
    interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Mission elapsed clock (Sol counter simulation)
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setMissionClock(`${h}:${m}:${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="h-14 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 flex items-center justify-between select-none z-30 font-mono">
      {/* Left: Branding & Mission Badge */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={onOpenPreface}
          title="Open Mission Preface & Briefing"
        >
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-mars-500 via-mars-600 to-mars-800 flex items-center justify-center shadow-[0_0_15px_rgba(217,83,47,0.4)] border border-mars-400/40">
            <Rocket className="w-4 h-4 text-white -rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white">
                MARS PATHFINDER
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-mars-500/20 text-mars-400 font-bold border border-mars-500/30">
                AI
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 tracking-wide">
              NASA Space Apps 2026 • Mission Control
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

      {/* Center: Backend Status + Mission Clock */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Backend Connection */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] ${
            backendStatus === 'connected'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : backendStatus === 'disconnected'
              ? 'bg-red-950/40 border-red-500/30 text-red-400'
              : 'bg-zinc-900/60 border-zinc-700 text-zinc-400'
          }`}
        >
          {backendStatus === 'connected' ? (
            <Wifi className="w-3 h-3" />
          ) : backendStatus === 'disconnected' ? (
            <WifiOff className="w-3 h-3" />
          ) : (
            <CircleDot className="w-3 h-3 animate-pulse" />
          )}
          <span className="font-medium">
            {backendStatus === 'connected'
              ? 'Backend Online'
              : backendStatus === 'disconnected'
              ? 'Backend Offline'
              : 'Connecting...'}
          </span>
        </div>

        {/* Mission Clock */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400">
          <Eye className="w-3 h-3 text-mars-400" />
          <span>UTC</span>
          <span className="text-white font-bold tabular-nums">{missionClock}</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2.5">
        {/* Mission Preface Button */}
        <button
          onClick={onOpenPreface}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
          title="Open Mission Preface"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Briefing</span>
        </button>

        {/* NASA Mars Trek Sync Button */}
        <button
          onClick={onOpenSyncModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-mars-950/90 to-zinc-900 border border-mars-500/60 hover:border-mars-400 text-xs font-semibold text-white shadow-[0_0_15px_rgba(217,83,47,0.3)] transition-all"
          title="NASA Mars Trek Live Connection"
        >
          <Satellite className="w-3.5 h-3.5 text-mars-400 animate-pulse" />
          <span className="hidden sm:inline">NASA Trek</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
