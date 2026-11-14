'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

export function Starfield({ count = 2500 }: { count?: number }) {
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spherical distribution at far distance
      const r = 85 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Star color temperatures: mostly white/blue-white, some amber/reddish
      const type = Math.random();
      if (type > 0.85) {
        // Warm red/orange star
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.75 + Math.random() * 0.15;
        col[i * 3 + 2] = 0.5 + Math.random() * 0.2;
      } else if (type > 0.7) {
        // Blue-white hot star
        col[i * 3] = 0.8;
        col[i * 3 + 1] = 0.9;
        col[i * 3 + 2] = 1.0;
      } else {
        // Bright white star
        const brightness = 0.7 + Math.random() * 0.3;
        col[i * 3] = brightness;
        col[i * 3 + 1] = brightness;
        col[i * 3 + 2] = brightness;
      }
    }

    return [pos, col];
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        vertexColors
        transparent
        opacity={0.88}
        sizeAttenuation={false}
      />
    </points>
  );
}
