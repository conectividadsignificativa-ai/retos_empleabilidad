import React, { useState } from "react";
import { MapPin, Sparkles, Compass, Check, ArrowRight, Globe, Shield, Zap } from "lucide-react";
import { Territory } from "../types";

interface Colombia3DMapProps {
  selectedTerritory: Territory;
  onSelectTerritory: (territory: Territory) => void;
  onProceed?: () => void;
}

interface MapRegion {
  id: "pacifico" | "caribe";
  territoryValue: Territory;
  name: string;
  badge: string;
  xPercent: number; // Position on SVG / container
  yPercent: number;
  description: string;
  cities: string;
  challengesSummary: string;
  accentColor: string;
}

const REGIONS: MapRegion[] = [
  {
    id: "caribe",
    territoryValue: "Caribe (Barranquilla, Cartagena, etc.)",
    name: "Caribe",
    badge: "Norte de Colombia",
    xPercent: 52,
    yPercent: 18,
    description: "Visibilidad del talento sin sesgos, Pasaporte de Habilidades, redes de mentoría y acompañamiento integral socioemocional y digital.",
    cities: "Barranquilla, Cartagena, Santa Marta, Montería, Riohacha",
    challengesSummary: "Retos C & D (Visibilidad del Talento & Acompañamiento Integral)",
    accentColor: "var(--idtf-verde, #10b981)"
  },
  {
    id: "pacifico",
    territoryValue: "Pacífico (Cali, Pasto, Buenaventura, etc.)",
    name: "Pacífico",
    badge: "Occidente de Colombia",
    xPercent: 23,
    yPercent: 48,
    description: "Ruta articulada de empleabilidad digital, prácticas en Sandboxes simulados, módulos adaptables y acompañamiento psicosocial con referentes locales.",
    cities: "Cali, Pasto, Buenaventura, Quibdó, Tumaco",
    challengesSummary: "Retos A & B (Ruta Articulada & Acompañamiento Psicosocial)",
    accentColor: "var(--idtf-naranja, #f97316)"
  }
];

export const Colombia3DMap: React.FC<Colombia3DMapProps> = ({
  selectedTerritory,
  onSelectTerritory,
  onProceed
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse tilt effect for 3D container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const activeRegion = REGIONS.find(r => r.territoryValue === selectedTerritory) || REGIONS[1];

  return (
    <div className="w-full flex flex-col items-center gap-8 py-4 select-none">
      
      {/* 3D Digital Canvas Map Container */}
      <div 
        className="relative w-full max-w-4xl min-h-[460px] sm:min-h-[520px] rounded-[var(--idtf-radius-lg,16px)] bg-radial from-[#151c38] via-[#0d1226] to-[#080b18] border border-white/15 shadow-2xl overflow-hidden p-6 sm:p-10 flex flex-col items-center justify-center transition-transform duration-200 ease-out"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 80px rgba(120, 80, 255, 0.08)"
        }}
      >
        {/* Futuristic Cybernetic Background Grid & Lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
            transform: `perspective(1000px) rotateX(${mousePos.y * 10}deg) rotateY(${mousePos.x * 10}deg)`
          }}
        />

        {/* Tech Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--idtf-naranja, #f97316)]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[var(--idtf-morado, #a855f7)]/20 rounded-full blur-3xl pointer-events-none" />

        {/* HUD Top Tech Overlay Bar */}
        <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-[10px] font-mono tracking-widest text-white/50 uppercase pointer-events-none z-10 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 text-[var(--idtf-naranja,#f97316)] font-bold">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            MAPA DIGITAL COLOMBIA 3D · IDTF FACILITY
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span>LAT: 4.5709° N</span>
            <span>LON: 74.2973° W</span>
            <span className="text-[var(--idtf-verde,#10b981)] font-bold">● VIVO</span>
          </div>
        </div>

        {/* 3D Isometric Map Stage with Interactive Tilt */}
        <div 
          className="relative w-full max-w-md h-[380px] sm:h-[420px] flex items-center justify-center transition-transform duration-300 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${20 + mousePos.y * 12}deg) rotateY(${mousePos.x * 15}deg) rotateZ(-3deg)`
          }}
        >
          
          {/* 3D Map Base Elevation Shadow Platform */}
          <div 
            className="absolute inset-x-6 bottom-4 h-[320px] rounded-full bg-black/60 blur-2xl transform translate-y-12 scale-90 pointer-events-none" 
          />

          {/* Styled SVG Silhouette of Colombia with 3D Depth Layering */}
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* Lower Shadow Layer for 3D Extrusion */}
            <svg 
              viewBox="0 0 400 530" 
              className="absolute w-[280px] sm:w-[330px] h-auto text-black/60 filter blur-[3px] transform translate-y-5 translate-x-2 pointer-events-none"
              aria-hidden="true"
            >
              <path 
                d="M 222,18 C 235,20 248,28 258,40 C 265,48 260,58 245,64 C 230,70 212,65 195,65 C 178,65 162,75 148,88 C 136,98 126,112 114,128 C 105,140 98,152 92,160 C 86,168 88,178 82,188 C 76,198 68,212 68,228 C 68,244 78,258 82,272 C 86,286 72,305 62,325 C 54,342 48,355 60,365 C 72,375 92,378 110,388 C 128,398 148,410 168,425 C 188,440 215,460 238,485 C 248,495 254,510 256,518 C 258,512 263,492 260,475 C 258,458 248,442 250,428 C 252,412 272,398 292,382 C 312,366 328,346 338,325 C 346,305 344,280 358,255 C 368,235 375,215 365,198 C 354,185 332,182 315,178 C 298,172 278,162 270,145 C 262,128 274,115 265,106 C 256,98 244,106 238,92 C 232,78 234,55 228,38 C 224,28 220,20 222,18 Z" 
                fill="currentColor"
              />
            </svg>

            {/* Glowing Main Map SVG Layer */}
            <svg 
              viewBox="0 0 400 530" 
              className="relative w-[280px] sm:w-[330px] h-auto filter drop-shadow-[0_0_15px_rgba(56,189,248,0.4)] pointer-events-none"
            >
              <defs>
                <linearGradient id="colombiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f2b48" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#0b1e36" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#081527" stopOpacity="0.9" />
                </linearGradient>

                <pattern id="gridPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                </pattern>
              </defs>

              {/* Main Colombia Contour Path (Filled with deep blue) */}
              <path 
                d="M 222,18 C 235,20 248,28 258,40 C 265,48 260,58 245,64 C 230,70 212,65 195,65 C 178,65 162,75 148,88 C 136,98 126,112 114,128 C 105,140 98,152 92,160 C 86,168 88,178 82,188 C 76,198 68,212 68,228 C 68,244 78,258 82,272 C 86,286 72,305 62,325 C 54,342 48,355 60,365 C 72,375 92,378 110,388 C 128,398 148,410 168,425 C 188,440 215,460 238,485 C 248,495 254,510 256,518 C 258,512 263,492 260,475 C 258,458 248,442 250,428 C 252,412 272,398 292,382 C 312,366 328,346 338,325 C 346,305 344,280 358,255 C 368,235 375,215 365,198 C 354,185 332,182 315,178 C 298,172 278,162 270,145 C 262,128 274,115 265,106 C 256,98 244,106 238,92 C 232,78 234,55 228,38 C 224,28 220,20 222,18 Z" 
                fill="url(#colombiaGradient)"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Tech Mesh Overlay inside Map */}
              <path 
                d="M 222,18 C 235,20 248,28 258,40 C 265,48 260,58 245,64 C 230,70 212,65 195,65 C 178,65 162,75 148,88 C 136,98 126,112 114,128 C 105,140 98,152 92,160 C 86,168 88,178 82,188 C 76,198 68,212 68,228 C 68,244 78,258 82,272 C 86,286 72,305 62,325 C 54,342 48,355 60,365 C 72,375 92,378 110,388 C 128,398 148,410 168,425 C 188,440 215,460 238,485 C 248,495 254,510 256,518 C 258,512 263,492 260,475 C 258,458 248,442 250,428 C 252,412 272,398 292,382 C 312,366 328,346 338,325 C 346,305 344,280 358,255 C 368,235 375,215 365,198 C 354,185 332,182 315,178 C 298,172 278,162 270,145 C 262,128 274,115 265,106 C 256,98 244,106 238,92 C 232,78 234,55 228,38 C 224,28 220,20 222,18 Z" 
                fill="url(#gridPattern)"
              />

              {/* Decorative Regional Connection Rays */}
              <line x1="208" y1="95" x2="92" y2="254" stroke="rgba(249, 115, 22, 0.4)" strokeDasharray="3,3" strokeWidth="1.5" />
            </svg>

            {/* Interactive Region Pin Nodes (Absolute Positioning over Map Overlay) */}
            {REGIONS.map((region) => {
              const isSelected = selectedTerritory === region.territoryValue;
              const isHovered = hoveredRegion === region.id;

              return (
                <div
                  key={region.id}
                  className="absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 group z-20"
                  style={{
                    left: `${region.xPercent}%`,
                    top: `${region.yPercent}%`
                  }}
                  onClick={() => onSelectTerritory(region.territoryValue)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  {/* Glowing Radar Waves */}
                  <div 
                    className={`absolute inset-0 -m-3 rounded-full animate-ping pointer-events-none opacity-60 ${
                      isSelected ? 'bg-[var(--idtf-naranja,#f97316)]' : 'bg-cyan-400'
                    }`}
                    style={{ animationDuration: isSelected ? '2s' : '3.5s' }}
                  />

                  {/* Node Outer Ring */}
                  <div 
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-md ${
                      isSelected 
                        ? 'bg-[var(--idtf-naranja,#f97316)] text-slate-950 scale-125 ring-4 ring-[var(--idtf-naranja,#f97316)]/50 shadow-[0_0_25px_rgba(249,115,22,0.8)]' 
                        : isHovered
                          ? 'bg-cyan-500 text-white scale-110 ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                          : 'bg-slate-900/90 text-white border border-white/30 hover:border-white'
                    }`}
                  >
                    <MapPin className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'stroke-[2.5]' : ''}`} />
                  </div>

                  {/* Node Hover/Selected Floating Badge Pin */}
                  <div 
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wider transition-all duration-200 shadow-xl border ${
                      isSelected
                        ? 'bg-[var(--idtf-naranja,#f97316)] text-slate-950 border-white font-black scale-105'
                        : isHovered
                          ? 'bg-cyan-500 text-white border-cyan-300 scale-100'
                          : 'bg-slate-900/95 text-white/90 border-white/20'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {region.name.toUpperCase()}
                    </span>
                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* HUD Bottom Legend */}
        <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-white/60 pointer-events-none z-10 border-t border-white/10 pt-2">
          <span>Haz clic en un punto del mapa para seleccionar tu zona</span>
          <span className="text-[var(--idtf-naranja,#f97316)] font-bold">● Zona Seleccionada: {activeRegion.name}</span>
        </div>

      </div>

      {/* Confirmation CTA button if provided */}
      {onProceed && (
        <div className="pt-2 w-full max-w-md">
          <button
            type="button"
            onClick={onProceed}
            className="idtf-btn idtf-btn--primary w-full py-4 text-base font-extrabold flex items-center justify-center gap-3 shadow-2xl"
          >
            Continuar con {activeRegion.name}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
};
