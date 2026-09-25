import React, { useState } from "react";
import { Heart, MessageSquare, RotateCw, RotateCcw, AlertTriangle, Sparkles, Handshake, TrendingUp, Users } from "lucide-react";
import { Solution } from "../data/solutionsData";
import { CommentItem } from "../types";

interface FlipCardProps {
  solution: Solution;
  likesCount: number;
  userLiked: boolean;
  comments: CommentItem[];
  onToggleLike: (solutionId: string) => void;
  onOpenComments: (solution: Solution) => void;
  onRequestIdentification?: () => void;
  isUserIdentified: boolean;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  solution,
  likesCount,
  userLiked,
  comments,
  onToggleLike,
  onOpenComments,
  onRequestIdentification,
  isUserIdentified
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const commentsCount = comments.length;
  const latestComment = comments.length > 0 ? comments[0] : null;

  const isCaribe = solution.region === "caribe";
  const accentColor = isCaribe ? "var(--idtf-verde)" : "var(--idtf-naranja)";
  const accentBorderClass = isCaribe ? "border-emerald-500/30 hover:border-emerald-500/60" : "border-amber-500/30 hover:border-amber-500/60";
  const accentBadgeBg = isCaribe ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30";

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 500);

    if (!isUserIdentified && onRequestIdentification) {
      onToggleLike(solution.id);
    } else {
      onToggleLike(solution.id);
    }
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenComments(solution);
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short"
      });
    } catch {
      return "Reciente";
    }
  };

  return (
    <div className={`flip-card-container region-${solution.region} w-full h-[580px] sm:h-[610px] select-none cursor-pointer`}>
      <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>
        
        {/* ================= FRONT OF CARD ================= */}
        <div 
          className={`flip-card-front bg-[var(--idtf-navy-light)] border ${accentBorderClass} p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:shadow-2xl`}
          onClick={() => setIsFlipped(true)}
        >
          {/* Top Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${accentBadgeBg}`}>
                Solución {solution.number} • NODO {solution.region.toUpperCase()}
              </span>
              <span className="text-[11px] text-white/50 font-semibold uppercase tracking-wider flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                Haz clic para voltear
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase tracking-tight leading-tight">
              {solution.title}
            </h3>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-2">
              {solution.shortSummary}
            </p>

            {/* Dolor Clave preview */}
            <div className="p-3 rounded-xl bg-[var(--idtf-navy)]/80 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Dolor Corporativo que Resuelve:
              </div>
              <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                {solution.corporatePain}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {solution.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-white/70"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Public Community Comments Live Preview */}
            <div 
              onClick={handleCommentsClick}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                commentsCount > 0
                  ? "bg-emerald-950/40 hover:bg-emerald-950/60 border-emerald-500/30 hover:border-emerald-500/50"
                  : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/20"
              }`}
              title="Haz clic para ver y aportar comentarios (abierto y visible para todos los invitados)"
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Muro Abierto de Aportes ({commentsCount})</span>
                </span>
                <span className="text-[10px] text-[var(--idtf-naranja)] font-semibold hover:underline">
                  {commentsCount > 0 ? "Ver comentarios de aliados →" : "Opinar como invitado →"}
                </span>
              </div>

              {latestComment ? (
                <div className="text-xs text-white/90">
                  <div className="flex items-center gap-1 text-[11px] text-white/60 mb-0.5">
                    <span className="font-bold text-white truncate max-w-[140px]">{latestComment.authorName}</span>
                    {latestComment.authorOrg && <span className="truncate max-w-[140px]">· {latestComment.authorOrg}</span>}
                  </div>
                  <p className="line-clamp-2 text-white/80 italic text-[11px] pl-1 border-l-2 border-emerald-500/50">
                    "{latestComment.text}"
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-white/50 italic">
                  Todos los invitados pueden ver los comentarios dejados aquí. ¡Sé el primero en aportar!
                </p>
              )}
            </div>
          </div>

          {/* Bottom Call to Action and Interactions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2.5">
            {/* Flip Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-white/80" />
              <span>Ver Ficha Técnica</span>
            </button>

            {/* Like (Heart) button */}
            <button
              type="button"
              onClick={handleLikeClick}
              className={`p-2 px-3 rounded-xl border flex items-center gap-1.5 transition-all ${
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
              className={`p-2 px-3 rounded-xl border flex items-center gap-1.5 transition-colors text-xs font-bold ${
                commentsCount > 0
                  ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
                  : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
              }`}
              title="Ver o dejar comentarios públicos para todos los invitados"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{commentsCount}</span>
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
                Ficha Técnica • Solución {solution.number}
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

            {/* 5. Comentarios y Aportes Públicos de Aliados e Invitados */}
            <div className="bg-[var(--idtf-navy)]/95 p-3.5 rounded-xl border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Aportes de la Comunidad e Invitados ({commentsCount})</span>
                </span>
                <button
                  type="button"
                  onClick={handleCommentsClick}
                  className="text-[10px] text-[var(--idtf-naranja)] hover:underline normal-case font-bold"
                >
                  + Dejar aporte
                </button>
              </div>

              {commentsCount === 0 ? (
                <div 
                  onClick={handleCommentsClick}
                  className="p-3 rounded-lg bg-white/5 border border-dashed border-white/10 text-center cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <p className="text-[11px] text-white/60">
                    Aún no hay comentarios sobre esta propuesta técnica.
                  </p>
                  <span className="text-[10px] font-bold text-[var(--idtf-naranja)] mt-1 inline-block">
                    Haz clic aquí para aportar como invitado (visible para todos)
                  </span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-white/60">
                        <span className="font-bold text-white truncate max-w-[170px]">{c.authorName}</span>
                        <span>{c.authorOrg || "Invitado"} · {formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-white/85 leading-snug">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
              <span>Volver al frente</span>
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
                className="p-2 px-3.5 rounded-lg bg-[var(--idtf-naranja)] hover:bg-[var(--idtf-naranja-dark)] text-[var(--idtf-navy)] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                title="Ver todos los comentarios y aportar"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Muro ({commentsCount})</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

