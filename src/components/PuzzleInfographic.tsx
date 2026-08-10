import React from "react";
import { 
  BookOpen, 
  Award, 
  FileCheck, 
  EyeOff, 
  Users, 
  HeartHandshake, 
  Wifi, 
  Briefcase,
  Puzzle
} from "lucide-react";

export interface PuzzlePiece {
  id: number;
  label: string;
  icon: any;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  tabDirectionRight?: "out" | "in" | "none";
  tabDirectionBottom?: "out" | "in" | "none";
}

const PUZZLE_PIECES: PuzzlePiece[] = [
  {
    id: 1,
    label: "Formación Técnica",
    icon: BookOpen,
    bgGradient: "from-emerald-950/80 to-slate-900/90",
    borderColor: "border-emerald-500/50",
    textColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/20 text-emerald-300",
    tabDirectionRight: "out",
    tabDirectionBottom: "out",
  },
  {
    id: 2,
    label: "Certificación Práctica",
    icon: Award,
    bgGradient: "from-amber-950/80 to-slate-900/90",
    borderColor: "border-amber-500/50",
    textColor: "text-amber-400",
    badgeBg: "bg-amber-500/20 text-amber-300",
    tabDirectionRight: "in",
    tabDirectionBottom: "out",
  },
  {
    id: 3,
    label: "Pasaporte de Habilidades",
    icon: FileCheck,
    bgGradient: "from-sky-950/80 to-slate-900/90",
    borderColor: "border-sky-500/50",
    textColor: "text-sky-400",
    badgeBg: "bg-sky-500/20 text-sky-300",
    tabDirectionRight: "out",
    tabDirectionBottom: "in",
  },
  {
    id: 4,
    label: "Selección a Ciegas",
    icon: EyeOff,
    bgGradient: "from-purple-950/80 to-slate-900/90",
    borderColor: "border-purple-500/50",
    textColor: "text-purple-400",
    badgeBg: "bg-purple-500/20 text-purple-300",
    tabDirectionRight: "none",
    tabDirectionBottom: "out",
  },
  {
    id: 5,
    label: "Redes de Mentoría",
    icon: Users,
    bgGradient: "from-indigo-950/80 to-slate-900/90",
    borderColor: "border-indigo-500/50",
    textColor: "text-indigo-400",
    badgeBg: "bg-indigo-500/20 text-indigo-300",
    tabDirectionRight: "in",
    tabDirectionBottom: "none",
  },
  {
    id: 6,
    label: "Acompañamiento",
    icon: HeartHandshake,
    bgGradient: "from-rose-950/80 to-slate-900/90",
    borderColor: "border-rose-500/50",
    textColor: "text-rose-400",
    badgeBg: "bg-rose-500/20 text-rose-300",
    tabDirectionRight: "out",
    tabDirectionBottom: "none",
  },
  {
    id: 7,
    label: "Conectividad Productiva",
    icon: Wifi,
    bgGradient: "from-teal-950/80 to-slate-900/90",
    borderColor: "border-teal-500/50",
    textColor: "text-teal-400",
    badgeBg: "bg-teal-500/20 text-teal-300",
    tabDirectionRight: "in",
    tabDirectionBottom: "none",
  },
  {
    id: 8,
    label: "Intermediación Laboral",
    icon: Briefcase,
    bgGradient: "from-orange-950/80 to-slate-900/90",
    borderColor: "border-orange-500/50",
    textColor: "text-orange-400",
    badgeBg: "bg-orange-500/20 text-orange-300",
    tabDirectionRight: "none",
    tabDirectionBottom: "none",
  },
];

export const PuzzleInfographic: React.FC = () => {
  return (
    <div className="w-full my-4">
      {/* Unified Assembled Puzzle Frame */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-950 p-2 shadow-2xl">
        
        {/* Continuous Grid of 8 Interlocking Puzzle Pieces */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/10 rounded-xl overflow-hidden bg-slate-900/80">
          {PUZZLE_PIECES.map((piece, idx) => {
            const Icon = piece.icon;
            
            const isRightEdge = (idx + 1) % 4 === 0;
            const isBottomRow = idx >= 4;

            return (
              <div
                key={piece.id}
                className={`
                  relative p-4 flex flex-col justify-between min-h-[120px] sm:min-h-[135px]
                  bg-gradient-to-br ${piece.bgGradient}
                  transition-all duration-300 hover:brightness-125 hover:z-20 group
                  border-b md:border-b-0 ${!isBottomRow ? "md:border-b" : ""} 
                  ${(idx % 2 === 0) ? "border-r" : "md:border-r"} 
                  ${!isRightEdge ? "md:border-r" : ""}
                  border-white/15
                `}
              >
                {/* Right Tab/Slot Notch */}
                {piece.tabDirectionRight === "out" && (
                  <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-slate-900 border border-white/20 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                    </div>
                  </div>
                )}
                {piece.tabDirectionRight === "in" && (
                  <div className="hidden md:block absolute -left-2 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-white/30" />
                  </div>
                )}

                {/* Bottom Tab/Slot Notch */}
                {piece.tabDirectionBottom === "out" && (
                  <div className="hidden md:block absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-slate-900 border border-white/20 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                    </div>
                  </div>
                )}

                {/* Top Header: Badge + Puzzle Icon */}
                <div className="flex items-center justify-between gap-2 z-10">
                  <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${piece.badgeBg}`}>
                    Pieza {piece.id}
                  </span>
                  <Puzzle className={`w-3.5 h-3.5 ${piece.textColor} opacity-60 group-hover:opacity-100 transition-opacity`} />
                </div>

                {/* Center Content: Icon + Title Only */}
                <div className="my-auto py-2 flex items-center gap-2.5 z-10">
                  <div className={`p-2 rounded-lg bg-white/5 border border-white/10 shrink-0 ${piece.textColor} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs sm:text-sm font-black text-white leading-tight font-mono tracking-tight">
                    {piece.label}
                  </h5>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
