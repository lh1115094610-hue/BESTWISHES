
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS, CONFIG } from '../constants';

interface StarProps {
  progress: React.MutableRefObject<number>;
}

const Star: React.FC<StarProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!meshRef.current || !lightRef.current) return;

    const p = progress.current;
    
    // Position transitions from center of chaos to top of tree
    const targetY = CONFIG.TREE_HEIGHT + 0.5;
    const currentY = THREE.MathUtils.lerp(0, targetY, p);
    meshRef.current.position.y = currentY;
    lightRef.current.position.y = currentY;

    // Reduced scale for a more elegant look: max scale around 0.65 instead of 1.4
    const scale = (0.15 + p * 0.5) * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    meshRef.current.scale.setScalar(scale);

    // Rotation animation
    meshRef.current.rotation.y += 0.02;
    
    // Intensity of light increases as tree forms
    lightRef.current.intensity = p * 12;
    
    // Material emission pulse
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const emissiveIntensity = 4 + Math.sin(state.clock.elapsedTime * 4) * 1.5;
    material.emissiveIntensity = emissiveIntensity * p;
  });

  return (
    // @ts-ignore
    <group>
      {/* @ts-ignore */}
      <mesh ref={meshRef}>
        {/* @ts-ignore */}
        <octahedronGeometry args={[1, 0]} />
        {/* @ts-ignore */}
        <meshStandardMaterial
          color={COLORS.GOLD_BRIGHT}
          emissive={COLORS.GOLD}
          emissiveIntensity={2}
          metalness={1}
          roughness={0}
        />
      {/* @ts-ignore */}
      </mesh>
      {/* @ts-ignore */}
      <pointLight
        ref={lightRef}
        color={COLORS.GOLD_BRIGHT}
        distance={10}
        decay={2}
        intensity={0}
      />
    {/* @ts-ignore */}
    </group>
  );
};

export default Star;