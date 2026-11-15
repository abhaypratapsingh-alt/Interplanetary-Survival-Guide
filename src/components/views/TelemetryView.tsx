'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Satellite,
  Activity,
  Compass,
  Wifi,
  Waves,
  Zap,
  ShieldCheck,
  Disc,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '@/lib/apiClient';

export function TelemetryView() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [waveform, setWaveform] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Poll live waveform and radar data
  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      try {
        const [sumRes, waveRes, radRes] = await Promise.all([
          api.getTelemetrySummary(),
          api.getSignalWaveform(),
          api.getRadarSweep(),
        ]);
        if (isMounted) {
          setTelemetry(sumRes);
          setWaveform(waveRes.waveform || []);
          setRadarData(radRes);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Telemetry load notice:', err);
      }
    }
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const stations = [
    { name: 'DSN Goldstone (DSS-14)', loc: 'California, USA', status: 'LOCKED', snr: '15.4 dB', freq: '8.42 GHz' },
    { name: 'DSN Madrid (DSS-63)', loc: 'Robledo, Spain', status: 'STANDBY', snr: '14.1 dB', freq: '8.42 GHz' },
    { name: 'DSN Canberra (DSS-43)', loc: 'Tidbinbilla, Australia', status: 'TRACKING', snr: '13.8 dB', freq: '8.42 GHz' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* Header bar (Ref 2 futuristic control center styling) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Deep Space Network (DSN) • Interplanetary Telemetry Stream
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider mt-0.5">
            ORBITAL TELEMETRY & SIGNAL WAVEFORM ANALYSIS
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Real-time link budget, carrier frequency modulation, radar sounding, and MRO relay orbits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CARRIER LOCK: NOMINAL
          </span>
        </div>
      </div>

      {/* Top Telemetry Metric Banners (Ref 2 Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Carrier Frequency
          </span>
          <span className="text-xl font-black text-white mt-1">8.420 GHz</span>
          <span className="text-[10px] text-cyan-400">Deep Space X-Band</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Signal-to-Noise
          </span>
          <span className="text-xl font-black text-emerald-400 mt-1">
            {telemetry?.average_snr_db || 15.4} dB
          </span>
          <span className="text-[10px] text-zinc-400">Margin: +6.8 dB Nominal</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Downlink Bitrate
          </span>
          <span className="text-xl font-black text-white mt-1">
            {telemetry?.total_downlink_kbps || 128} kbps
          </span>
          <span className="text-[10px] text-amber-400">Uplink: 2.0 kbps</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" /> Orbit Altitude
          </span>
          <span className="text-xl font-black text-white mt-1">324.5 km</span>
          <span className="text-[10px] text-cyan-400">MRO Electra Relay</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
            <Waves className="w-3.5 h-3.5 text-mars-400" /> Signal Level
          </span>
          <span className="text-xl font-black text-mars-400 mt-1">-112.5 dBm</span>
          <span className="text-[10px] text-zinc-400">Threshold: -130 dBm</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Light Time Delay
          </span>
          <span className="text-xl font-black text-white mt-1">12m 32s</span>
          <span className="text-[10px] text-zinc-400">1-Way Light Delay</span>
        </div>
      </div>

      {/* Middle Grid: Live Oscilloscope Waveform (Left) + Radar Sounding (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Live Carrier Oscilloscope (Ref 2 Style) */}
        <div className="lg:col-span-7 rounded-xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Oscilloscope & Carrier Waveform Spectrum
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              LIVE SAMPLING 100 Hz
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waveform}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161f2e" />
                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} domain={[-1.2, 1.2]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0d14',
                    borderColor: '#00f0ff',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ color: '#00f0ff' }}
                />
                <Line
                  type="monotone"
                  dataKey="amplitude"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="carrier"
                  stroke="#ff6239"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-zinc-800/60 font-mono">
            <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 block text-[9px] uppercase">Modulation</span>
              <span className="font-semibold text-white">BPSK / QPSK</span>
            </div>
            <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 block text-[9px] uppercase">Channel BW</span>
              <span className="font-semibold text-cyan-400">4.50 MHz</span>
            </div>
            <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 block text-[9px] uppercase">Bit Error Rate</span>
              <span className="font-semibold text-emerald-400">1.2 × 10⁻⁵</span>
            </div>
          </div>
        </div>

        {/* Right Column: Radar Sounding Display & RIMFAX Echoes */}
        <div className="lg:col-span-5 rounded-xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-4 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Subsurface Radar (RIMFAX)
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">150 MHz Sounding</span>
          </div>

          {/* Radar Circular Visualization */}
          <div className="relative w-full h-52 flex items-center justify-center">
            {/* Concentric radar rings */}
            <div className="absolute w-48 h-48 rounded-full border border-cyan-500/20" />
            <div className="absolute w-36 h-36 rounded-full border border-cyan-500/30" />
            <div className="absolute w-24 h-24 rounded-full border border-cyan-500/40" />
            <div className="absolute w-12 h-12 rounded-full border border-cyan-500/60" />

            {/* Radar crosshairs */}
            <div className="absolute w-48 h-[1px] bg-cyan-500/30" />
            <div className="absolute h-48 w-[1px] bg-cyan-500/30" />

            {/* Rotating radar sweep line */}
            <div
              className="absolute w-24 h-[2px] bg-gradient-to-r from-transparent to-cyan-400 origin-left"
              style={{
                transform: `rotate(${radarData?.sweep_angle_deg || 45}deg)`,
                left: '50%',
              }}
            />

            {/* Radar Targets */}
            {radarData?.targets?.map((target: any, idx: number) => {
              const rad = (target.azimuth_deg * Math.PI) / 180;
              const r = Math.min(85, (target.distance_km / 5.0) * 85);
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;

              return (
                <div
                  key={idx}
                  className="absolute w-2 h-2 rounded-full bg-mars-400 shadow-[0_0_8px_#ff6239] animate-ping"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  title={`${target.type} (${target.distance_km}km)`}
                />
              );
            })}

            {/* Center Rover Beacon */}
            <div className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff]" />
          </div>

          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Radar Target Echoes
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {radarData?.targets?.map((t: any) => (
                <div key={t.id} className="p-1.5 rounded bg-zinc-900/50 border border-zinc-800 flex justify-between text-[11px]">
                  <span className="text-white font-semibold">{t.type}</span>
                  <span className="text-cyan-400">{t.distance_km} km @ {t.azimuth_deg}°</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Ground Station Status (Deep Space Network) */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          Deep Space Network (DSN) Global Ground Stations
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stations.map((station, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between gap-3 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">{station.name}</h3>
                  <span className="text-[10px] text-zinc-400 font-sans">{station.loc}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    station.status === 'LOCKED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {station.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-800/60 font-mono">
                <span className="text-zinc-500">SNR: <strong className="text-cyan-400">{station.snr}</strong></span>
                <span className="text-zinc-500">Freq: <strong className="text-white">{station.freq}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
