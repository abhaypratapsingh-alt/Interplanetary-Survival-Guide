'use client';

import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Gauge,
  Wind,
  Sun,
  Activity,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Database,
  Calendar,
  Layers,
  ChevronRight,
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

export function SensorDataView() {
  const [sensors, setSensors] = useState<any[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('MEDA-TEMP');
  const [selectedRange, setSelectedRange] = useState<string>('24h');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load sensors list
  useEffect(() => {
    async function fetchSensors() {
      try {
        setLoading(true);
        const data = await api.getSensors(selectedCategory);
        setSensors(data);
        if (data.length > 0 && !data.some((s: any) => s.id === selectedSensorId)) {
          setSelectedSensorId(data[0].id);
        }
        setError(null);
      } catch (err: any) {
        console.warn('Sensors load warning:', err);
        setError(err.message || 'Connecting to sensor backend...');
      } finally {
        setLoading(false);
      }
    }
    fetchSensors();
  }, [selectedCategory]);

  // Load history for selected sensor
  useEffect(() => {
    async function fetchHistory() {
      if (!selectedSensorId) return;
      try {
        setHistoryLoading(true);
        const data = await api.getSensorHistory(selectedSensorId, selectedRange);
        const formatted = data.map((d: any, idx: number) => ({
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: d.value,
          sol: d.sol,
        }));
        setHistoryData(formatted);
      } catch (err) {
        console.warn('History load warning:', err);
      } finally {
        setHistoryLoading(false);
      }
    }
    fetchHistory();
  }, [selectedSensorId, selectedRange]);

  const activeSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  // Calculate statistics
  const values = historyData.map((d) => d.value);
  const minVal = values.length ? Math.min(...values) : activeSensor?.min_nominal || 0;
  const maxVal = values.length ? Math.max(...values) : activeSensor?.max_nominal || 0;
  const avgVal = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : activeSensor?.current_value || 0;

  const categories = [
    { id: 'all', name: 'All Sensors' },
    { id: 'atmospheric', name: 'Atmospheric' },
    { id: 'radiation', name: 'Radiation' },
    { id: 'environmental', name: 'Environmental' },
    { id: 'power', name: 'Power / MMRTG' },
    { id: 'mechanical', name: 'Mechanical' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Perseverance MEDA & Planetary Instruments
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider mt-0.5">
            SENSOR MONITORING WORKSPACE
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Real-time telemetry and historical environmental observations on the Martian surface.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export Button */}
          <a
            href={api.getSensorExportUrl(selectedSensorId)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </a>

          {/* Provenance Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>NASA Archive</span>
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Sensor Cards (Left) + Detailed Interactive Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Sensor Cards List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
          {sensors.map((sensor) => {
            const isSelected = sensor.id === selectedSensorId;
            return (
              <div
                key={sensor.id}
                onClick={() => setSelectedSensorId(sensor.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/40 to-zinc-900 border-cyan-500 shadow-[0_0_18px_rgba(0,240,255,0.15)] text-white'
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50 text-zinc-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">
                      {sensor.id}
                    </span>
                    <span className="text-sm font-bold text-zinc-200 mt-0.5">
                      {sensor.name}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NOMINAL
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-zinc-800/60">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white">
                      {sensor.current_value}
                    </span>
                    <span className="text-xs text-cyan-400 font-bold">{sensor.unit}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{sensor.instrument}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Historical Interactive Chart & Analysis */}
        <div className="lg:col-span-7 rounded-xl bg-zinc-950/90 border border-zinc-800 p-5 flex flex-col gap-4 shadow-2xl">
          {/* Chart Header & Time Range Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white tracking-wider">
                  {activeSensor?.name} ({activeSensor?.id})
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-sans">
                {activeSensor?.description}
              </span>
            </div>

            {/* Range Pills */}
            <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-xs">
              {['1h', '24h', '7d', '30d'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRange(r)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    selectedRange === r
                      ? 'bg-cyan-500 text-black font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Statistical Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">Current Reading</span>
              <span className="text-base font-bold text-cyan-400">
                {activeSensor?.current_value} {activeSensor?.unit}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">Observed Min</span>
              <span className="text-base font-bold text-white">
                {minVal} {activeSensor?.unit}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">Observed Max</span>
              <span className="text-base font-bold text-white">
                {maxVal} {activeSensor?.unit}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">Mean Average</span>
              <span className="text-base font-bold text-emerald-400">
                {avgVal} {activeSensor?.unit}
              </span>
            </div>
          </div>

          {/* Recharts Area / Line Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="sensorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222734" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
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
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  fill="url(#sensorGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Provenance and Scientific Attribution Footer */}
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-[11px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Provenance:</span>
              <span className="text-zinc-200 font-semibold">{activeSensor?.provenance}</span>
            </div>
            <span className="text-[10px] text-amber-400/90 font-mono">
              [OBSERVATIONAL CALIBRATION NOMINAL]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
