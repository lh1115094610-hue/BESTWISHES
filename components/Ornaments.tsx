
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CONFIG, COLORS } from '../constants';

interface OrnamentsProps {
  progress: React.MutableRefObject<number>;
}

const Ornaments: React.FC<OrnamentsProps> = ({ progress }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = new THREE.Object3D();

  const ornaments = useMemo(() => {
    const data = [];
    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const rand = Math.random();
      const type = rand > 0.8 ? 'gift' : rand > 0.4 ? 'sphere' : rand > 0.1 ? 'light' : 'magic';
      
      // Chaos Pos
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * CONFIG.CHAOS_RADIUS;
      const chaosPos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );

      // Target Pos
      const h = Math.random() * CONFIG.TREE_HEIGHT;
      const rMax = (1 - h / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      const radius = rMax; 
      const targetPos = new THREE.Vector3(
        radius * Math.cos(angle),
        h,
        radius * Math.sin(angle)
      );

      data.push({
        chaosPos,
        targetPos,
        type,
        color: type === 'gift' ? COLORS.LUXURY_RED : 
               type === 'sphere' ? COLORS.GOLD : 
               type === 'magic' ? '#ffffff' : COLORS.GOLD_BRIGHT,
        weight: type === 'gift' ? 3.0 : type === 'sphere' ? 1.0 : 0.1,
        scale: type === 'gift' ? 0.35 : type === 'sphere' ? 0.18 : 0.08
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    ornaments.forEach((orn, i) => {
      const individualProgress = THREE.MathUtils.clamp(progress.current * (1 / (0.8 + orn.weight * 0.1)), 0, 1);
      const currentPos = new THREE.Vector3().lerpVectors(orn.chaosPos, orn.targetPos, individualProgress);
      
      // Subtle movement
      if (progress.current > 0.9) {
        currentPos.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.03;
      }

      tempObject.position.copy(currentPos);
      
      // Twinkle effect for magic ornaments
      let scaleMult = 1.0;
      if (orn.type === 'magic' || orn.type === 'light') {
        scaleMult = 0.8 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.2;
      }

      tempObject.scale.setScalar(orn.scale * (0.5 + progress.current * 0.5) * scaleMult);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      
      const color = new THREE.Color(orn.color);
      // Brighten the magic ones
      if (orn.type === 'magic') {
        color.multiplyScalar(1.5 + Math.sin(state.clock.elapsedTime * 10) * 0.5);
      }
      meshRef.current!.setColorAt(i, color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    /* @ts-ignore */
    <instancedMesh ref={meshRef} args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}>
      {/* @ts-ignore */}
      <sphereGeometry args={[1, 16, 16]} />
      {/* @ts-ignore */}
      <meshStandardMaterial metalness={0.9} roughness={0.1} />
    {/* @ts-ignore */}
    </instancedMesh>
  );
};

export default Ornaments;
