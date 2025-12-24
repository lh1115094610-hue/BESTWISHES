
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CONFIG, COLORS } from '../constants';

interface FoliageProps {
  progress: React.MutableRefObject<number>;
}

const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, chaosPositions, targetPositions } = useMemo(() => {
    const count = CONFIG.FOLIAGE_COUNT;
    const chaos = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const initial = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Chaos: Random Sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * CONFIG.CHAOS_RADIUS;
      chaos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      chaos[i * 3 + 2] = r * Math.cos(phi);

      // Target: Cone Shape
      const h = Math.random() * CONFIG.TREE_HEIGHT;
      const rMax = (1 - h / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * rMax;
      target[i * 3] = radius * Math.cos(angle);
      target[i * 3 + 1] = h;
      target[i * 3 + 2] = radius * Math.sin(angle);

      initial[i * 3] = chaos[i * 3];
      initial[i * 3 + 1] = chaos[i * 3 + 1];
      initial[i * 3 + 2] = chaos[i * 3 + 2];
    }

    return { 
      positions: initial, 
      chaosPositions: chaos, 
      targetPositions: target 
    };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColor: { value: new THREE.Color(COLORS.EMERALD) },
    uGold: { value: new THREE.Color(COLORS.GOLD) }
  }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uProgress.value = progress.current;
    }
  });

  return (
    /* @ts-ignore - R3F Intrinsic Element */
    <points ref={pointsRef}>
      {/* @ts-ignore - R3F Intrinsic Element */}
      <bufferGeometry>
        {/* @ts-ignore - R3F Intrinsic Element */}
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        {/* @ts-ignore - R3F Intrinsic Element */}
        <bufferAttribute
          attach="attributes-aChaosPos"
          count={chaosPositions.length / 3}
          array={chaosPositions}
          itemSize={3}
        />
        {/* @ts-ignore - R3F Intrinsic Element */}
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={targetPositions.length / 3}
          array={targetPositions}
          itemSize={3}
        />
      {/* @ts-ignore - R3F Intrinsic Element */}
      </bufferGeometry>
      {/* @ts-ignore - R3F Intrinsic Element */}
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uProgress;
          attribute vec3 aChaosPos;
          attribute vec3 aTargetPos;
          varying vec3 vPos;
          varying float vDist;

          void main() {
            vec3 pos = mix(aChaosPos, aTargetPos, uProgress);
            
            // Add some subtle organic movement
            pos.x += sin(uTime * 0.5 + pos.y) * 0.05;
            pos.z += cos(uTime * 0.5 + pos.x) * 0.05;

            vPos = pos;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = (15.0 / -mvPosition.z) * (1.0 + sin(uTime + pos.y) * 0.2);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform vec3 uGold;
          uniform float uProgress;
          varying vec3 vPos;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            float alpha = smoothstep(0.5, 0.2, dist);
            
            // Emerald to Gold blend based on height for formed tree
            vec3 finalColor = mix(uColor, uGold, clamp(vPos.y * 0.1, 0.0, 1.0));
            
            // Add a sparkle effect
            float sparkle = pow(abs(sin(vPos.x * 10.0 + vPos.y * 10.0)), 20.0);
            finalColor += uGold * sparkle * 0.5;

            gl_FragColor = vec4(finalColor, alpha * 0.8);
          }
        `}
      />
    {/* @ts-ignore - R3F Intrinsic Element */}
    </points>
  );
};

export default Foliage;
