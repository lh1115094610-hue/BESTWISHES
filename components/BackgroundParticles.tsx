
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface BackgroundParticlesProps {
  intensity: number;
}

const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({ intensity }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 500; 

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 35 + Math.random() * 45; // Slightly further out to not interfere with the tree
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos];
  }, []);

  useFrame((state) => {
    if (pointsRef.current && pointsRef.current.material) {
      pointsRef.current.rotation.y += 0.0002;
      pointsRef.current.rotation.x += 0.0001;
      
      const material = pointsRef.current.material as THREE.PointsMaterial;
      if (material.opacity !== undefined) {
        // Ambient glow that brightens significantly when spinning
        material.opacity = THREE.MathUtils.lerp(material.opacity, 0.15 + intensity * 0.45, 0.08);
        material.size = THREE.MathUtils.lerp(material.size, 0.08 + intensity * 0.12, 0.08);
      }
    }
  });

  return (
    /* @ts-ignore */
    <points ref={pointsRef}>
      {/* @ts-ignore */}
      <bufferGeometry>
        {/* @ts-ignore */}
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      {/* @ts-ignore */}
      </bufferGeometry>
      {/* @ts-ignore */}
      <pointsMaterial
        color="#ffffff"
        size={0.08}
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    {/* @ts-ignore */}
    </points>
  );
};

export default BackgroundParticles;
