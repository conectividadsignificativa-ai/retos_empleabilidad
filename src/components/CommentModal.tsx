import React, { useState, useEffect } from "react";
import { MessageSquare, Send, X, User, Building, Clock, Heart, CheckCircle2, AlertCircle } from "lucide-react";
import { CommentItem, UserProfile } from "../types";
import { Solution } from "../data/solutionsData";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: Solution | null;
  comments: CommentItem[];
  userProfile: UserProfile;
  onAddComment: (solutionId: string, text: string, authorInfo?: { name: string; org: string; email?: string }) => Promise<void>;
  likesCount: number;
  userLiked: boolean;
  onToggleLike: (solutionId: string) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  solution,
  comments,
  userProfile,
  onAddComment,
  likesCount,
  userLiked,
  onToggleLike
}) => {
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState(userProfile.name || "");
  const [authorOrg, setAuthorOrg] = useState(userProfile.organization || "");
  const [authorEmail, setAuthorEmail] = useState(userProfile.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (userProfile.name) setAuthorName(userProfile.name);
    if (userProfile.organization) setAuthorOrg(userProfile.organization);
    if (userProfile.email) setAuthorEmail(userProfile.email);
    setError("");
    setSuccessMsg("");
  }, [isOpen, userProfile]);

  if (!isOpen || !solution) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const nameToUse = authorName.trim() || userProfile.name.trim() || "Aliado Invitado";
    const orgToUse = authorOrg.trim() || userProfile.organization.trim() || "Entidad Aliada";

    try {
      setIsSubmitting(true);
      setError("");
      await onAddComment(solution.id, newComment.trim(), {
        name: nameToUse,
        org: orgToUse,
        email: authorEmail.trim() || userProfile.email
      });
      setNewComment("");
      setSuccessMsg("¡Aporte publicado exitosamente! Ya es visible para todos los participantes.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error("Error submitting comment:", err);
      setError("No se pudo registrar el comentario en este momento. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Reciente";
    }
  };

  const isCaribe = solution.region === "caribe";
  const accentColor = isCaribe ? "var(--idtf-verde)" : "var(--idtf-naranja)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[var(--idtf-navy)] border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-[var(--idtf-navy-light)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[var(--idtf-navy)]"
                style={{ backgroundColor: accentColor }}
              >
                Solución {solution.number} • NODO {solution.region.toUpperCase()}
              </span>
              <span className="text-white/60 text-xs flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {comments.length} {comments.length === 1 ? "comentario" : "comentarios"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white uppercase leading-snug tracking-tight">
              {solution.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleLike(solution.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                userLiked
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
              title="Votar por esta solución"
            >
              <Heart className={`w-4 h-4 ${userLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time open transparency banner */}
        <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-5 py-2.5 flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              <strong>Muro Abierto:</strong> Todos los comentarios son visibles para cualquier participante o invitado en tiempo real.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-white/70 shrink-0">
            {comments.length} {comments.length === 1 ? "aporte" : "aportes"}
          </span>
        </div>

        {/* Comments List (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-left">
          {comments.length === 0 ? (
            <div className="py-12 text-center text-white/50 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-medium">Aún no hay comentarios sobre esta solución.</p>
              <p className="text-xs text-white/40">Sé el primero en compartir tu retroalimentación o perspectiva territorial.</p>
            </div>
          ) : (
            comments.map((c) => (
              <div 
                key={c.id}
                className="p-4 rounded-xl bg-[var(--idtf-navy-light)] border border-white/10 space-y-2 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                      {c.authorName ? c.authorName.charAt(0).toUpperCase() : "A"}
                    </div>
                    <span>{c.authorName}</span>
                    {c.authorOrg && (
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-white/5 text-[var(--idtf-morado)] border border-white/10">
                        {c.authorOrg}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(c.createdAt)}
                  </div>
                </div>

                <p className="text-sm text-white/80 leading-relaxed pl-8">
                  {c.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* New Comment Form (Sticky bottom) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 border-t border-white/10 bg-[var(--idtf-navy-light)]/90 space-y-3">
          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick identity inputs for guests or unregistered participants */}
          {(!userProfile.name || !userProfile.organization) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Tu Nombre o Alias (opcional / ej. Aliado Territorial)"
                  className="w-full bg-[var(--idtf-navy)] border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--idtf-naranja)]"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={authorOrg}
                  onChange={(e) => setAuthorOrg(e.target.value)}
                  placeholder="Tu Entidad / Organización (opcional / ej. Aliado)"
                  className="w-full bg-[var(--idtf-navy)] border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--idtf-naranja)]"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Escribe tu aporte o comentario público sobre la Solución ${solution.number}...`}
              className="w-full bg-[var(--idtf-navy)] border border-white/20 rounded-xl p-3 pr-12 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--idtf-naranja)] resize-none"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-[var(--idtf-naranja)] text-[var(--idtf-navy)] hover:bg-[var(--idtf-naranja-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
              title="Publicar comentario abierto"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/50">
            <span>
              {userProfile.name ? (
                <>Comentando como: <strong className="text-white">{userProfile.name}</strong> ({userProfile.organization})</>
              ) : (
                <>Comentando como: <strong className="text-emerald-400">{authorName.trim() || "Aliado / Invitado"}</strong> {authorOrg.trim() ? `(${authorOrg.trim()})` : ""}</>
              )}
            </span>
            <span className="text-emerald-400/90 font-medium">Visible para todos los invitados</span>
          </div>
        </form>
      </div>
    </div>
  );
};
