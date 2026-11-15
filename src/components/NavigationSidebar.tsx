'use client';

import React from 'react';
import {
  Globe,
  Compass,
  Mountain,
  Navigation,
  Target,
  ChevronRight,
  LayoutDashboard,
  Gauge,
  Rocket,
  Camera,
  MapPin,
  Layers,
  ShieldAlert,
  Radio,
  HeartPulse,
  ScrollText,
  Settings,
  ChevronLeft,
} from 'lucide-react';

export type AppPage =
  | 'dashboard'
  | 'sensors'
  | 'missions'
  | 'mission-control'
  | 'cameras'
  | 'location'
  | 'layers'
  | 'hazards'
  | 'telemetry'
  | 'health'
  | 'logs'
  | 'settings';

interface NavigationSidebarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  isOpen: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
}

const NAV_ITEMS: { id: AppPage; label: string; icon: React.ElementType; description: string; group: string; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Mission overview & KPIs', group: 'command' },
  { id: 'mission-control', label: 'Mission Control', icon: ShieldAlert, description: 'Astronauts & Minerals Admin', group: 'command', adminOnly: true },
  { id: 'sensors', label: 'Sensor Data', icon: Gauge, description: 'Environmental telemetry', group: 'command' },
  { id: 'missions', label: 'Missions', icon: Rocket, description: 'Mission planning & tasks', group: 'command' },
  { id: 'cameras', label: 'Cameras', icon: Camera, description: 'NASA rover imagery', group: 'science' },
  { id: 'location', label: 'Location', icon: MapPin, description: '3D Mars globe & terrain', group: 'science' },
  { id: 'layers', label: 'Sci Layers', icon: Layers, description: 'NASA data overlays', group: 'science' },
  { id: 'hazards', label: 'Hazards', icon: ShieldAlert, description: 'Hazard analysis engine', group: 'science' },
  { id: 'telemetry', label: 'Telemetry', icon: Radio, description: 'Signal & comm monitor', group: 'systems' },
  { id: 'health', label: 'Health', icon: HeartPulse, description: 'System diagnostics', group: 'systems' },
  { id: 'logs', label: 'Logs', icon: ScrollText, description: 'Mission event log', group: 'systems' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Configuration', group: 'systems' },
];

const GROUP_LABELS: Record<string, string> = {
  command: 'Command Center',
  science: 'Science & Exploration',
  systems: 'Systems & Infrastructure',
};

export function NavigationSidebar({
  activePage,
  onNavigate,
  isOpen,
  onToggle,
  isAdmin = false,
}: NavigationSidebarProps) {
  const groups = ['command', 'science', 'systems'];

  // Filter out admin-only items if not admin (or show locked state)
  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside
      className={`fixed top-14 left-0 bottom-8 z-20 flex flex-col transition-all duration-300 font-mono pointer-events-auto ${
        isOpen
          ? 'w-64 bg-zinc-950/95 backdrop-blur-md border-r border-zinc-800/80 shadow-2xl'
          : 'w-12 bg-zinc-950/80 border-r border-zinc-800/50'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="h-10 px-3 flex items-center justify-between border-b border-zinc-800/80 text-zinc-400 hover:text-white transition-colors shrink-0"
        title={isOpen ? 'Collapse' : 'Expand'}
      >
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-mars-400" />
          {isOpen && (
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {/* Collapsed icon-only rail */}
      {!isOpen && (
        <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-9 h-9 flex items-center justify-center rounded-md transition-all ${
                  isActive
                    ? 'bg-mars-500/20 text-mars-400 border border-mars-500/40'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800/60'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      )}

      {/* Expanded full sidebar */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
          {groups.map((group) => (
            <div key={group} className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 px-2 mb-0.5">
                {GROUP_LABELS[group]}
              </span>
              {visibleItems.filter((item) => item.group === group).map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md border text-left transition-all group ${
                      isActive
                        ? 'bg-mars-950/60 border-mars-500/60 text-white shadow-[0_0_12px_rgba(217,83,47,0.15)]'
                        : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/60 hover:border-zinc-800'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-mars-400' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs leading-tight ${isActive ? 'font-semibold' : ''}`}>
                        {item.label}
                      </span>
                      <span className="text-[9px] text-zinc-600 truncate leading-tight">
                        {item.description}
                      </span>
                    </div>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-mars-400 animate-pulse shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Jezero Crater Quick Access Card */}
          <div className="mt-auto pt-3 border-t border-zinc-800/60">
            <div
              onClick={() => onNavigate('location')}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                activePage === 'location'
                  ? 'bg-gradient-to-br from-mars-950/80 to-zinc-900 border-mars-500 shadow-[0_0_15px_rgba(217,83,47,0.25)]'
                  : 'bg-zinc-900/40 border-zinc-800 hover:border-mars-500/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-mars-400" />
                <span className="font-bold text-white text-[11px] tracking-wide">
                  Jezero Crater
                </span>
                <span className="text-[8px] px-1 py-0.5 rounded bg-mars-500/20 text-mars-300 font-bold border border-mars-500/30 ml-auto">
                  PRIMARY
                </span>
              </div>
              <div className="mt-1.5 flex items-center text-[9px] text-zinc-500 font-mono">
                <span>18.38°N, 77.58°E</span>
                <ChevronRight className="w-3 h-3 ml-auto text-mars-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
