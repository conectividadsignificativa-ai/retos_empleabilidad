import React from "react";
import { MapPin, ArrowRight, Sparkles, Building2, Users2, ShieldCheck, Heart, MessageSquare } from "lucide-react";
import { UserProfile } from "../types";

interface RegionSelectorProps {
  onSelectRegion: (region: "pacifico" | "caribe") => void;
  userProfile: UserProfile;
  onOpenProfileModal: (region?: "pacifico" | "caribe") => void;
  pacificoStats: { likes: number; comments: number };
  caribeStats: { likes: number; comments: number };
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  onSelectRegion,
  userProfile,
  onOpenProfileModal,
  pacificoStats,
  caribeStats
}) => {
  const isIdentified = Boolean(userProfile.name && userProfile.organization);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-fade-in text-center">
      {/* Top Brand Banner */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
        <span className="w-2 h-2 rounded-full bg-[var(--idtf-naranja)] animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--idtf-morado)]">
          Ventana de Conectividad Significativa • OIT / IDTF Facility
        </span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight leading-tight max-w-3xl mx-auto mb-4">
        Soluciones de Empleabilidad Juvenil TIC
      </h1>

      <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
        Selecciona el nodo territorial para explorar sus <strong className="text-white font-semibold">soluciones priorizadas</strong>, voltear cada tarjeta interactiva, votar con tu like y aportar tus comentarios en la base de datos.
      </p>

      {/* User Badge / Registration Quick Bar */}
      <div className="max-w-xl mx-auto mb-12 p-3.5 sm:p-4 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--idtf-morado)]/20 border border-[var(--idtf-morado)]/30 flex items-center justify-center text-[var(--idtf-morado)] shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-xs">
            {isIdentified ? (
              <>
                <div className="text-white/50 uppercase tracking-wider font-semibold text-[10px]">
                  Participante Identificado
                </div>
                <div className="font-bold text-white text-sm">
                  {userProfile.name}
                </div>
                <div className="text-white/70 text-[11px]">
                  {userProfile.organization} {userProfile.role ? `• ${userProfile.role}` : ""}
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-white text-sm">
                  ¿Participas como Aliado o Empresa?
                </div>
                <div className="text-white/60 text-[11px]">
                  Registra tus datos para que tus likes y comentarios queden certificados.
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenProfileModal()}
          className="shrink-0 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
        >
          {isIdentified ? "Modificar Datos" : "Identificarme Ahora"}
        </button>
      </div>

      {/* Two Regional Portal Cards: Pacífico vs Caribe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto text-left">
        
        {/* ================= CARD PACÍFICO ================= */}
        <div
          onClick={() => onSelectRegion("pacifico")}
          className="group relative bg-[var(--idtf-navy-light)] rounded-2xl p-7 sm:p-8 border-2 border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Nodo Territorial
              </span>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                  {pacificoStats.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-white/60" />
                  {pacificoStats.comments}
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors mb-2">
              Nodo Pacífico
            </h2>

            <p className="text-xs font-semibold text-white/60 mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Ecosistema territorial del Nodo Pacífico
            </p>

            <p className="text-sm text-white/80 leading-relaxed mb-6">
              Explora las 5 soluciones focalizadas en respuesta post-desastre y resiliencia, articulación institucional, formadores de vanguardia, formación dual con aliados y laboratorios de innovación abierta.
            </p>

            {/* Solutions mini list preview */}
            <div className="space-y-2 mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
                5 Soluciones de Empleabilidad:
              </div>
              <div className="text-xs text-white/70 space-y-1 pl-2 border-l border-amber-500/30">
                <div>1. Piloto de Respuesta y Recuperación Post-Terremoto</div>
                <div>2. La Palanca Institucionalizada (Micro-conexiones)</div>
                <div>3. Pasaporte de Habilidades (Formadores de Vanguardia)</div>
                <div>4. Formación Dual Digital Híbrida (Estándar Operativo)</div>
                <div>5. Laboratorios Juveniles de Innovación Abierta</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-amber-400 font-bold text-sm uppercase tracking-wide group-hover:translate-x-1 transition-transform">
            <span>Ingresar a Soluciones Nodo Pacífico</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* ================= CARD CARIBE ================= */}
        <div
          onClick={() => onSelectRegion("caribe")}
          className="group relative bg-[var(--idtf-navy-light)] rounded-2xl p-7 sm:p-8 border-2 border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Nodo Territorial
              </span>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                  {caribeStats.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-white/60" />
                  {caribeStats.comments}
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors mb-2">
              Nodo Caribe
            </h2>

            <p className="text-xs font-semibold text-white/60 mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Ecosistema territorial del Nodo Caribe
            </p>

            <p className="text-sm text-white/80 leading-relaxed mb-6">
              Explora las 4 soluciones focalizadas en ecosistemas de intermediación activa ("La Palanca"), torneos de código a ciegas bilingües, contención socioemocional y semilleros corporativos inmersivos.
            </p>

            {/* Solutions mini list preview */}
            <div className="space-y-2 mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90">
                4 Soluciones de Empleabilidad:
              </div>
              <div className="text-xs text-white/70 space-y-1 pl-2 border-l border-emerald-500/30">
                <div>1. Ecosistema de Intermediación Activa (La Palanca)</div>
                <div>2. Sandbox Bilingüe y Pago por Resultados</div>
                <div>3. Acompañamiento Integral y Retención (90 días)</div>
                <div>4. Semilleros Corporativos Inmersivos (Pacto)</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-emerald-400 font-bold text-sm uppercase tracking-wide group-hover:translate-x-1 transition-transform">
            <span>Ingresar a Soluciones Nodo Caribe</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Footer reassurance */}
      <div className="mt-12 text-center text-xs text-white/40 max-w-lg mx-auto">
        Plataforma participativa del proyecto de Transformación Digital Inclusiva. Todos los votos y comentarios se almacenan en la base de datos de consulta.
      </div>
    </div>
  );
};
