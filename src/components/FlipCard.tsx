import React, { useState } from "react";
import { Heart, MessageSquare, RotateCw, RotateCcw, AlertTriangle, Sparkles, Handshake, TrendingUp, CheckCircle2 } from "lucide-react";
import { Solution } from "../data/solutionsData";

interface FlipCardProps {
  solution: Solution;
  likesCount: number;
  userLiked: boolean;
  commentsCount: number;
  onToggleLike: (solutionId: string) => void;
  onOpenComments: (solution: Solution) => void;
  onRequestIdentification?: () => void;
  isUserIdentified: boolean;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  solution,
  likesCount,
  userLiked,
  commentsCount,
  onToggleLike,
  onOpenComments,
  onRequestIdentification,
  isUserIdentified
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const isCaribe = solution.region === "caribe";
  const accentColor = isCaribe ? "var(--idtf-verde)" : "var(--idtf-naranja)";
  const accentBorderClass = isCaribe ? "border-emerald-500/30 hover:border-emerald-500/60" : "border-amber-500/30 hover:border-amber-500/60";
  const accentBadgeBg = isCaribe ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30";

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 500);

    if (!isUserIdentified && onRequestIdentification) {
      // Prompt identification if not yet registered, but still register the like
      onToggleLike(solution.id);
    } else {
      onToggleLike(solution.id);
    }
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenComments(solution);
  };

  return (
    <div className={`flip-card-container region-${solution.region} w-full h-[540px] sm:h-[560px] select-none cursor-pointer`}>
      <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>
        
        {/* ================= FRONT OF CARD ================= */}
        <div 
          className={`flip-card-front bg-[var(--idtf-navy-light)] border ${accentBorderClass} p-6 sm:p-7 flex flex-col justify-between shadow-xl transition-all duration-300 hover:shadow-2xl`}
          onClick={() => setIsFlipped(true)}
        >
          {/* Top Info */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${accentBadgeBg}`}>
                Solución {solution.number} • NODO {solution.region.toUpperCase()}
              </span>
              <span className="text-[11px] text-white/50 font-semibold uppercase tracking-wider flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                Haz clic para voltear
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight leading-tight mb-3">
              {solution.title}
            </h3>

            <p className="text-sm text-white/80 leading-relaxed mb-4">
              {solution.shortSummary}
            </p>

            {/* Dolor Clave preview */}
            <div className="p-3.5 rounded-xl bg-[var(--idtf-navy)]/80 border border-white/10 mb-4 space-y-1">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Dolor Corporativo que Resuelve:
              </div>
              <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">
                {solution.corporatePain}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {solution.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium text-white/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Call to Action and Interactions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            {/* Flip Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-white/80" />
              <span>Ver Solución Completa</span>
            </button>

            {/* Like (Heart) button */}
            <button
              type="button"
              onClick={handleLikeClick}
              className={`p-2.5 px-3.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                userLiked
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/20"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
              } ${isHeartAnimating ? "scale-115" : "scale-100"}`}
              title={userLiked ? "Quitar mi voto" : "Dar like (votar por esta solución)"}
            >
              <Heart className={`w-4 h-4 transition-transform ${userLiked ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
              <span className="text-xs font-bold">{likesCount}</span>
            </button>

            {/* Comments button */}
            <button
              type="button"
              onClick={handleCommentsClick}
              className="p-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
              title="Ver o dejar comentarios"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-bold">{commentsCount}</span>
            </button>
          </div>
        </div>

        {/* ================= BACK OF CARD ================= */}
        <div 
          className={`flip-card-back bg-[var(--idtf-navy-light)] border ${accentBorderClass} p-5 sm:p-6 flex flex-col justify-between shadow-2xl`}
        >
          {/* Back Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--idtf-morado)]">
                Detalle Técnico • Solución {solution.number}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight line-clamp-1">
                {solution.title}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-xs font-semibold px-2.5 transition-colors shrink-0"
              title="Voltear al frente"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Voltear</span>
            </button>
          </div>

          {/* Back Scrollable Content */}
          <div className="overflow-y-auto py-3 pr-1 space-y-3.5 text-xs text-left flex-1 custom-scroll">
            
            {/* 1. Dolor Corporativo */}
            <div className="bg-[var(--idtf-navy)]/90 p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Dolor Corporativo / Empresarial:
              </div>
              <p className="text-white/80 leading-relaxed">
                {solution.corporatePain}
              </p>
            </div>

            {/* 2. Solución de Última Milla */}
            <div className="bg-[var(--idtf-navy)]/90 p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Solución de Última Milla:
              </div>
              <p className="text-white/80 leading-relaxed">
                {solution.lastMileSolution}
              </p>
            </div>

            {/* 3. Esquema de Co-inversión */}
            <div className="bg-[var(--idtf-navy)]/90 p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-[var(--idtf-morado)] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Handshake className="w-3.5 h-3.5 text-[var(--idtf-morado)] shrink-0" />
                Esquema de Co-inversión (Transición a la Sostenibilidad):
              </div>
              <p className="text-white/80 leading-relaxed">
                {solution.coInvestment}
              </p>
            </div>

            {/* 4. ROI / Valor Compartido */}
            <div className="bg-[var(--idtf-navy)]/90 p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-[var(--idtf-naranja)] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--idtf-naranja)] shrink-0" />
                Valor Compartido (Retorno de Inversión - ROI):
              </div>
              <p className="text-white/80 leading-relaxed">
                {solution.roi}
              </p>
            </div>

          </div>

          {/* Back Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="text-xs text-white/70 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Volver a vista frontal</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLikeClick}
                className={`p-2 px-3 rounded-lg border flex items-center gap-1.5 transition-all ${
                  userLiked
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
                title="Votar por esta solución"
              >
                <Heart className={`w-3.5 h-3.5 ${userLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                <span className="text-xs font-bold">{likesCount}</span>
              </button>

              <button
                type="button"
                onClick={handleCommentsClick}
                className="p-2 px-3 rounded-lg bg-[var(--idtf-naranja)] hover:bg-[var(--idtf-naranja-dark)] text-[var(--idtf-navy)] font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Ver o agregar comentarios"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comentarios ({commentsCount})</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
