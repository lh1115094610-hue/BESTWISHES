import React, { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { TreeState } from './types';
import Scene from './components/Scene';
import Overlay from './components/Overlay';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [handPos, setHandPos] = useState({ x: 0, y: 0, active: false, isFist: false });
  const [interactionEnabled, setInteractionEnabled] = useState(true);
  const [uiVisible, setUiVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const treeStateRef = useRef<TreeState>(treeState);
  const interactionEnabledRef = useRef<boolean>(interactionEnabled);
  const lastStateChange = useRef(0);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    treeStateRef.current = treeState;
  }, [treeState]);

  useEffect(() => {
    interactionEnabledRef.current = interactionEnabled;
  }, [interactionEnabled]);

  const toggleState = useCallback(() => {
    setTreeState((prev) => (prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS));
  }, []);

  const toggleInteraction = useCallback(() => {
    setInteractionEnabled(prev => !prev);
  }, []);

  const toggleUi = useCallback(() => {
    setUiVisible(prev => !prev);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let handsInstance: any = null;
    let stream: MediaStream | null = null;

    const startInteraction = async () => {
      if (!interactionEnabled) {
        setIsReady(true);
        return;
      }

      setIsCameraStarting(true);
      setCameraError(null);

      // 检查运行环境
      if (!window.isSecureContext) {
        setCameraError("Insecure Context");
        setIsReady(true);
        setIsCameraStarting(false);
        return;
      }

      // 等待 MediaPipe 库加载
      // Fix: Access Hands through (window as any) to resolve TypeScript property error
      if (!(window as any).Hands) {
        let attempts = 0;
        while (!(window as any).Hands && attempts < 20) {
          await new Promise(r => setTimeout(r, 200));
          attempts++;
        }
      }

      try {
        // Fix: Use (window as any).Hands to instantiate the MediaPipe Hands class
        handsInstance = new (window as any).Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
        });

        handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        handsInstance.onResults((results: any) => {
          if (!isMounted || !interactionEnabledRef.current) return;
          if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const x = (landmarks[8].x - 0.5) * 2;
            const y = -(landmarks[8].y - 0.5) * 2;
            const wrist = landmarks[0];
            const tips = [8, 12, 16, 20];
            const avgDist = tips.reduce((sum, tipIdx) => {
              const dx = landmarks[tipIdx].x - wrist.x;
              const dy = landmarks[tipIdx].y - wrist.y;
              return sum + Math.sqrt(dx*dx + dy*dy);
            }, 0) / 4;

            const isFist = avgDist < 0.25;
            const isOpen = avgDist > 0.42;

            setHandPos({ x, y, active: true, isFist });

            const now = Date.now();
            if (now - lastStateChange.current > 1000) { 
              if (isFist && treeStateRef.current === TreeState.CHAOS) {
                setTreeState(TreeState.FORMED);
                lastStateChange.current = now;
              } else if (isOpen && treeStateRef.current === TreeState.FORMED) {
                setTreeState(TreeState.CHAOS);
                lastStateChange.current = now;
              }
            }
          } else {
            setHandPos((prev) => prev.active ? { ...prev, active: false } : prev);
          }
        });

        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: 'user' } 
        });
        
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!isMounted) return;
            videoRef.current?.play();
            setIsCameraStarting(false);
            const detect = async () => {
              if (videoRef.current && handsInstance && interactionEnabledRef.current) {
                await handsInstance.send({ image: videoRef.current });
                if (isMounted) requestRef.current = requestAnimationFrame(detect);
              }
            };
            requestRef.current = requestAnimationFrame(detect);
          };
        }
      } catch (err: any) {
        console.error("Interaction start failed:", err);
        if (isMounted) {
          setCameraError(err.name === 'NotAllowedError' ? "Permission Denied" : "Hardware Error");
          setIsCameraStarting(false);
        }
      }
      if (isMounted) setIsReady(true);
    };

    const stopInteraction = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (handsInstance) {
        handsInstance.close();
        handsInstance = null;
      }
      setHandPos({ x: 0, y: 0, active: false, isFist: false });
    };

    if (interactionEnabled) {
      startInteraction();
    } else {
      stopInteraction();
      setIsReady(true);
    }

    return () => {
      isMounted = false;
      stopInteraction();
    };
  }, [interactionEnabled]);

  return (
    <div className="relative w-full h-screen bg-[#011612]">
      {!isReady && (
        <div className="absolute inset-0 z-[100] bg-[#011612] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs animate-pulse">Initializing Luxury Experience</p>
        </div>
      )}

      {/* 摄像头预览：逻辑已升级 */}
      <div className={`absolute top-6 left-6 z-50 overflow-hidden rounded-xl border-2 transition-all duration-700 shadow-2xl pointer-events-none
        ${uiVisible && interactionEnabled ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-4'}
        ${handPos.active ? (handPos.isFist ? 'border-red-500' : 'border-amber-400') : 'border-white/20'}`}>
        
        <div className="w-32 h-24 bg-black relative flex items-center justify-center">
          {isCameraStarting ? (
            <div className="w-6 h-6 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          ) : !interactionEnabled ? (
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Offline</div>
          ) : null}
          <video ref={videoRef} id="video-preview" playsInline muted className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isCameraStarting ? 'opacity-0' : 'opacity-100'}`} />
          <div className={`absolute inset-0 transition-colors duration-300 ${handPos.active && handPos.isFist ? 'bg-red-500/20' : 'bg-transparent'}`} />
        </div>
        
        <div className="absolute bottom-1 left-1 px-1 bg-black/50 rounded text-[8px] text-white font-bold uppercase tracking-tighter">
          {cameraError ? cameraError : !interactionEnabled ? 'GESTURE OFF' : isCameraStarting ? 'WAKING UP...' : handPos.active ? (handPos.isFist ? 'FIST - SUMMON' : 'OPEN - RELEASE') : 'Waiting for Hand'}
        </div>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 4, 24]} fov={40} />
        <Suspense fallback={null}>
          <Environment preset="lobby" />
          {/* @ts-ignore */}
          <ambientLight intensity={0.2} />
          {/* @ts-ignore */}
          <spotLight position={[15, 25, 15]} angle={0.15} penumbra={1} intensity={2.5} castShadow />
          {/* @ts-ignore */}
          <pointLight position={[-10, -5, -10]} intensity={1.5} color="#ffd700" />
          <Scene treeState={treeState} handPos={handPos} />
          <ContactShadows position={[0, -7, 0]} opacity={0.6} scale={50} blur={3} far={15} />
          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.6} radius={0.5} />
            <Noise opacity={0.03} />
            <Vignette eskil={false} offset={0.05} darkness={1.3} />
          </EffectComposer>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} makeDefault />
      </Canvas>

      <Overlay 
        treeState={treeState} 
        onToggle={toggleState} 
        uiVisible={uiVisible}
        onToggleUi={toggleUi}
        interactionEnabled={interactionEnabled}
        onToggleInteraction={toggleInteraction}
      />
    </div>
  );
};

export default App;