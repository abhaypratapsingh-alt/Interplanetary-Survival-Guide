'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import * as THREE from 'three';
import { MissionHeader } from './MissionHeader';
import { NavigationSidebar, AppPage } from './NavigationSidebar';
import { MissionPrefaceModal } from './MissionPrefaceModal';
import { NasaTrekSyncModal } from './NasaTrekSyncModal';
import { NASATrekEngine } from '@/lib/nasaTrekEngine';
import { Loader2 } from 'lucide-react';

// Lazy-load all view components to avoid bundling everything upfront
const DashboardView = lazy(() =>
  import('./views/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const SensorDataView = lazy(() =>
  import('./views/SensorDataView').then((m) => ({ default: m.SensorDataView }))
);
const MissionsView = lazy(() =>
  import('./views/MissionsView').then((m) => ({ default: m.MissionsView }))
);
const CamerasView = lazy(() =>
  import('./views/CamerasView').then((m) => ({ default: m.CamerasView }))
);
const LocationView = lazy(() =>
  import('./views/LocationView').then((m) => ({ default: m.LocationView }))
);
const ScientificLayersView = lazy(() =>
  import('./views/ScientificLayersView').then((m) => ({ default: m.ScientificLayersView }))
);
const HazardAnalysisView = lazy(() =>
  import('./views/HazardAnalysisView').then((m) => ({ default: m.HazardAnalysisView }))
);
const TelemetryView = lazy(() =>
  import('./views/TelemetryView').then((m) => ({ default: m.TelemetryView }))
);
const HealthCheckView = lazy(() =>
  import('./views/HealthCheckView').then((m) => ({ default: m.HealthCheckView }))
);
const MissionLogsView = lazy(() =>
  import('./views/MissionLogsView').then((m) => ({ default: m.MissionLogsView }))
);
const SettingsView = lazy(() =>
  import('./views/SettingsView').then((m) => ({ default: m.SettingsView }))
);

function PageLoader() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-zinc-950 font-mono text-xs text-zinc-400">
      <Loader2 className="w-8 h-8 text-mars-500 animate-spin" />
      <span>Loading module...</span>
    </div>
  );
}

export function MarsExplorerApp() {
  const [activePage, setActivePage] = useState<AppPage>('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isPrefaceOpen, setIsPrefaceOpen] = useState(true);

  // NASA texture state (for Location view pass-through)
  const [activeLayerId, setActiveLayerId] = useState('nasa-viking-mdim21');
  const [nasaGlobeTexture, setNasaGlobeTexture] = useState<THREE.CanvasTexture | null>(null);
  const [nasaTerrainTexture, setNasaTerrainTexture] = useState<THREE.CanvasTexture | null>(null);
  const [isStreamingNASA, setIsStreamingNASA] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);

  // Check preface dismissal
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const dismissed = localStorage.getItem('mars_pathfinder_preface_dismissed');
        if (dismissed === 'true') {
          setIsPrefaceOpen(false);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // NASA texture streaming (only when on location page)
  useEffect(() => {
    if (activePage !== 'location') return;
    let isMounted = true;

    async function streamNASATextures() {
      setIsStreamingNASA(true);
      setStreamProgress(10);

      try {
        if (activeLayerId === 'nasa-viking-mdim21') {
          const tex = await NASATrekEngine.loadRealNASAVikingMosaic((pct) => {
            if (isMounted) setStreamProgress(pct);
          });
          if (isMounted) setNasaGlobeTexture(tex);
        } else if (activeLayerId === 'nasa-mola-color-relief') {
          const tex = await NASATrekEngine.loadRealNASAMolaMosaic((pct) => {
            if (isMounted) setStreamProgress(pct);
          });
          if (isMounted) setNasaGlobeTexture(tex);
        } else {
          if (isMounted) setNasaGlobeTexture(null);
        }

        const jezeroTex = await NASATrekEngine.loadRealNASAJezeroTerrain(
          activeLayerId === 'nasa-mola-color-relief' ? 'mola' : 'viking'
        );
        if (isMounted) setNasaTerrainTexture(jezeroTex);
      } catch (err) {
        console.warn('NASA streaming note:', err);
      } finally {
        if (isMounted) {
          setIsStreamingNASA(false);
          setStreamProgress(100);
        }
      }
    }

    streamNASATextures();
    return () => {
      isMounted = false;
    };
  }, [activeLayerId, activePage]);

  // Navigate handler passed to child views
  const handleNavigate = (page: string) => {
    setActivePage(page as AppPage);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} />;
      case 'sensors':
        return <SensorDataView />;
      case 'missions':
        return <MissionsView />;
      case 'cameras':
        return <CamerasView />;
      case 'location':
        return (
          <LocationView
            overrideTexture={nasaGlobeTexture}
            overrideTerrainTexture={nasaTerrainTexture}
            isStreamingNASA={isStreamingNASA}
            streamProgress={streamProgress}
          />
        );
      case 'layers':
        return <ScientificLayersView />;
      case 'hazards':
        return <HazardAnalysisView />;
      case 'telemetry':
        return <TelemetryView />;
      case 'health':
        return <HealthCheckView />;
      case 'logs':
        return <MissionLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 text-white font-sans flex flex-col select-none">
      {/* 1. Top Header */}
      <MissionHeader
        onOpenPreface={() => setIsPrefaceOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isStreamingNASA={isStreamingNASA}
      />

      {/* 2. Main Content Area */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Left Sidebar */}
        <NavigationSidebar
          activePage={activePage}
          onNavigate={setActivePage}
          isOpen={isNavOpen}
          onToggle={() => setIsNavOpen(!isNavOpen)}
        />

        {/* Page Content */}
        <main
          className={`absolute top-0 bottom-0 right-0 transition-all duration-300 overflow-hidden ${
            isNavOpen ? 'left-64' : 'left-12'
          }`}
        >
          <Suspense fallback={<PageLoader />}>{renderActivePage()}</Suspense>
        </main>
      </div>

      {/* 3. Mission Preface Modal */}
      <MissionPrefaceModal
        isOpen={isPrefaceOpen}
        onEnter={() => setIsPrefaceOpen(false)}
      />

      {/* 4. NASA Trek Sync Modal */}
      <NasaTrekSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        activeLayer={activeLayerId}
        onSelectLayer={setActiveLayerId}
        streamProgress={streamProgress}
        isStreaming={isStreamingNASA}
      />
    </div>
  );
}
