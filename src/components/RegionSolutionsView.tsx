import React from "react";
import { ArrowLeft, MapPin, Sparkles, Building2, Heart, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { Solution } from "../data/solutionsData";
import { FlipCard } from "./FlipCard";
import { UserProfile, CommentItem } from "../types";

interface RegionSolutionsViewProps {
  region: "pacifico" | "caribe";
  solutions: Solution[];
  likes: Record<string, number>;
  userLikes: Record<string, boolean>;
  comments: Record<string, CommentItem[]>;
  onToggleLike: (solutionId: string) => void;
  onOpenComments: (solution: Solution) => void;
  onBackToRegions: () => void;
  onSwitchRegion: (targetRegion: "pacifico" | "caribe") => void;
  userProfile: UserProfile;
  onOpenProfileModal: () => void;
}

export const RegionSolutionsView: React.FC<RegionSolutionsViewProps> = ({
  region,
  solutions,
  likes,
  userLikes,
  comments,
  onToggleLike,
  onOpenComments,
  onBackToRegions,
  onSwitchRegion,
  userProfile,
  onOpenProfileModal
}) => {
  const isPacifico = region === "pacifico";
  const isCaribe = region === "caribe";

  const otherRegion: "pacifico" | "caribe" = isPacifico ? "caribe" : "pacifico";
  const otherRegionLabel = isPacifico ? "Nodo Caribe" : "Nodo Pacífico";

  const accentColor = isPacifico ? "var(--idtf-naranja)" : "var(--idtf-verde)";
  const regionBadge = isPacifico ? "Nodo Pacífico" : "Nodo Caribe";
  const territoryCities = isPacifico 
    ? "Ecosistema territorial del Nodo Pacífico"
    : "Ecosistema territorial del Nodo Caribe";

  const userLikesInRegion = solutions.filter(s => userLikes[s.id]).length;
  const isIdentified = Boolean(userProfile.name && userProfile.organization);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in text-left">
      
      {/* Top Nav Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <button
          type="button"
          onClick={onBackToRegions}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Selección de Nodo</span>
        </button>

        <div className="flex items-center gap-3">
          {/* User profile capsule */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[var(--idtf-morado)]" />
            {isIdentified ? (
              <span><strong>{userProfile.name}</strong> ({userProfile.organization})</span>
            ) : (
              <span className="text-[var(--idtf-naranja)] font-medium">Registrar mis datos</span>
            )}
          </button>

          {/* Switch region button */}
          <button
            type="button"
            onClick={() => onSwitchRegion(otherRegion)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10"
          >
            <span>Ir a {otherRegionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Region Header Banner */}
      <div className="mb-10 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span 
            className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--idtf-navy)]"
            style={{ backgroundColor: accentColor }}
          >
            {regionBadge}
          </span>
          <span className="text-xs text-white/60 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
            {territoryCities}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
          Soluciones Priorizadas • {isPacifico ? "Nodo Pacífico" : "Nodo Caribe"}
        </h1>

        <p className="text-sm sm:text-base text-white/75 max-w-3xl leading-relaxed">
          A continuación se presentan las <strong className="text-white">{solutions.length} Soluciones de Última Milla</strong> co-diseñadas para el territorio. <strong className="text-white">Haz clic sobre cualquier tarjeta para voltearla en 3D</strong> y consultar su esquema operativo, co-inversión y retorno de inversión (ROI).
        </p>

        {/* Interactive instructions & mini stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-[var(--idtf-navy-light)] border border-white/10 text-xs">
          <div className="flex items-center gap-2 text-white/80">
            <Sparkles className="w-4 h-4 text-[var(--idtf-naranja)] shrink-0" />
            <span>
              <strong>Tip de interacción:</strong> Puedes dar like (voto) en el corazón y hacer clic en el globo de comentarios para dejar tus aportes en la base de datos.
            </span>
          </div>

          <div className="flex items-center gap-4 text-white/70 font-semibold shrink-0">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              Tus votos: {userLikesInRegion} de {solutions.length}
            </span>
            <span className="text-white/30">•</span>
            <span>{solutions.length} Soluciones</span>
          </div>
        </div>
      </div>

      {/* Grid of Flip Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
        {solutions.map((solution) => {
          const solutionLikes = likes[solution.id] || 0;
          const userLiked = Boolean(userLikes[solution.id]);
          const solutionComments = comments[solution.id] || [];

          return (
            <FlipCard
              key={solution.id}
              solution={solution}
              likesCount={solutionLikes}
              userLiked={userLiked}
              commentsCount={solutionComments.length}
              onToggleLike={onToggleLike}
              onOpenComments={onOpenComments}
              onRequestIdentification={onOpenProfileModal}
              isUserIdentified={isIdentified}
            />
          );
        })}
      </div>

      {/* Bottom Completion & Switch Region Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--idtf-verde)] font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Validación Territorial en Vivo</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
            ¿Deseas evaluar también las soluciones del otro nodo?
          </h3>
          <p className="text-xs sm:text-sm text-white/60">
            Puedes explorar las soluciones del <strong className="text-white">{otherRegionLabel}</strong> y comparar sus enfoques de última milla.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBackToRegions}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Volver a Nodos
          </button>
          <button
            type="button"
            onClick={() => onSwitchRegion(otherRegion)}
            className="px-5 py-2.5 rounded-xl bg-[var(--idtf-naranja)] hover:bg-[var(--idtf-naranja-dark)] text-[var(--idtf-navy)] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <span>Explorar {otherRegionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
