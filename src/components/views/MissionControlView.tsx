'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Heart,
  Brain,
  Zap,
  Footprints,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Radio,
  X,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '@/lib/apiClient';

interface MissionControlViewProps {
  onNavigate?: (page: string) => void;
}

export function MissionControlView({ onNavigate }: MissionControlViewProps) {
  // Auth state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<any | null>(null);

  // Missions state
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadingMissions, setLoadingMissions] = useState<boolean>(true);

  // Active astronaut in mission
  const [selectedAstronautId, setSelectedAstronautId] = useState<number | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);
  const [isTickActive, setIsTickActive] = useState<boolean>(true);

  // Selected mineral for modal
  const [selectedMineral, setSelectedMineral] = useState<any | null>(null);
  const [isCreateMissionOpen, setIsCreateMissionOpen] = useState<boolean>(false);

  // Mineral view tab
  const [mineralViewMode, setMineralViewMode] = useState<'structure' | 'composition'>('structure');

  // Verify Admin Authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        setAuthChecking(true);
        const me = await api.getAuthMe();
        if (me && me.role === 'admin') {
          setIsAdmin(true);
          setAdminUser(me);
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch missions when admin
  const fetchMissions = async () => {
    try {
      setLoadingMissions(true);
      const data = await api.getAdminMissions(statusFilter);
      setMissions(data);
      if (data.length > 0 && selectedMissionId === null) {
        setSelectedMissionId(data[0].id);
        if (data[0].astronauts && data[0].astronauts.length > 0) {
          setSelectedAstronautId(data[0].astronauts[0].id);
        }
      }
    } catch (e) {
      console.warn('Mission control fetch error:', e);
    } finally {
      setLoadingMissions(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchMissions();
    }
  }, [isAdmin, statusFilter]);

  // Selected mission object
  const currentMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  // Selected astronaut object
  const astronauts = currentMission?.astronauts || [];
  const currentAstronaut =
    astronauts.find((a: any) => a.id === selectedAstronautId) || astronauts[0];

  // Fetch telemetry history when astronaut changes
  const fetchTelemetryHistory = async (astroId: number) => {
    try {
      const data = await api.getAstronautTelemetryHistory(astroId, 25);
      const chartPoints = data.map((t: any, idx: number) => ({
        time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        hr: t.heart_rate_bpm,
        stress: t.stress_level,
        cognitive: t.cognitive_performance,
        o2: t.oxygen_level_pct,
        suit_p: t.suit_pressure_kpa,
        eeg_alpha: t.eeg_alpha,
        eeg_beta: t.eeg_beta,
      }));
      setTelemetryHistory(chartPoints);
    } catch (e) {
      console.warn('Telemetry load notice:', e);
    }
  };

  useEffect(() => {
    if (currentAstronaut) {
      fetchTelemetryHistory(currentAstronaut.id);
    }
  }, [currentAstronaut?.id]);

  // Real-time telemetry tick loop (simulates continuous wearable sensor streaming)
  useEffect(() => {
    if (!isAdmin || !isTickActive || !currentAstronaut) return;

    const interval = setInterval(async () => {
      try {
        const tick = await api.tickAstronautTelemetry(currentAstronaut.id);
        const newPoint = {
          time: new Date(tick.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          hr: tick.heart_rate_bpm,
          stress: tick.stress_level,
          cognitive: tick.cognitive_performance,
          o2: tick.oxygen_level_pct,
          suit_p: tick.suit_pressure_kpa,
          eeg_alpha: tick.eeg_alpha,
          eeg_beta: tick.eeg_beta,
        };
        setTelemetryHistory((prev) => [...prev.slice(-24), newPoint]);

        // Update current astronaut latest telemetry in local state
        setMissions((prevMissions) =>
          prevMissions.map((m) => {
            if (m.id === currentMission.id) {
              return {
                ...m,
                astronauts: m.astronauts.map((a: any) =>
                  a.id === currentAstronaut.id ? { ...a, latest_telemetry: tick } : a
                ),
              };
            }
            return m;
          })
        );
      } catch (err) {
        // silent retry
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAdmin, isTickActive, currentAstronaut?.id]);

  // Auth gate
  if (authChecking) {
    return (
      <div className="h-full flex flex-col items-center justify-center font-mono text-xs text-zinc-400 gap-3">
        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
        <span>Validating Lead Flight Director Security Clearance...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-full overflow-y-auto p-6 flex flex-col items-center justify-center text-center font-mono select-none">
        <div className="max-w-md p-8 rounded-2xl bg-zinc-950/90 border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.15)] flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-500/40 flex items-center justify-center text-red-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-white tracking-wider">
            MISSION CONTROL ACCESS RESTRICTED
          </h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            This module contains confidential interplanetary astronaut biometrics, deep space mission operations, and verified mineral discoveries.
          </p>
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-300 w-full text-left font-mono">
            <div>Authorized Admin: <strong className="text-cyan-400">abhay1307</strong></div>
            <div>Clearance: <span className="text-emerald-400">Lead Flight Director</span></div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('settings')}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            Authenticate via Settings
          </button>
        </div>
      </div>
    );
  }

  const latestTel = currentAstronaut?.latest_telemetry || {};

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* 1. Header ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
              NASA Planetary Mission Operations & Bio-Telemetry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider mt-0.5 flex items-center gap-2">
            <span>MISSION CONTROL COMMAND & HEALTH SYSTEM</span>
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Authenticated Administrator: <strong className="text-cyan-400">{adminUser?.name || 'abhay1307'}</strong> ({adminUser?.email || 'abhaypratapsingh@gmail.com'}) • Full Write Access
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live telemetry pause/resume */}
          <button
            onClick={() => setIsTickActive(!isTickActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isTickActive
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
            title="Toggle Live Wearable Sensor Streaming"
          >
            <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isTickActive ? 'animate-pulse' : ''}`} />
            <span>{isTickActive ? 'Bio-Telemetry Stream: Active' : 'Stream Paused'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchMissions}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            title="Refresh All Operations"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* 2. Top Missions Overview & Selector Banner */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Planetary Expeditions & Campaigns ({missions.length})
            </span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 text-[11px]">
            {['all', 'active', 'completed', 'paused', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-black font-bold shadow'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Mission Cards Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {missions.map((m) => {
            const isSelected = m.id === currentMission?.id;
            return (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMissionId(m.id);
                  if (m.astronauts && m.astronauts.length > 0) {
                    setSelectedAstronautId(m.astronauts[0].id);
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/60 via-zinc-900 to-zinc-900 border-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.2)] ring-1 ring-cyan-500'
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 text-zinc-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      {m.code}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{m.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      m.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : m.status === 'completed'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800/60">
                  <div>
                    <span className="text-zinc-500 block">Planet / Region</span>
                    <span className="text-zinc-200">{m.destination_planet} • {m.region}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Coordinates</span>
                    <span className="text-cyan-400">{m.target_coordinates_lat}°N, {m.target_coordinates_lon}°E</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Admin Owner</span>
                    <span className="text-zinc-300 font-semibold">{m.created_by_admin}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Crew Members</span>
                    <span className="text-white font-bold">{m.astronauts?.length || 0} Astronauts</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-zinc-500">Mission Duration: {m.duration_days} Days</span>
                    <span className="text-cyan-400">{m.progress_percent}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1 rounded-full transition-all"
                      style={{ width: `${m.progress_percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ASTRONAUT BIOMETRICS & WEARABLE HEALTH DASHBOARD */}
      {currentMission && (
        <div className="rounded-2xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-5 shadow-2xl">
          {/* Astronaut Selector Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Astronaut Wearable Bio-Telemetry & Neurological Diagnostics
                </h2>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Continuous real-time telemetry from EVA smartsuit physiological sensors (EEG, ECG, metabolic consumption, suit pressure).
              </p>
            </div>

            {/* Crew Member switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 uppercase">Select Crew:</span>
              <div className="flex gap-1.5">
                {astronauts.map((astro: any) => {
                  const isAstroSelected = astro.id === currentAstronaut?.id;
                  return (
                    <button
                      key={astro.id}
                      onClick={() => setSelectedAstronautId(astro.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        isAstroSelected
                          ? 'bg-gradient-to-r from-cyan-950 to-zinc-900 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          astro.status === 'nominal' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                        }`}
                      />
                      <span>{astro.callsign || astro.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {currentAstronaut ? (
            <div className="space-y-5">
              {/* Astronaut Profile Summary Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900/80 via-zinc-900/40 to-black border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/40 bg-zinc-800 shrink-0">
                    <img
                      src={currentAstronaut.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                      alt={currentAstronaut.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{currentAstronaut.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {currentAstronaut.callsign}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans mt-0.5">
                      {currentAstronaut.role} • Blood Group: <strong className="text-white">{currentAstronaut.blood_type}</strong> • Smartsuit: <code className="text-cyan-400">{currentAstronaut.suit_id}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block">Overall Score</span>
                    <span className="text-sm font-black text-emerald-400">{latestTel.overall_health_score || 96}%</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block">Movement</span>
                    <span className="text-xs font-bold text-cyan-300 capitalize">{latestTel.movement_state || 'Active Walk'}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block">Vitals Status</span>
                    <span className="text-xs font-bold text-emerald-400 uppercase">{currentAstronaut.status}</span>
                  </div>
                </div>
              </div>

              {/* 6 Biometric Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* A. HEART RATE */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-red-400 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 animate-pulse" /> A. Heart Rate (ECG)
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        latestTel.heart_rate_status === 'normal'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      {latestTel.heart_rate_status || 'normal'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{latestTel.heart_rate_bpm || 72}</span>
                    <span className="text-xs text-red-400 font-bold">BPM</span>
                    <span className="text-[10px] text-zinc-500 ml-auto">Nominal: 60-100</span>
                  </div>

                  {/* Sparkline ECG */}
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={telemetryHistory}>
                        <defs>
                          <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="hr"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fill="url(#hrGrad)"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* B. MENTAL CONDITION */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" /> B. Mental Condition
                    </span>
                    <span className="text-[10px] text-zinc-400">Cortisol / Cognitive</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Stress Indicator:</span>
                      <span className="font-bold text-amber-400">{latestTel.stress_level || 24}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Alertness Level:</span>
                      <span className="font-bold text-cyan-400">{latestTel.alertness_level || 92}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Cognitive Performance:</span>
                      <span className="font-bold text-emerald-400">{latestTel.cognitive_performance || 95}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Mental Fatigue:</span>
                      <span className="font-bold text-zinc-300">{latestTel.mental_fatigue || 18}%</span>
                    </div>
                  </div>
                </div>

                {/* C. NEURAL ACTIVITY (EEG) */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-purple-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> C. Neural Activity (EEG)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {latestTel.eeg_signal_status || 'SYNCHRONIZED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block">Alpha</span>
                      <span className="text-sm font-bold text-purple-400">{latestTel.eeg_alpha || 10.2} Hz</span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block">Beta</span>
                      <span className="text-sm font-bold text-cyan-400">{latestTel.eeg_beta || 18.5} Hz</span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block">Theta</span>
                      <span className="text-sm font-bold text-amber-400">{latestTel.eeg_theta || 5.4} Hz</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-500 font-mono text-center">
                    Cerebral rhythm shows focused executive state during sample collection.
                  </div>
                </div>

                {/* D. BODY MOVEMENT */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5" /> D. Body Movement & Activity
                    </span>
                    <span className="text-[10px] text-zinc-400">IMU Accelerometer</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-white">{latestTel.steps_count || 4280}</span>
                      <span className="text-xs text-zinc-400 ml-1">EVA Steps</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{latestTel.activity_level || 65}% Load</span>
                  </div>

                  <div className="p-2.5 rounded bg-black/40 border border-zinc-850 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Current Motion:</span>
                    <span className="font-bold text-white uppercase">{latestTel.movement_state || 'Active Walk'}</span>
                  </div>
                </div>

                {/* E. SPACE SUIT MONITORING */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> E. Space Suit Life Support
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      SEALED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500">Internal Pressure:</span>
                      <span className="font-bold text-white">{latestTel.suit_pressure_kpa || 29.6} kPa</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500">Oxygen Level:</span>
                      <span className="font-bold text-cyan-400">{latestTel.oxygen_level_pct || 98.5}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500">O2 Consumption:</span>
                      <span className="font-bold text-white">{latestTel.oxygen_consumption_l_min || 1.35} L/min</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500">CO2 Partial Pres:</span>
                      <span className="font-bold text-emerald-400">{latestTel.co2_level_mmhg || 2.1} mmHg</span>
                    </div>
                  </div>
                </div>

                {/* F. GENERAL HEALTH */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> F. General Health & Warnings
                    </span>
                    <span className="text-[10px] text-zinc-400">Core Temp: {latestTel.body_temp_c || 36.8}°C</span>
                  </div>

                  <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-xs">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">
                      Medical Advisory:
                    </span>
                    <span className="text-amber-300 font-sans">{latestTel.medical_warning || 'All Biometrics Nominal'}</span>
                  </div>

                  <div className="text-[10px] text-zinc-500 flex justify-between">
                    <span>Tele-diagnostics: Automated AI Doc</span>
                    <span className="text-emerald-400">Ready for EVA</span>
                  </div>
                </div>
              </div>

              {/* Live Multi-Parameter Telemetry Chart */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    Real-time Wearable Biometrics Waveform (Last 25 Ticks)
                  </span>
                  <span className="text-[10px] text-zinc-500">Sample Frequency: 0.25 Hz</span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetryHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} />
                      <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#05070a',
                          borderColor: '#00f0ff',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="hr"
                        name="Heart Rate (BPM)"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="stress"
                        name="Stress (%)"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="cognitive"
                        name="Cognitive Score"
                        stroke="#00f0ff"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No astronauts assigned to this mission.
            </div>
          )}
        </div>
      )}

      {/* 4. MINERAL DISCOVERY DASHBOARD (Inspired by user's reference UI) */}
      {currentMission && (
        <div className="rounded-2xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Mineral Discovery & Astrobiology Geological Ledger
                </h2>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Curated samples extracted by mission crew and verified with remote Raman/APXS spectrometry.
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-xs">
              <button
                onClick={() => setMineralViewMode('structure')}
                className={`px-3 py-1 rounded-md transition-all ${
                  mineralViewMode === 'structure'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Structure View
              </button>
              <button
                onClick={() => setMineralViewMode('composition')}
                className={`px-3 py-1 rounded-md transition-all ${
                  mineralViewMode === 'composition'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Composition Ratio
              </button>
            </div>
          </div>

          {/* Minerals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMission.mineral_discoveries?.map((mineral: any) => (
              <div
                key={mineral.id}
                onClick={() => setSelectedMineral(mineral)}
                className="group relative rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-500/60 bg-zinc-900/60 p-4 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] text-amber-400 uppercase font-bold tracking-widest block">
                      {mineral.mineral_type}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      {mineral.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-bold">
                    {mineral.verification_status.replace('_', ' ')}
                  </span>
                </div>

                {/* Sample Photo Frame */}
                <div className="relative h-32 rounded-lg overflow-hidden border border-zinc-800 bg-black">
                  <img
                    src={mineral.sample_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}
                    alt={mineral.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] font-mono text-zinc-300">
                      Formula: <strong className="text-amber-400">{mineral.chemical_formula}</strong>
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono pt-2 border-t border-zinc-800/80">
                  <div className="p-1 rounded bg-black/40 text-center">
                    <span className="text-zinc-500 block">Mass</span>
                    <span className="text-white font-bold">{mineral.quantity_discovered_kg} kg</span>
                  </div>
                  <div className="p-1 rounded bg-black/40 text-center">
                    <span className="text-zinc-500 block">Purity</span>
                    <span className="text-emerald-400 font-bold">{mineral.purity_pct}%</span>
                  </div>
                  <div className="p-1 rounded bg-black/40 text-center">
                    <span className="text-zinc-500 block">Elevation</span>
                    <span className="text-cyan-400 font-bold">{mineral.elevation_m}m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                  <span>Found: {mineral.discovered_by_astronaut || 'Flight Crew'}</span>
                  <span className="text-amber-400 flex items-center gap-1 font-bold">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MISSION ACTIVITY TIMELINE */}
      {currentMission && (
        <div className="rounded-2xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Live Mission Activity Timeline & Milestones
              </h2>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Tracked Events: {currentMission.events?.length || 0}
            </span>
          </div>

          <div className="space-y-3">
            {currentMission.events?.map((ev: any, idx: number) => {
              const severityIcons: Record<string, any> = {
                success: CheckCircle2,
                warning: AlertTriangle,
                info: Clock,
                emergency: ShieldAlert,
              };
              const IconComp = severityIcons[ev.severity] || Clock;

              return (
                <div
                  key={ev.id || idx}
                  className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      ev.severity === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : ev.severity === 'warning'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-white tracking-wide">{ev.title}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(ev.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans mt-0.5 leading-relaxed">
                      {ev.description}
                    </p>
                    {ev.coordinates_lat && (
                      <div className="mt-1 text-[9px] font-mono text-cyan-400">
                        Geo-tag: {ev.coordinates_lat}°N, {ev.coordinates_lon}°E
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MINERAL DETAIL MODAL */}
      {selectedMineral && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl relative font-mono">
            <button
              onClick={() => setSelectedMineral(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase">
                {selectedMineral.mineral_type}
              </span>
              <h2 className="text-base font-bold text-white">{selectedMineral.name}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="h-48 rounded-xl overflow-hidden border border-zinc-800 bg-black">
                <img
                  src={selectedMineral.sample_image_url}
                  alt={selectedMineral.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Chemical Formula</span>
                  <span className="text-sm font-bold text-amber-400">{selectedMineral.chemical_formula}</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Location & Elevation</span>
                  <span className="text-white font-mono">{selectedMineral.discovery_lat}°N, {selectedMineral.discovery_lon}°E ({selectedMineral.elevation_m}m)</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Discovered By</span>
                  <span className="text-cyan-400 font-semibold">{selectedMineral.discovered_by_astronaut}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Elemental & Mineral Composition
              </span>
              <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
                {selectedMineral.mineral_composition}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Astrobiology & Scientific Significance
              </span>
              <p className="text-zinc-300 font-sans leading-relaxed text-xs">
                {selectedMineral.scientific_importance}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
