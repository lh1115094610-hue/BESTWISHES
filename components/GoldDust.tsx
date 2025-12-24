
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CONFIG, COLORS } from '../constants';

interface GoldDustProps {
  handPos: { x: number, y: number, active: boolean };
}

const GoldDust: React.FC<GoldDustProps> = ({ handPos }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport, mouse } = useThree();
  
  const particleData = useMemo(() => {
    const count = CONFIG.GOLD_DUST_COUNT;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.04;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
    }
    return { positions, velocities };
  }, []);

  const attractor = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Determine target based on Hand or Mouse
    if (handPos.active) {
      attractor.set(
        (-handPos.x * viewport.width) / 1.5,
        (handPos.y * viewport.height) / 1.5,
        2
      );
    } else {
      attractor.set(
        (mouse.x * viewport.width) / 2,
        (mouse.y * viewport.height) / 2,
        0
      );
    }

    const isActive = handPos.active || Math.abs(mouse.x) > 0.01 || Math.abs(mouse.y) > 0.01;

    for (let i = 0; i < CONFIG.GOLD_DUST_COUNT; i++) {
      const idx = i * 3;
      
      positions[idx] += particleData.velocities[idx];
      positions[idx + 1] += particleData.velocities[idx + 1];
      positions[idx + 2] += particleData.velocities[idx + 2];

      const dx = attractor.x - positions[idx];
      const dy = attractor.y - positions[idx + 1];
      const dz = attractor.z - positions[idx + 2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      const radius = handPos.active ? 15 : 10;
      if (dist < radius && isActive) {
        const force = handPos.active ? (radius - dist) * 0.008 : (radius - dist) * 0.003;
        particleData.velocities[idx] += dx * force;
        particleData.velocities[idx + 1] += dy * force;
        particleData.velocities[idx + 2] += dz * force;
      }

      // Physics logic
      particleData.velocities[idx] *= 0.96;
      particleData.velocities[idx + 1] *= 0.96;
      particleData.velocities[idx + 2] *= 0.96;

      // Small jitter
      particleData.velocities[idx] += (Math.random() - 0.5) * 0.005;
      particleData.velocities[idx + 1] += (Math.random() - 0.5) * 0.005;
      particleData.velocities[idx + 2] += (Math.random() - 0.5) * 0.005;

      // Wrap-around boundaries
      if (Math.abs(positions[idx]) > 40) positions[idx] *= -0.9;
      if (Math.abs(positions[idx + 1]) > 40) positions[idx + 1] *= -0.9;
      if (Math.abs(positions[idx + 2]) > 40) positions[idx + 2] *= -0.9;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    /* @ts-ignore */
    <points ref={pointsRef}>
      {/* @ts-ignore */}
      <bufferGeometry>
        {/* @ts-ignore */}
        <bufferAttribute
          attach="attributes-position"
          count={CONFIG.GOLD_DUST_COUNT}
          array={particleData.positions}
          itemSize={3}
        />
      {/* @ts-ignore */}
      </bufferGeometry>
      {/* @ts-ignore */}
      <pointsMaterial
        size={0.12}
        color={COLORS.GOLD_BRIGHT}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    {/* @ts-ignore */}
    </points>
  );
};

export default GoldDust;
