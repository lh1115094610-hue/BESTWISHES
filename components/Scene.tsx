
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import BackgroundParticles from './BackgroundParticles';
import Star from './Star';
import Snow from './Snow';

interface SceneProps {
  treeState: TreeState;
  handPos: { x: number, y: number, active: boolean, isFist: boolean };
}

const Scene: React.FC<SceneProps> = ({ treeState, handPos }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rotationVelocity = useRef(0);
  const lastHandX = useRef(0);
  const lastMouseX = useRef(0);
  const isMouseDown = useRef(false);
  const friction = 0.96;
  const progress = useRef(0);
  const [speedIntensity, setSpeedIntensity] = useState(0);

  const { mouse } = useThree();

  useEffect(() => {
    const onDown = () => { isMouseDown.current = true; lastMouseX.current = mouse.x; };
    const onUp = () => { isMouseDown.current = false; };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchstart', onDown);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchend', onUp);
    };
  }, [mouse]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (handPos.active) {
        const dx = -handPos.x - lastHandX.current;
        rotationVelocity.current += dx * 0.04; 
        lastHandX.current = -handPos.x;
      } 
      else if (isMouseDown.current) {
        const dx = mouse.x - lastMouseX.current;
        rotationVelocity.current += dx * 0.05;
        lastMouseX.current = mouse.x;
      }
      else {
        rotationVelocity.current *= friction;
      }

      rotationVelocity.current = THREE.MathUtils.clamp(rotationVelocity.current, -0.25, 0.25);
      groupRef.current.rotation.y += rotationVelocity.current;
      groupRef.current.rotation.y += delta * 0.12;

      const currentSpeed = Math.abs(rotationVelocity.current) * 6.0;
      if (Math.abs(speedIntensity - currentSpeed) > 0.01) {
        setSpeedIntensity(THREE.MathUtils.lerp(speedIntensity, currentSpeed, 0.1));
      }
    }

    const target = treeState === TreeState.FORMED ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 2.5);
  });

  return (
    <>
      <BackgroundParticles intensity={speedIntensity} />
      <Snow />
      {/* Lowered to -6.5 to ensure full visibility of the star and bottom gifts */}
      {/* @ts-ignore */}
      <group ref={groupRef} position={[0, -6.5, 0]}>
        <Foliage progress={progress} />
        <Ornaments progress={progress} />
        <Star progress={progress} />
      {/* @ts-ignore */}
      </group>
    </>
  );
};

export default Scene;
