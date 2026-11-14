'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { MarsTextureEngine } from '@/lib/marsTextures';
import { MarsAtmosphere } from './MarsAtmosphere';
import { JezeroMarker } from './JezeroMarker';
import { MARS_LANDMARKS, latLonToVector3, vector3ToLatLon } from '@/lib/marsCoordinates';
import { MarsLocation, MapDisplaySettings } from '@/types/map';

interface MarsGlobeProps {
  selectedLocation: MarsLocation | null;
  onSelectLocation: (loc: MarsLocation) => void;
  onCursorCoordinates?: (coord: { lat: number; lon: number } | null) => void;
  settings: MapDisplaySettings;
  globeRadius?: number;
  isFocusedOnJezero?: boolean;
  overrideTexture?: THREE.CanvasTexture | null;
}

export function MarsGlobe({
  selectedLocation,
  onSelectLocation,
  onCursorCoordinates,
  settings,
  globeRadius = 2.0,
  isFocusedOnJezero = false,
  overrideTexture = null,
}: MarsGlobeProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const globeMeshRef = useRef<THREE.Mesh>(null);
  const marsGroupRef = useRef<THREE.Group>(null);

  // Baseline Procedural Mars Textures
  const [baseAlbedoTexture, bumpTexture] = useMemo(() => {
    if (typeof window === 'undefined') return [null, null];
    const albedo = MarsTextureEngine.getGlobalAlbedoTexture();
    const bump = MarsTextureEngine.getGlobalBumpTexture();
    return [albedo, bump];
  }, []);

  // Use overrideTexture (Real NASA Trek Viking/MOLA) if available, otherwise baseline
  const activeAlbedo = overrideTexture || baseAlbedoTexture;

  // Sun direction based on settings
  const sunPosition = useMemo<[number, number, number]>(() => {
    const rad = (settings.sunAngle * Math.PI) / 180;
    return [Math.cos(rad) * 12, 4, Math.sin(rad) * 12];
  }, [settings.sunAngle]);

  // Smooth camera target transition
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const cameraDesiredPosRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (isFocusedOnJezero && selectedLocation) {
      const targetPos = latLonToVector3(
        selectedLocation.coordinates.latitude,
        selectedLocation.coordinates.longitude,
        globeRadius
      );
      cameraTargetRef.current.copy(targetPos);

      const normal = targetPos.clone().normalize();
      const lookPos = targetPos.clone().add(normal.multiplyScalar(1.2));
      cameraDesiredPosRef.current = lookPos;
    } else {
      cameraTargetRef.current.set(0, 0, 0);
      cameraDesiredPosRef.current = null;
    }
  }, [isFocusedOnJezero, selectedLocation, globeRadius]);

  // Animation loop
  useFrame((_, delta) => {
    if (settings.autoRotate && !isFocusedOnJezero && globeMeshRef.current) {
      globeMeshRef.current.rotation.y += delta * settings.rotationSpeed * 0.15;
    }

    if (cameraDesiredPosRef.current && controlsRef.current) {
      camera.position.lerp(cameraDesiredPosRef.current, 0.05);
      controlsRef.current.target.lerp(cameraTargetRef.current, 0.05);
      controlsRef.current.update();

      if (camera.position.distanceTo(cameraDesiredPosRef.current) < 0.01) {
        cameraDesiredPosRef.current = null;
      }
    }
  });

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    if (e.point && onCursorCoordinates) {
      const localPoint = e.point.clone();
      if (globeMeshRef.current) {
        localPoint.applyEuler(new THREE.Euler(0, -globeMeshRef.current.rotation.y, 0));
      }
      const coords = vector3ToLatLon(localPoint);
      onCursorCoordinates(coords);
    }
  };

  const handlePointerOut = () => {
    if (onCursorCoordinates) {
      onCursorCoordinates(null);
    }
  };

  const handleDoubleClick = (e: any) => {
    e.stopPropagation();
    if (e.point) {
      const localPoint = e.point.clone();
      if (globeMeshRef.current) {
        localPoint.applyEuler(new THREE.Euler(0, -globeMeshRef.current.rotation.y, 0));
      }
      const coords = vector3ToLatLon(localPoint);
      const closest = MARS_LANDMARKS.find(
        (lm) =>
          Math.abs(lm.coordinates.latitude - coords.lat) < 8 &&
          Math.abs(lm.coordinates.longitude - coords.lon) < 8
      );
      if (closest) {
        onSelectLocation(closest);
      }
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
        minDistance={2.3}
        maxDistance={12.0}
      />

      {settings.sunLighting ? (
        <directionalLight
          position={sunPosition}
          intensity={2.2}
          color="#fff5ea"
          castShadow
        />
      ) : (
        <directionalLight position={[6, 6, 6]} intensity={1.5} color="#ffffff" />
      )}

      <ambientLight intensity={0.25} color="#2a1610" />
      <directionalLight position={[-8, -4, -6]} intensity={0.15} color="#455a74" />

      <group ref={marsGroupRef}>
        <mesh
          ref={globeMeshRef}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          onDoubleClick={handleDoubleClick}
        >
          <sphereGeometry args={[globeRadius, 64, 64]} />
          <meshStandardMaterial
            map={activeAlbedo || undefined}
            bumpMap={bumpTexture || undefined}
            bumpScale={settings.wireframeMode ? 0 : 0.045}
            roughness={0.82}
            metalness={0.04}
            wireframe={settings.wireframeMode}
          />

          {settings.showCoordinateGrid && (
            <mesh scale={[1.002, 1.002, 1.002]}>
              <sphereGeometry args={[globeRadius, 36, 18]} />
              <meshBasicMaterial
                wireframe
                color="#e8734e"
                transparent
                opacity={0.2}
                depthWrite={false}
              />
            </mesh>
          )}

          {MARS_LANDMARKS.map((landmark) => (
            <JezeroMarker
              key={landmark.id}
              location={landmark}
              radius={globeRadius}
              isSelected={selectedLocation?.id === landmark.id}
              showLabel={settings.showLabels}
              onSelect={onSelectLocation}
            />
          ))}
        </mesh>

        {settings.showAtmosphere && !settings.wireframeMode && (
          <MarsAtmosphere radius={globeRadius} sunPosition={sunPosition} />
        )}
      </group>
    </>
  );
}
