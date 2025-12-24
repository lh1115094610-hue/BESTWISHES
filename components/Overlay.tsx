
import React from 'react';
import { TreeState } from '../types';

interface OverlayProps {
  treeState: TreeState;
  onToggle: () => void;
  uiVisible: boolean;
  onToggleUi: () => void;
  interactionEnabled: boolean;
  onToggleInteraction: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ 
  treeState, 
  onToggle, 
  uiVisible, 
  onToggleUi, 
  interactionEnabled, 
  onToggleInteraction 
}) => {
  const isReleased = treeState === TreeState.CHAOS;

  return (
    <>
      {/* 浮动控制按钮 - 始终可见或通过特定逻辑触发 */}
      <div className="absolute top-6 right-6 z-[60] flex gap-3 pointer-events-auto">
        <button
          onClick={onToggleInteraction}
          title={interactionEnabled ? "Disable Gestures" : "Enable Gestures"}
          className={`p-3 rounded-full border transition-all duration-300 backdrop-blur-md shadow-lg ${
            interactionEnabled 
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' 
              : 'bg-white/5 border-white/20 text-white/40'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6 3V11m0-5.5a1.5 1.5 0 013 0v4.5" />
          </svg>
        </button>

        <button
          onClick={onToggleUi}
          title={uiVisible ? "Hide UI" : "Show UI"}
          className="p-3 bg-white/5 border border-white/20 rounded-full backdrop-blur-md text-white hover:bg-white/10 transition-all shadow-lg"
        >
          {uiVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          )}
        </button>
      </div>

      {/* 主 UI 内容 */}
      <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 transition-all duration-700 ${uiVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
        <header className="flex flex-col items-start gap-2">
          <h2 className="text-amber-400 text-xs tracking-[0.4em] uppercase font-semibold">
            AI-Powered Seasonal Masterpiece
          </h2>
          <h1 className="text-white text-4xl md:text-6xl font-black drop-shadow-2xl">
            KINETIC <span className="text-amber-500 italic">LUXURY</span>
            <br />
            FORCE TREE
          </h1>
        </header>

        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out px-4 text-center
            ${isReleased ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-4'}`}
        >
          <div className="flex flex-col items-center">
            <div className="h-[1px] w-24 bg-amber-500/50 mb-6"></div>
            <h2 className="text-amber-500 text-5xl md:text-8xl font-black tracking-[0.2em] uppercase drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
              Merry
              <br />
              Christmas
            </h2>
            <div className="h-[1px] w-24 bg-amber-500/50 mt-6"></div>
            <p className="text-amber-200/60 mt-4 tracking-[0.8em] uppercase text-[10px] md:text-xs">
              Peace & Joy to the World
            </p>
          </div>
        </div>

        <footer className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xs text-amber-100/60 text-sm leading-relaxed">
            <div className="space-y-3 mb-4">
              <p className={`transition-opacity ${interactionEnabled ? 'opacity-100' : 'opacity-30'}`}>
                <span className="text-red-500 font-bold uppercase text-[10px] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Fist</span>
                <span className="ml-2">Summon the Grand Tree</span>
              </p>
              <p className={`transition-opacity ${interactionEnabled ? 'opacity-100' : 'opacity-30'}`}>
                <span className="text-amber-400 font-bold uppercase text-[10px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Open Palm</span>
                <span className="ml-2">Release to Chaos Particles</span>
              </p>
              <p>
                <span className="text-blue-400 font-bold uppercase text-[10px] bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">Swipe</span>
                <span className="ml-2">Spin with hyper-intensity</span>
              </p>
            </div>
            {!interactionEnabled && (
              <div className="text-amber-500/60 text-[10px] font-bold uppercase tracking-widest mb-4">
                Gesture Control: [OFF]
              </div>
            )}
            <div className="h-[1px] w-12 bg-amber-500/30 mb-4"></div>
            <p className="italic">The universe reacts to your motion.</p>
          </div>

          <button
            onClick={onToggle}
            className={`pointer-events-auto group relative overflow-hidden bg-gradient-to-br from-amber-600 to-amber-400 px-10 py-5 rounded-full shadow-[0_10px_40px_-10px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95 ${!uiVisible ? 'pointer-events-none' : ''}`}
          >
            <span className="relative z-10 text-white font-black tracking-widest text-lg uppercase flex items-center gap-3">
              {isReleased ? 'Summon' : 'Release'}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform duration-500 ${!isReleased ? 'rotate-180' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </footer>
      </div>
    </>
  );
};

export default Overlay;
