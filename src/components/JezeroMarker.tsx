'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MarsLocation } from '@/types/map';
import { latLonToVector3 } from '@/lib/marsCoordinates';
import { Crosshair, MapPin } from 'lucide-react';

interface JezeroMarkerProps {
  location: MarsLocation;
  radius?: number;
  isSelected: boolean;
  showLabel?: boolean;
  onSelect: (location: MarsLocation) => void;
}

export function JezeroMarker({
  location,
  radius = 2.0,
  isSelected,
  showLabel = true,
  onSelect,
}: JezeroMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Surface anchor position
  const surfacePos = latLonToVector3(
    location.coordinates.latitude,
    location.coordinates.longitude,
    radius,
    0.005
  );

  // Normal vector pointing outwards from Mars center
  const normal = surfacePos.clone().normalize();

  // Floating HUD ring slightly above surface
  const markerPos = surfacePos.clone().add(normal.clone().multiplyScalar(0.04));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      // Gentle radar pulse
      const pulse = 1 + Math.sin(t * 3.5) * 0.18;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
    if (coreRef.current) {
      const corePulse = 1 + Math.cos(t * 4.0) * 0.12;
      coreRef.current.scale.set(corePulse, corePulse, corePulse);
    }
  });

  return (
    <group position={markerPos}>
      {/* Click target hitbox */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(location);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Core glowing orb */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#ff3b19' : hovered ? '#ff7844' : '#ff4d29'}
        />
      </mesh>

      {/* Pulsing targeting ring */}
      <mesh ref={ringRef} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)}>
        <ringGeometry args={[0.038, 0.052, 32]} />
        <meshBasicMaterial
          color={isSelected ? '#ff3b19' : hovered ? '#ffa37b' : '#ff6239'}
          side={THREE.DoubleSide}
          transparent
          opacity={isSelected ? 0.95 : hovered ? 0.9 : 0.75}
        />
      </mesh>

      {/* Stem line anchored to surface */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, -normal.x * 0.04, -normal.y * 0.04, -normal.z * 0.04]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff6239" transparent opacity={0.6} />
      </line>

      {/* HTML HUD Label */}
      {showLabel && (
        <Html
          position={[normal.x * 0.08, normal.y * 0.08, normal.z * 0.08]}
          center
          distanceFactor={6}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-all duration-200 ${
              isSelected
                ? 'bg-mars-900/90 border-mars-500 shadow-[0_0_15px_rgba(255,98,57,0.5)] text-white'
                : hovered
                ? 'bg-zinc-950/90 border-mars-400 text-orange-200'
                : 'bg-zinc-950/75 border-zinc-700/60 text-zinc-300'
            }`}
          >
            <Crosshair className={`w-3 h-3 ${isSelected ? 'text-mars-400 animate-spin' : 'text-mars-500'}`} />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wider uppercase font-mono leading-tight">
                {location.name}
              </span>
              <span className="text-[9px] font-mono text-zinc-400">
                {location.coordinates.latitude > 0 ? `${location.coordinates.latitude}°N` : `${Math.abs(location.coordinates.latitude)}°S`},{' '}
                {location.coordinates.longitude > 0 ? `${location.coordinates.longitude}°E` : `${Math.abs(location.coordinates.longitude)}°W`}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
