
import React, { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { TreeState } from './types';
import Scene from './components/Scene';
import Overlay from './components/Overlay';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);
  const [handPos, setHandPos] = useState({ x: 0, y: 0, active: false, isFist: false });
  const [interactionEnabled, setInteractionEnabled] = useState(true);
  const [uiVisible, setUiVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
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

    const initMediaPipe = async () => {
      // 检查运行环境
      if (!window.isSecureContext) {
        setCameraError("Insecure Context (Requires HTTPS)");
        setIsReady(true);
        return;
      }

      // @ts-ignore
      if (!window.Hands) {
        if (isMounted) setTimeout(initMediaPipe, 500);
        return;
      }

      try {
        // 1. 初始化 Hands
        // @ts-ignore
        handsInstance = new window.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
        });

        handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        handsInstance.onResults((results: any) => {
          if (!isMounted) return;
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

            if (interactionEnabledRef.current) {
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
            }
          } else {
            setHandPos((prev) => prev.active ? { ...prev, active: false } : prev);
          }
        });

        // 2. 使用原生方式开启摄像头
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              // 开始识别循环
              const detect = async () => {
                if (videoRef.current && handsInstance) {
                  await handsInstance.send({ image: videoRef.current });
                }
                if (isMounted) requestRef.current = requestAnimationFrame(detect);
              };
              requestRef.current = requestAnimationFrame(detect);
            };
          }
        } catch (e: any) {
          console.warn("Camera access failed:", e);
          setCameraError(e.name === 'NotAllowedError' ? "Permission Denied" : "Hardware Error");
        }
        
        if (isMounted) setIsReady(true);
      } catch (err) {
        console.error("MediaPipe initialization failed:", err);
        if (isMounted) {
          setIsReady(true);
          setCameraError("Init Failed");
        }
      }
    };

    initMediaPipe();

    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (handsInstance) handsInstance.close();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#011612]">
      {!isReady && (
        <div className="absolute inset-0 z-[100] bg-[#011612] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs animate-pulse">Initializing Luxury Experience</p>
        </div>
      )}

      {uiVisible && (
        <div className={`absolute top-6 left-6 z-50 overflow-hidden rounded-xl border-2 transition-all duration-500 shadow-2xl ${handPos.active ? (handPos.isFist ? 'border-red-500 scale-110' : 'border-amber-400 scale-110') : 'border-white/20 opacity-40'}`}>
          <video ref={videoRef} id="video-preview" playsInline muted className="w-32 h-24 object-cover bg-black" />
          <div className={`absolute inset-0 transition-colors duration-300 ${handPos.active && handPos.isFist ? 'bg-red-500/20' : 'bg-transparent'}`} />
          <div className="absolute bottom-1 left-1 px-1 bg-black/50 rounded text-[8px] text-white font-bold uppercase tracking-tighter">
            {cameraError ? cameraError : !interactionEnabled ? 'GESTURE DISABLED' : handPos.active ? (handPos.isFist ? 'FIST - SUMMON' : 'OPEN - RELEASE') : 'Waiting for Hand'}
          </div>
        </div>
      )}

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
          <EffectComposer disableNormalPass>
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
