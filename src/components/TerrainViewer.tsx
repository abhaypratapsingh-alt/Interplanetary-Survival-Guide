'use client';

import React, { useMemo, useRef, useState } from 'react';
import { OrbitControls, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { MarsTextureEngine } from '@/lib/marsTextures';
import { generateJezeroTerrainMesh, JEZERO_LOCAL_FEATURES } from '@/lib/terrainAdapter';
import { MapDisplaySettings } from '@/types/map';
import { TerrainFeature } from '@/types/terrain';
import { MapPin, Navigation } from 'lucide-react';

interface TerrainViewerProps {
  settings: MapDisplaySettings;
  selectedFeature: TerrainFeature | null;
  onSelectFeature: (feature: TerrainFeature) => void;
  onCursorCoordinates?: (coord: { lat: number; lon: number } | null) => void;
  overrideTexture?: THREE.CanvasTexture | null;
}

export function TerrainViewer({
  settings,
  selectedFeature,
  onSelectFeature,
  onCursorCoordinates,
  overrideTexture = null,
}: TerrainViewerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // Generate Jezero Terrain Geometry based on elevation exaggeration
  const terrainGeometry = useMemo(() => {
    return generateJezeroTerrainMesh(18, 18, 120, 120, settings.elevationExaggeration);
  }, [settings.elevationExaggeration]);

  // Baseline Local Jezero Texture (Western delta, ancient lakebed strata, channel)
  const baseTerrainTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return MarsTextureEngine.getJezeroLocalTexture();
  }, []);

  // Use real NASA Jezero texture if loaded, otherwise baseline
  const activeTexture = overrideTexture || baseTerrainTexture;

  // Sun direction based on settings
  const sunPosition = useMemo<[number, number, number]>(() => {
    const rad = (settings.sunAngle * Math.PI) / 180;
    return [Math.cos(rad) * 15, 8, Math.sin(rad) * 15];
  }, [settings.sunAngle]);

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    if (e.point && onCursorCoordinates) {
      const centerLat = 18.38;
      const centerLon = 77.58;
      const degPerUnit = 0.76 / 18;

      const lat = centerLat - (e.point.z * degPerUnit);
      const lon = centerLon + (e.point.x * degPerUnit);
      onCursorCoordinates({
        lat: Number(lat.toFixed(4)),
        lon: Number(lon.toFixed(4)),
      });
    }
  };

  const handlePointerOut = () => {
    if (onCursorCoordinates) {
      onCursorCoordinates(null);
    }
  };

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.8}
        zoomSpeed={1.0}
        minDistance={2.5}
        maxDistance={25.0}
        maxPolarAngle={Math.PI / 2.05}
      />

      {settings.sunLighting ? (
        <directionalLight
          position={sunPosition}
          intensity={2.4}
          color="#fff2e0"
          castShadow
        />
      ) : (
        <directionalLight position={[0, 12, 6]} intensity={1.6} color="#ffffff" />
      )}

      <ambientLight intensity={0.35} color="#3d1d13" />
      <fog attach="fog" args={['#100a08', 16, 32]} />

      <mesh
        geometry={terrainGeometry}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={activeTexture || undefined}
          roughness={settings.enableTerrainShading ? 0.88 : 0.5}
          metalness={0.05}
          wireframe={settings.wireframeMode}
          flatShading={!settings.enableTerrainShading}
        />
      </mesh>

      {settings.showCoordinateGrid && (
        <group position={[0, -0.05, 0]}>
          <gridHelper
            args={[18, 18, '#ff6239', '#5c2816']}
            position={[0, 0, 0]}
          />
        </group>
      )}

      {JEZERO_LOCAL_FEATURES.map((feature) => {
        const isSelected = selectedFeature?.id === feature.id;
        const isHovered = hoveredFeature === feature.id;
        const [x, yOffset, z] = feature.localOffset;
        const y = yOffset * settings.elevationExaggeration;

        return (
          <group key={feature.id} position={[x, y, z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectFeature(feature);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredFeature(feature.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHoveredFeature(null);
                document.body.style.cursor = 'default';
              }}
            >
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshBasicMaterial
                color={
                  isSelected
                    ? '#ff3b19'
                    : isHovered
                    ? '#ff8554'
                    : feature.category === 'rover-site'
                    ? '#22c55e'
                    : '#ff5722'
                }
              />
            </mesh>

            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([0, 0, 0, 0, 0.7, 0]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={feature.category === 'rover-site' ? '#22c55e' : '#ff5722'}
                transparent
                opacity={0.8}
              />
            </line>

            {settings.showLabels && (
              <Html
                position={[0, 0.85, 0]}
                center
                distanceFactor={10}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-[10px] tracking-wide transition-all ${
                    isSelected
                      ? 'bg-zinc-950/95 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : isHovered
                      ? 'bg-zinc-950/90 border-amber-400 text-amber-100'
                      : feature.category === 'rover-site'
                      ? 'bg-zinc-950/80 border-emerald-500/80 text-emerald-300'
                      : 'bg-zinc-950/75 border-zinc-700/60 text-zinc-300'
                  }`}
                >
                  {feature.category === 'rover-site' ? (
                    <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
                  ) : (
                    <MapPin className="w-3 h-3 text-mars-400" />
                  )}
                  <span className="font-semibold">{feature.name}</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}
