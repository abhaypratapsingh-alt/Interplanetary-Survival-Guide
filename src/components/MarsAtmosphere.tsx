'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  uniform vec3 uSunDirection;
  uniform vec3 uColor;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel rim intensity
    float fresnel = 1.0 - max(0.0, dot(normal, viewDir));
    float intensity = pow(fresnel, 3.2) * 1.4;

    // Sunlight alignment (brighter on sunlit side of atmosphere)
    float sunAlignment = max(0.15, dot(normal, normalize(uSunDirection)));
    
    vec3 finalColor = uColor * (0.4 + 0.6 * sunAlignment);
    float alpha = clamp(intensity * (0.2 + 0.8 * sunAlignment), 0.0, 0.85);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface MarsAtmosphereProps {
  radius?: number;
  sunPosition?: [number, number, number];
}

export function MarsAtmosphere({
  radius = 2.0,
  sunPosition = [10, 5, 8],
}: MarsAtmosphereProps) {
  const uniforms = useMemo(
    () => ({
      uSunDirection: { value: new THREE.Vector3(...sunPosition).normalize() },
      uColor: { value: new THREE.Color('#ff7844') }, // Martian dust & thin atmosphere glow
    }),
    [sunPosition]
  );

  return (
    <mesh scale={[1.028, 1.028, 1.028]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}
