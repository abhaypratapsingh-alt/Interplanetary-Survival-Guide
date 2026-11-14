'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Info,
  CheckCircle2,
  Crosshair,
  Layers,
  Activity,
  Compass,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

export function HazardAnalysisView() {
  const [hazardData, setHazardData] = useState<any>(null);
  const [selectedHazardId, setSelectedHazardId] = useState<number | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Model weights (Risk = w1*Slope + w2*Obstacle + w3*Terrain)
  const [slopeWeight, setSlopeWeight] = useState<number>(0.40);
  const [obstacleWeight, setObstacleWeight] = useState<number>(0.35);
  const [terrainWeight, setTerrainWeight] = useState<number>(0.25);

  const fetchHazards = async () => {
    try {
      setLoading(true);
      const res = await api.getHazards(selectedSeverity);
      setHazardData(res);
      if (res.hazards?.length > 0 && selectedHazardId === null) {
        setSelectedHazardId(res.hazards[0].id);
      }
    } catch (err) {
      console.warn('Hazards load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHazards();
  }, [selectedSeverity]);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      await api.analyzeHazards({
        region: 'Jezero Crater (Delta Front)',
        center_lat: 18.38,
        center_lon: 77.58,
        slope_weight: slopeWeight,
        obstacle_weight: obstacleWeight,
        terrain_weight: terrainWeight,
      });
      await fetchHazards();
    } catch (err) {
      console.warn('Scan notice:', err);
    } finally {
      setTimeout(() => setIsScanning(false), 800);
    }
  };

  const hazards = hazardData?.hazards || [];
  const selectedHazard = hazards.find((h: any) => h.id === selectedHazardId) || hazards[0];

  const severityColors: Record<string, { bg: string; text: string; border: string }> = {
    severe: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
    high: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
    moderate: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              Topographic Risk Assessment & Traverse Safety
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider mt-0.5">
            HAZARD DETECTION & TRAFFICABILITY ANALYSIS
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Autonomous multi-criteria risk model: slope gradient, boulder field density, and eolian wheel slip.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
        >
          {isScanning ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isScanning ? 'Computing Terrain Risk Matrix...' : 'Run Topographic Hazard Scan'}</span>
        </button>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Cataloged Hazards</span>
          <span className="text-2xl font-black text-white mt-1">
            {hazardData?.total_hazards || hazards.length}
          </span>
          <span className="text-[10px] text-zinc-400">Jezero Exploration Zone</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-red-500/30 flex flex-col">
          <span className="text-[10px] text-red-400 uppercase font-bold">Severe & High Risk</span>
          <span className="text-2xl font-black text-red-400 mt-1">
            {hazardData?.high_risk_count || 2}
          </span>
          <span className="text-[10px] text-red-300">Requires Trajectory Reroute</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-yellow-500/30 flex flex-col">
          <span className="text-[10px] text-yellow-400 uppercase font-bold">Moderate Risk</span>
          <span className="text-2xl font-black text-yellow-300 mt-1">
            {hazardData?.moderate_risk_count || 1}
          </span>
          <span className="text-[10px] text-zinc-400">AutoNav Speed Restricted</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
          <span className="text-[10px] text-cyan-400 uppercase font-bold">Mean Area Risk Score</span>
          <span className="text-2xl font-black text-white mt-1">
            {hazardData?.average_risk_score || 0.485}
          </span>
          <span className="text-[10px] text-zinc-400">Scale: 0.0 (Clear) to 1.0 (Impassable)</span>
        </div>
      </div>

      {/* Main Grid: Hazard Catalog List (Left) + Detailed Risk Evaluation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Hazards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Detected Hazard Features
            </span>
            <div className="flex gap-1 text-[10px]">
              {['all', 'severe', 'high', 'moderate'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    selectedSeverity === sev
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {hazards.map((hazard: any) => {
              const isSelected = hazard.id === selectedHazard?.id;
              const sev = severityColors[hazard.severity] || severityColors.moderate;

              return (
                <div
                  key={hazard.id}
                  onClick={() => setSelectedHazardId(hazard.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-white'
                      : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        {hazard.hazard_type.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{hazard.region}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${sev.bg} ${sev.text} ${sev.border}`}
                    >
                      {hazard.severity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/60 font-mono">
                    <span className="text-zinc-400">
                      Lat: {hazard.latitude.toFixed(3)}°, Lon: {hazard.longitude.toFixed(3)}°
                    </span>
                    <span className="text-amber-400 font-bold">
                      Risk: {hazard.risk_score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Hazard Telemetry, Model Formula & Evidence */}
        {selectedHazard && (
          <div className="lg:col-span-7 rounded-xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-4 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-zinc-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase">
                      {selectedHazard.hazard_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-zinc-400">Detection Confidence: {Math.round(selectedHazard.confidence * 100)}%</span>
                  </div>
                  <h2 className="text-base font-black text-white tracking-wide mt-2">
                    {selectedHazard.region}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block">Composite Risk</span>
                  <span className="text-2xl font-black text-amber-400">{selectedHazard.risk_score}</span>
                </div>
              </div>

              {/* Model Formula Explanation Box */}
              <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Mathematical Risk Evaluation Formula
                </span>
                <div className="p-2 rounded bg-black/60 border border-zinc-850 font-mono text-cyan-300 text-[11px]">
                  Risk = ({slopeWeight} × SlopeRisk) + ({obstacleWeight} × ObstacleRisk) + ({terrainWeight} × TerrainRisk)
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  Inputs: Slope angle ({selectedHazard.slope_angle_deg || 0}° / 30°), boulder density ({selectedHazard.boulder_density_m2 || 0} rocks/m²), and surface roughness.
                </p>
              </div>

              {/* Weight Adjustment Sliders */}
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Model Weight Tuning (Interactive Calibration)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>Slope: {Math.round(slopeWeight * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={slopeWeight}
                      onChange={(e) => setSlopeWeight(parseFloat(e.target.value))}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>Obstacles: {Math.round(obstacleWeight * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={obstacleWeight}
                      onChange={(e) => setObstacleWeight(parseFloat(e.target.value))}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>Roughness: {Math.round(terrainWeight * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={terrainWeight}
                      onChange={(e) => setTerrainWeight(parseFloat(e.target.value))}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Scientific Notes & Rover Avoidance Recommendation */}
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Mission Planning Recommendation
                </span>
                <p className="text-zinc-300 font-sans leading-relaxed">
                  {selectedHazard.notes}
                </p>
                <div className="mt-2 text-[10px] text-zinc-500">
                  Detector: {selectedHazard.detected_by}
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-zinc-500 font-sans border-t border-zinc-800">
              Disclaimer: Analytical geometric risk model for NASA Space Apps demonstration. Real flight operations require validated HiRISE stereo DTM ground truthing.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
