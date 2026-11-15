'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Thermometer,
  Wind,
  Sun,
  ShieldAlert,
  Radio,
  Camera,
  Layers,
  ChevronRight,
  Activity,
  BatteryCharging,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Gauge,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api } from '@/lib/apiClient';

interface DashboardViewProps {
  onNavigate: (page: string) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.getDashboardSummary();
        if (isMounted) {
          setData(res);
          setError(null);
        }
      } catch (err: any) {
        console.warn('Dashboard fetch notice:', err);
        if (isMounted) {
          setError(err.message || 'Connecting to backend...');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboard();
    const interval = setInterval(loadDashboard, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const sensors = data?.sensors || [
    { id: 'MEDA-TEMP', name: 'Atmospheric Temp', current_value: -62.4, unit: '°C', status: 'nominal', sparkline: [-65, -64, -63, -62.8, -62.4], provenance: 'MEDA' },
    { id: 'MEDA-PRES', name: 'Surface Pressure', current_value: 718.5, unit: 'Pa', status: 'nominal', sparkline: [715, 716, 717, 718.2, 718.5], provenance: 'MEDA' },
    { id: 'RAD-FLUX', name: 'Radiation Flux', current_value: 248.0, unit: 'µSv/d', status: 'nominal', sparkline: [242, 244, 246, 247, 248], provenance: 'RAD' },
    { id: 'DUST-OPT', name: 'Dust Optical Depth', current_value: 0.62, unit: 'tau', status: 'nominal', sparkline: [0.60, 0.61, 0.61, 0.62, 0.62], provenance: 'Mastcam-Z' },
    { id: 'MEDA-WIND', name: 'Wind Velocity', current_value: 7.8, unit: 'm/s', status: 'nominal', sparkline: [6.2, 7.1, 8.4, 7.5, 7.8], provenance: 'MEDA' },
    { id: 'PWR-SOLAR', name: 'Solar Insolation', current_value: 412.0, unit: 'W/m²', status: 'nominal', sparkline: [380, 395, 405, 410, 412], provenance: 'MEDA TIRS' },
  ];

  const missionClock = data?.mission_clock || {
    current_sol: 1042,
    local_mean_solar_time: '14:26:08 LMST',
    earth_mars_distance_km: 225480000,
    one_way_light_time_min: 12.54,
  };

  const roverTelemetry = data?.rover_telemetry || {
    name: 'Perseverance (Mars 2020)',
    location: 'Jezero Crater Delta Margin',
    coordinates: { latitude: 18.4447, longitude: 77.4508 },
    elevation_m: -2570.0,
    odometer_km: 28.45,
    samples_cached: 24,
  };

  const activeCamera = data?.active_camera || {
    camera_name: 'MASTCAM-Z',
    camera_full_name: 'Mast Camera Zoom (Mastcam-Z Left)',
    sol: 1042,
    earth_date: '2024-01-28',
    image_url: 'https://mars.nasa.gov/system/resources/detail_files/26075_PIA24424-web.jpg',
    title: 'Jezero Western Delta Scarp Layering',
    source_attribution: 'NASA/JPL-Caltech/ASU/MSSS',
  };

  const subsystems = data?.subsystems_health || [
    { name: 'MMRTG Power Core', status: 'nominal', value: '98.4%', icon: 'battery-charging' },
    { name: 'Deep Space Comm (X-band)', status: 'nominal', value: '15.4 dB SNR', icon: 'radio' },
    { name: 'Mastcam-Z & SuperCam', status: 'nominal', value: 'Operational', icon: 'camera' },
    { name: 'Drive Mobility Actuators', status: 'nominal', value: '6/6 Motors Active', icon: 'navigation' },
    { name: 'AutoNav Autonomous Drive', status: 'nominal', value: 'Clear Path', icon: 'shield-check' },
    { name: 'RIMFAX Subsurface Radar', status: 'nominal', value: '15m Profile Sounding', icon: 'activity' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* 1. Mission Header Ribbon / Rover Operation Telemetry (Curiosity & Perseverance Ref 1 style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Mission Sol
          </span>
          <span className="text-xl sm:text-2xl font-black text-white tracking-wider">
            SOL {missionClock.current_sol}
          </span>
          <span className="text-[10px] text-cyan-400/90">{missionClock.local_mean_solar_time}</span>
        </div>

        <div className="flex flex-col gap-1 border-l border-zinc-800/80 pl-3">
          <span className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-mars-400" /> Target Coordinates
          </span>
          <span className="text-sm font-bold text-white">
            {roverTelemetry.coordinates.latitude.toFixed(4)}°N, {roverTelemetry.coordinates.longitude.toFixed(4)}°E
          </span>
          <span className="text-[10px] text-zinc-400">Elevation: {roverTelemetry.elevation_m}m</span>
        </div>

        <div className="flex flex-col gap-1 border-l border-zinc-800/80 pl-3">
          <span className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" /> Light Time Delay
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {missionClock.one_way_light_time_min} MIN
          </span>
          <span className="text-[10px] text-zinc-400">Dist: {(missionClock.earth_mars_distance_km / 1e6).toFixed(1)}M km</span>
        </div>

        <div className="flex flex-col gap-1 border-l border-zinc-800/80 pl-3">
          <span className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-amber-400" /> Power Generator
          </span>
          <span className="text-sm font-bold text-white">MMRTG 110 W</span>
          <span className="text-[10px] text-amber-400">98.4% Nominal</span>
        </div>

        <div className="flex flex-col gap-1 border-l border-zinc-800/80 pl-3">
          <span className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Odometer Traverse
          </span>
          <span className="text-sm font-bold text-white">{roverTelemetry.odometer_km} km</span>
          <span className="text-[10px] text-zinc-400">Total Ground Distance</span>
        </div>

        <div className="flex flex-col gap-1 border-l border-zinc-800/80 pl-3">
          <span className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cached Samples
          </span>
          <span className="text-sm font-bold text-white">{roverTelemetry.samples_cached} Tubes</span>
          <span className="text-[10px] text-emerald-400">MSR Sample Cache Ready</span>
        </div>
      </div>

      {/* 2. Sensor Overview Cards (Page 1 requirement: Temperature, Pressure, Dust, Radiation, Wind, Solar) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              Atmospheric & Environmental Telemetry
            </h2>
          </div>
          <button
            onClick={() => onNavigate('sensors')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Sensor Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {sensors.map((sensor: any) => {
            const chartData = (sensor.sparkline || [sensor.current_value]).map((val: number, idx: number) => ({
              idx,
              val,
            }));

            return (
              <div
                key={sensor.id}
                onClick={() => onNavigate('sensors')}
                className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-cyan-500/50 hover:bg-zinc-900/60 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-2 shadow-lg group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 group-hover:text-cyan-300 transition-colors uppercase truncate">
                    {sensor.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    NOMINAL
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
                    {sensor.current_value}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">{sensor.unit}</span>
                </div>

                {/* Sparkline mini-chart */}
                <div className="h-9 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id={`spark-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="val"
                        stroke="#00f0ff"
                        strokeWidth={1.5}
                        fill={`url(#spark-${sensor.id})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[9px] text-zinc-500">
                  <span className="truncate max-w-[90px]">{sensor.provenance}</span>
                  <span className="text-zinc-400">Sol {missionClock.current_sol}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Middle Tier: Camera Overview + Subsystems Health + Active Mission Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Active Camera Observation (Ref 1 style) */}
        <div className="lg:col-span-5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Active Camera Imagery ({activeCamera.camera_name})
              </span>
            </div>
            <button
              onClick={() => onNavigate('cameras')}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Image Gallery</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div
            onClick={() => onNavigate('cameras')}
            className="relative w-full h-56 rounded-lg overflow-hidden border border-zinc-800/80 group cursor-pointer bg-black"
          >
            <img
              src={activeCamera.image_url}
              alt={activeCamera.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Camera Overlay HUD */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-3 pointer-events-none">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-black/60 border border-cyan-500/40 text-cyan-300 font-bold">
                  {activeCamera.camera_name} • SOL {activeCamera.sol}
                </span>
                <span className="text-zinc-300 bg-black/50 px-2 py-0.5 rounded">
                  {activeCamera.earth_date}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-wide">{activeCamera.title}</p>
                <p className="text-[10px] text-zinc-400 font-sans mt-0.5">{activeCamera.source_attribution}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-400">
            <span>Instrument: {activeCamera.camera_full_name}</span>
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              Live Feed <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          </div>
        </div>

        {/* Center: Rover Equipment Subsystems Health (Ref 1 style) */}
        <div className="lg:col-span-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Subsystems Status & Diagnostics
              </span>
            </div>
            <button
              onClick={() => onNavigate('health')}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Full Health Check</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-between">
            {subsystems.map((sub: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between text-xs hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-zinc-200">{sub.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-mono">{sub.value}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    OK
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Mission & Task Progress (Page 1 requirement) */}
        <div className="lg:col-span-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-mars-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Active Mission Progress
              </span>
            </div>
            <button
              onClick={() => onNavigate('missions')}
              className="text-[10px] text-mars-400 hover:text-mars-300 flex items-center gap-1"
            >
              <span>All Missions</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-br from-mars-950/50 to-zinc-900 border border-mars-500/30">
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-mars-500/20 text-mars-300 font-bold border border-mars-500/30">
              PRIMARY CAMPAIGN
            </span>
            <h3 className="text-sm font-bold text-white mt-1">Jezero Fan Delta Astrobiology</h3>
            <p className="text-[10px] text-zinc-400 font-sans mt-1 line-clamp-2">
              Characterize fine-grained delta mudstones and search for ancient biosignatures.
            </p>

            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-zinc-400">Campaign Progress</span>
                <span className="text-mars-400">68.5%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-mars-500 to-amber-400 h-1.5 rounded-full w-[68.5%]" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Immediate Sol Tasks
            </span>
            <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-300 truncate">1. Drill Core at 'Tenby' Outcrop</span>
              <span className="text-[9px] text-emerald-400 font-bold">DONE</span>
            </div>
            <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-300 truncate">2. SuperCam Raman Spectroscopy</span>
              <span className="text-[9px] text-emerald-400 font-bold">DONE</span>
            </div>
            <div className="p-2 rounded bg-zinc-900/60 border border-cyan-500/30 flex items-center justify-between">
              <span className="text-[11px] text-white truncate">3. RIMFAX Radar Subsurface Sounding</span>
              <span className="text-[9px] text-cyan-400 font-bold animate-pulse">75%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Tier: Location Explorer Shortcut + Hazard Status + Recent Mission Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 3D Mars Location Portal Shortcut */}
        <div
          onClick={() => onNavigate('location')}
          className="lg:col-span-4 p-4 rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-mars-950/40 border border-mars-500/30 hover:border-mars-500/70 cursor-pointer shadow-xl transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-mars-400 group-hover:rotate-45 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                3D Planetary Explorer Portal
              </span>
            </div>
            <span className="text-xs text-mars-400 flex items-center gap-1 font-bold">
              Launch 3D Map <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          <div className="my-3 p-3 rounded-lg bg-black/60 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Jezero Crater 3D Terrain</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-1">
              High-resolution 3D elevation mesh with authentic crater rim, Western Delta sediment scarp, and rover landing coordinates.
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/60 font-mono">
            <span>Lat: 18.38°N, Lon: 77.58°E</span>
            <span className="text-cyan-400">WebGL 2.0 60FPS</span>
          </div>
        </div>

        {/* Center: Hazard Warning Summary */}
        <div
          onClick={() => onNavigate('hazards')}
          className="lg:col-span-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-500/50 cursor-pointer shadow-xl transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Topographic Hazard Analysis
              </span>
            </div>
            <span className="text-xs text-amber-400 flex items-center gap-1 font-bold">
              Inspect Hazards <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 space-y-2">
            <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Delta Scarp Slope Warning</span>
                <span className="text-[10px] text-zinc-400">Slope angle 22.4° exceeds 15° limit</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px] border border-red-500/40">
                SEVERE
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">South Séítah Boulder Field</span>
                <span className="text-[10px] text-zinc-400">Boulder density 0.88/m² (Underbody risk)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/40">
                HIGH
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/60 font-mono">
            <span>Model: 0.40*Slope + 0.35*Obstacle + 0.25*Terrain</span>
            <span className="text-amber-400">2 Critical Zones</span>
          </div>
        </div>

        {/* Right: Recent Mission Event Logs */}
        <div
          onClick={() => onNavigate('logs')}
          className="lg:col-span-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-cyan-500/50 cursor-pointer shadow-xl transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Live Mission Logs & Events
              </span>
            </div>
            <span className="text-xs text-cyan-400 flex items-center gap-1 font-bold">
              Full Logs <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 space-y-2 text-xs">
            <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <div>
                <span className="text-[11px] text-zinc-200 block">DSN Goldstone DSS-14 acquired carrier lock</span>
                <span className="text-[9px] text-zinc-500">10m ago • Telemetry • SNR 15.4 dB</span>
              </div>
            </div>
            <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div>
                <span className="text-[11px] text-zinc-200 block">SuperCam Raman spectroscopy completed on 'Tenby'</span>
                <span className="text-[9px] text-zinc-500">25m ago • Science Team</span>
              </div>
            </div>
            <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <span className="text-[11px] text-zinc-200 block">Topographic slope warning on delta ascent approach</span>
                <span className="text-[9px] text-zinc-500">55m ago • AutoNav Engine</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/60 font-mono">
            <span>Persisted in PostgreSQL</span>
            <span className="text-emerald-400">Stream Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
