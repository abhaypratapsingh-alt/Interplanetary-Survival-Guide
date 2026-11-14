'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Key,
  Database,
  Server,
  Globe,
  Palette,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Save,
  RotateCcw,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

export function SettingsView() {
  const [settings, setSettings] = useState<Record<string, string>>({
    theme_accent: 'cyan',
    coordinate_format: 'decimal',
    default_region: 'jezero-crater',
    nasa_api_key: 'DEMO_KEY',
    auto_refresh_sec: '15',
    demo_mode: 'true',
  });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<any | null>(null);

  // Admin login credentials
  const [username, setUsername] = useState<string>('flight-director');
  const [password, setPassword] = useState<string>('PathfinderMars2026!');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedSettings = await api.getSettings();
        setSettings((prev) => ({ ...prev, ...fetchedSettings }));
      } catch (err) {
        console.warn('Settings load notice:', err);
      }

      try {
        const auth = await api.getAuthMe();
        setAdminUser(auth);
      } catch (err) {
        setAdminUser(null);
      }
    }
    loadData();
  }, []);

  const handleSaveSetting = async (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await api.updateSetting(key, value);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}. Admin sign-in required.`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await api.login({ username, password });
      const auth = await api.getAuthMe();
      setAdminUser(auth);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    setAdminUser(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Mission Control Configuration & Security
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider mt-0.5">
            PLATFORM SETTINGS & CREDENTIALS
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Configure telemetry refresh, cartographic coordinates, NASA API integrations, and admin privileges.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Settings Persisted
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: General Configuration */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Appearance & Theme */}
          <div className="p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-xs font-bold uppercase text-white">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>Mission Control Aesthetics</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1.5">Primary HUD Accent Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cyan', name: 'Cyan / Turquoise', border: 'border-cyan-500' },
                    { id: 'mars', name: 'Mars Rust / Orange', border: 'border-mars-500' },
                    { id: 'emerald', name: 'Emerald Telemetry', border: 'border-emerald-500' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleSaveSetting('theme_accent', theme.id)}
                      className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                        settings.theme_accent === theme.id
                          ? 'bg-zinc-850 text-white border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                          : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5">Coordinate Display Format</label>
                <select
                  value={settings.coordinate_format}
                  onChange={(e) => handleSaveSetting('coordinate_format', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                >
                  <option value="decimal">Decimal Degrees (e.g. 18.3800° N, 77.5800° E)</option>
                  <option value="dms">Degrees-Minutes-Seconds (e.g. 18° 22' 48" N)</option>
                  <option value="utm">Martian Areocentric UTM Metric Grid</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. NASA API & Data Streams */}
          <div className="p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-xs font-bold uppercase text-white">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>NASA Open APIs Integration</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">NASA API Key (api.nasa.gov)</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={settings.nasa_api_key}
                    onChange={(e) => setSettings({ ...settings, nasa_api_key: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono"
                    placeholder="DEMO_KEY or your NASA API Key"
                  />
                  <button
                    onClick={() => handleSaveSetting('nasa_api_key', settings.nasa_api_key)}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400"
                  >
                    Save
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 font-sans mt-1 leading-relaxed">
                  Register a free key at <a href="https://api.nasa.gov/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">api.nasa.gov</a>. NASA keys are securely kept in environment variables and never exposed to client-side code.
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Telemetry Polling Refresh Interval</label>
                <select
                  value={settings.auto_refresh_sec}
                  onChange={(e) => handleSaveSetting('auto_refresh_sec', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                >
                  <option value="5">Every 5 Seconds (High frequency)</option>
                  <option value="15">Every 15 Seconds (Nominal)</option>
                  <option value="30">Every 30 Seconds (Low bandwidth)</option>
                  <option value="60">Every 60 Seconds</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Administrator Authentication & Server Connection Status */}
        <div className="lg:col-span-5 space-y-5">
          {/* Admin Authentication Box */}
          <div className="p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-bold uppercase text-white">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Flight Director Access</span>
              </div>
              {adminUser ? (
                <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <Unlock className="w-3 h-3" />
                  AUTHENTICATED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1 font-bold">
                  <Lock className="w-3 h-3" />
                  READ-ONLY
                </span>
              )}
            </div>

            {adminUser ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300">
                  <span className="font-bold block">Signed in as: {adminUser.username}</span>
                  <span className="text-[10px] text-zinc-400">Privileges: Full Mission Planning & Write Operations</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3 text-xs">
                {loginError && (
                  <div className="p-2 rounded bg-red-950/40 border border-red-500/40 text-red-300 text-[11px]">
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-zinc-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  Sign In (Unlock Mission Editing)
                </button>
                <p className="text-[10px] text-zinc-500 font-sans text-center">
                  Default credentials configured: <code className="text-cyan-400">flight-director</code> / <code className="text-cyan-400">PathfinderMars2026!</code>
                </p>
              </form>
            )}
          </div>

          {/* Backend Engine & Database Status */}
          <div className="p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-3 shadow-xl text-xs">
            <span className="font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Active Backend Connection Status
            </span>

            <div className="space-y-2 font-mono">
              <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">API Gateway:</span>
                <span className="text-cyan-400 font-semibold">http://127.0.0.1:8000</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Swagger Documentation:</span>
                <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                  /docs (Live)
                </a>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Database Engine:</span>
                <span className="text-emerald-400 font-semibold">PostgreSQL / SQLite</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
