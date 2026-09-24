import React from "react";
import { X, MessageSquare, ThumbsUp, Building2, Calendar, User, FileText, CheckCircle2 } from "lucide-react";
import { SolutionReportMetric } from "../../types";

interface ProposalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: SolutionReportMetric | null;
}

export function ProposalDetailModal({ isOpen, onClose, proposal }: ProposalDetailModalProps) {
  if (!isOpen || !proposal) return null;

  const isPac = proposal.region === "pacifico";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--idtf-navy-light)] border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-black/20 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
              <span className={isPac ? "text-cyan-400" : "text-amber-400"}>
                {isPac ? "Nodo Pacífico" : "Nodo Caribe"}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-white/60">Propuesta #{proposal.number}</span>
              <span className="text-white/40">·</span>
              <span className="text-emerald-400">Ranking #{proposal.rank}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {proposal.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-white/5 px-6 py-3 text-center">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/50">Votos / Likes</div>
            <div className="text-xl font-black text-white flex items-center justify-center gap-1.5 mt-0.5">
              <ThumbsUp className="w-4 h-4 text-cyan-400" />
              <span>{proposal.votesCount}</span>
            </div>
          </div>
          <div className="border-x border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-white/50">% del Total</div>
            <div className="text-xl font-black text-[var(--idtf-naranja)] mt-0.5">
              {proposal.votePercentage}%
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/50">Comentarios</div>
            <div className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1.5 mt-0.5">
              <MessageSquare className="w-4 h-4" />
              <span>{proposal.commentsCount}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body: Comments and Feedback list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--idtf-morado)]" />
              <span>Aportes y Retroalimentación de Aliados ({proposal.comments.length})</span>
            </h4>
          </div>

          {proposal.comments.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-xs border border-dashed border-white/10 rounded-xl p-6">
              Aún no se han registrado comentarios cualitativos para esta propuesta en la plataforma.
            </div>
          ) : (
            <div className="space-y-3">
              {proposal.comments.map((comment) => (
                <div 
                  key={comment.id}
                  className="p-4 rounded-xl bg-black/25 border border-white/10 space-y-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 font-bold text-xs">
                        {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{comment.authorName || "Aliado Territorial"}</span>
                        </div>
                        <div className="text-[11px] text-white/60 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[var(--idtf-naranja)]" />
                          <span>{comment.authorOrg || "Organización Aliada"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-white/40 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(comment.createdAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/90 leading-relaxed pl-9 whitespace-pre-wrap">
                    "{comment.text}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {proposal.tags && proposal.tags.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                Focos estratégicos de la propuesta
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                {proposal.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span>{tag}</span>
                    {idx < proposal.tags.length - 1 && <span className="text-white/30">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
          >
            Cerrar Detalle
          </button>
        </div>

      </div>
    </div>
  );
}
