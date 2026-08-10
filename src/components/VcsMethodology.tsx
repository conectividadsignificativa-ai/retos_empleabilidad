import React, { FormEvent } from "react";
import { 
  Sparkles, 
  Users, 
  Target, 
  BookOpen, 
  Award, 
  Briefcase, 
  HeartHandshake, 
  AlertCircle, 
  MapPin, 
  ArrowRight, 
  User, 
  Building, 
  Compass, 
  Check, 
  ShieldCheck,
  Globe,
  Layers,
  Puzzle
} from "lucide-react";
import { PuzzleInfographic } from "./PuzzleInfographic";
import { OrganizationProfile } from "../types";

interface VcsMethodologyProps {
  profile: OrganizationProfile;
  setProfile: React.Dispatch<React.SetStateAction<OrganizationProfile>>;
  onProceed: () => void;
  onBackToMap: () => void;
}

export const VcsMethodology: React.FC<VcsMethodologyProps> = ({
  profile,
  setProfile,
  onProceed,
  onBackToMap
}) => {
  const territoryLower = profile.territory.toLowerCase();
  const isPacifico = territoryLower.includes("pacífico") || territoryLower.includes("pacifico");
  const isCaribe = territoryLower.includes("caribe");

  const showCaribe = isCaribe;
  const showPacifico = isPacifico;

  return (
    <div className="space-y-12 max-w-4xl mx-auto animate-fade-in" id="vcs-methodology-step">
      
      {/* Breadcrumb Header */}
      <div className="idtf-breadcrumb justify-center">
        <span className="idtf-breadcrumb__step">02</span>
        <span className="text-[var(--idtf-text-muted)]">/</span>
        <span className="idtf-breadcrumb__section">VENTANA DE CONECTIVIDAD SIGNIFICATIVA</span>
        <span className="text-[var(--idtf-text-muted)]">/</span>
        <span className="idtf-breadcrumb__current">METODOLOGÍA Y DIAGNÓSTICO</span>
      </div>

      {/* Main Header Card with UN / ILO / EU Logos */}
      <div className="idtf-card idtf-card--morado p-8 rounded-[var(--idtf-radius-lg)] space-y-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#181333] via-[#10142b] to-[#0a0e20]">
        
        {/* Institutional Backing Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[var(--idtf-morado)]/20 border border-[var(--idtf-morado)]/40 text-xs font-mono font-bold text-[var(--idtf-morado)] uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[var(--idtf-naranja)]" />
              OIT · UNFPA · UNIÓN EUROPEA
            </span>
            <span className="text-xs text-[var(--idtf-text-secondary)] font-mono">
              Iniciativa Regional Colombia
            </span>
          </div>

          <button
            type="button"
            onClick={onBackToMap}
            className="text-xs font-mono text-[var(--idtf-naranja)] hover:underline flex items-center gap-1"
          >
            ← Cambiar ubicación ({profile.territory.split(' ')[0]})
          </button>
        </div>

        {/* Welcome Headline */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            ¡Bienvenido a los retos de empleabilidad de la <span className="text-[var(--idtf-naranja)]">Ventana de Conectividad Significativa (VCS)</span>!
          </h2>
          <p className="text-sm sm:text-base text-[var(--idtf-text-secondary)] leading-relaxed">
            Esta iniciativa, liderada por la <strong>Organización Internacional del Trabajo (OIT)</strong> y el <strong>Fondo de Población de las Naciones Unidas (UNFPA)</strong> en Colombia, con el respaldo de la <strong>Unión Europea</strong>, busca conectar a las juventudes de las regiones Caribe y Pacífico con las oportunidades de la economía digital, promoviendo el trabajo decente, la igualdad de género y el desarrollo sostenible.
          </p>
        </div>

      </div>

      {/* Nuestro Desafío: El Componente de Empleabilidad Digital */}
      <div className="space-y-6">
        <div className="idtf-section-header">
          <div className="idtf-section-header__number">01</div>
          <div>
            <h3 className="idtf-section-header__title">
              NUESTRO DESAFÍO: <span className="accent">EMPLEABILIDAD DIGITAL</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--idtf-text-secondary)] mt-1">
              Co-diseño de retos de innovación e impulso al Pacto por las Habilidades.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Highlight Goal 1200 Youth */}
          <div className="idtf-card idtf-card--naranja p-6 rounded-[var(--idtf-radius-md)] md:col-span-1 flex flex-col justify-between space-y-4 bg-[var(--idtf-navy-light)]">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--idtf-naranja)]/20 text-[var(--idtf-naranja)] flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[var(--idtf-naranja)] font-mono">
                1,200
              </div>
              <div className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                Jóvenes Impactados
              </div>
            </div>
            <p className="text-xs text-[var(--idtf-text-secondary)] leading-relaxed">
              Meta prioritaria para participar en la implementación de soluciones y acceder a empleos decentes en el sector TIC.
            </p>
          </div>

          {/* Rutas de Empleabilidad TIC Pillars with Puzzle Visualization */}
          <div className="idtf-card idtf-card--verde p-6 sm:p-8 rounded-[var(--idtf-radius-md)] md:col-span-2 space-y-6 bg-[var(--idtf-navy-light)] flex flex-col justify-between border border-white/10 shadow-xl relative overflow-hidden">
            
            {/* Background Puzzle watermark decoration */}
            <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none text-white">
              <svg width="220" height="220" viewBox="0 0 100 100" fill="currentColor">
                <path d="M 10 10 H 40 C 40 20 50 20 50 10 H 90 V 40 C 80 40 80 50 90 50 V 90 H 50 C 50 80 40 80 40 90 H 10 V 50 C 20 50 20 40 10 40 Z" />
              </svg>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="text-xs font-mono uppercase text-[var(--idtf-verde)] font-extrabold tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--idtf-verde)]" />
                RUTAS DE EMPLEABILIDAD TIC DEL TERRITORIO
              </div>
              
              <h4 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Retos para fortalecer las Rutas de Empleabilidad TIC del Territorio
              </h4>

              <p className="text-sm font-extrabold text-[var(--idtf-naranja)] font-mono flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-[var(--idtf-naranja)] shrink-0" />
                Ningún actor tiene todas las piezas; juntos podemos construir la solución
              </p>

              <p className="text-xs sm:text-sm text-[var(--idtf-text-secondary)] leading-relaxed">
                Convocamos a empresas, gremios e instituciones a cocrear respuestas innovadoras que fortalezcan las rutas de empleabilidad y consoliden un ecosistema continuo de apoyo para las juventudes del territorio.
              </p>
            </div>

            {/* Unified 8-Piece Assembled Puzzle Infographic */}
            <PuzzleInfographic />

          </div>

        </div>
      </div>

      {/* El Diagnóstico: Barreras Críticas Caribe & Pacífico */}
      <div className="space-y-6">
        <div className="idtf-section-header">
          <div className="idtf-section-header__number">02</div>
          <div>
            <h3 className="idtf-section-header__title">
              EL DIAGNÓSTICO: <span className="accent">CIFRAS CLAVE Y FRENO AL TALENTO</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--idtf-text-secondary)] mt-1">
              {showCaribe && showPacifico 
                ? "Indicadores estratégicos del ecosistema laboral digital en el Caribe y el Pacífico colombiano."
                : showCaribe 
                  ? "Indicadores estratégicos del ecosistema laboral digital en la Región Caribe."
                  : "Indicadores estratégicos del ecosistema laboral digital en la Región Pacífico."
              }
            </p>
          </div>
        </div>

        {/* Executive KPI Summary Cards (3 Key Metrics with Progress Bars) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--idtf-navy-light)] border border-white/15 p-4 rounded-[var(--idtf-radius-md)] space-y-3 shadow-md">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Desajuste de Habilidades</span>
                <span className="text-[var(--idtf-naranja)] text-[11px]">Alto</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-[var(--idtf-navy)] h-2 rounded-full overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-[var(--idtf-naranja)] to-amber-400 h-full rounded-full w-[75%]" />
              </div>
            </div>
            <p className="text-[11px] text-[var(--idtf-text-secondary)] leading-snug">
              Brecha técnica entre la oferta formativa tradicional y las demandas reales del sector TI.
            </p>
          </div>

          <div className="bg-[var(--idtf-navy-light)] border border-white/15 p-4 rounded-[var(--idtf-radius-md)] space-y-3 shadow-md">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Juventud en Inactividad Laboral</span>
                <span className="text-[var(--idtf-verde)] text-[11px]">Crítico</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-[var(--idtf-navy)] h-2 rounded-full overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-[var(--idtf-verde)] to-emerald-400 h-full rounded-full w-[65%]" />
              </div>
            </div>
            <p className="text-[11px] text-[var(--idtf-text-secondary)] leading-snug">
              Jóvenes con talento sin empleo formal ni formación activa en los nodos territoriales.
            </p>
          </div>

          <div className="bg-[var(--idtf-navy-light)] border border-white/15 p-4 rounded-[var(--idtf-radius-md)] space-y-3 shadow-md">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Fricción por Sesgos & Redes</span>
                <span className="text-sky-400 text-[11px]">Severo</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-[var(--idtf-navy)] h-2 rounded-full overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-sky-400 to-indigo-400 h-full rounded-full w-[85%]" />
              </div>
            </div>
            <p className="text-[11px] text-[var(--idtf-text-secondary)] leading-snug">
              Contratación frenada por falta de certificados específicos y desconexión empresarial.
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${showCaribe && showPacifico ? "md:grid-cols-2" : "md:grid-cols-1"} gap-6`}>
          
          {/* Región Caribe */}
          {showCaribe && (
            <div className="idtf-card idtf-card--verde p-6 rounded-[var(--idtf-radius-md)] space-y-4 bg-[var(--idtf-navy-light)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--idtf-verde)] font-extrabold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--idtf-verde)]" />
                  REGIÓN CARIBE — BARRERAS Y BRECHAS IDENTIFICADAS
                </span>
                <span className="text-[10px] font-mono bg-white/10 text-white/80 px-2 py-0.5 rounded">
                  Barranquilla & Cartagena
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-[var(--idtf-navy)] p-3.5 rounded-[var(--idtf-radius-sm)] border border-white/10 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[var(--idtf-verde)] shrink-0" />
                    Barrera 1: Desconexión estructural entre mercado laboral y juventudes por falta de redes
                  </div>
                  <p className="text-xs text-[var(--idtf-text-secondary)] pl-5">
                    Brecha sistémica entre las capacidades de las juventudes y las oportunidades del mercado en el Caribe, agravada por la ausencia de redes de contacto efectivas ("la palanca") y sesgos de contratación (geográficos, étnicos y de títulos).
                  </p>
                </div>

                <div className="bg-[var(--idtf-navy)] p-3.5 rounded-[var(--idtf-radius-sm)] border border-white/10 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[var(--idtf-verde)] shrink-0" />
                    Barrera 2: Déficit socioemocional y digital, desinformación y autoexclusión
                  </div>
                  <p className="text-xs text-[var(--idtf-text-secondary)] pl-5">
                    Necesidad de fortalecer resiliencia, adaptabilidad y pensamiento lógico-matemático en entornos digitales que amplifican sesgos y generan autoexclusión (renuncia anticipada a optar por oportunidades por temor o baja autoconfianza).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Región Pacífico */}
          {showPacifico && (
            <div className="idtf-card idtf-card--naranja p-6 rounded-[var(--idtf-radius-md)] space-y-4 bg-[var(--idtf-navy-light)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--idtf-naranja)] font-extrabold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--idtf-naranja)]" />
                  REGIÓN PACÍFICO — BARRERAS Y BRECHAS IDENTIFICADAS
                </span>
                <span className="text-[10px] font-mono bg-white/10 text-white/80 px-2 py-0.5 rounded">
                  Cali, Pasto & Buenaventura
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-[var(--idtf-navy)] p-3.5 rounded-[var(--idtf-radius-sm)] border border-white/10 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[var(--idtf-naranja)] shrink-0" />
                    Barrera 1: Desarticulación del ecosistema y debilidad en redes de conexión entre actores
                  </div>
                  <p className="text-xs text-[var(--idtf-text-secondary)] pl-5">
                    Fragmentación institucional (academia, empresa, Estado) y falta de agendas territoriales compartidas. La escasez de "palancas" relacionales impide que las juventudes del Pacífico accedan a rutas claras de empleabilidad y emprendimiento.
                  </p>
                </div>

                <div className="bg-[var(--idtf-navy)] p-3.5 rounded-[var(--idtf-radius-sm)] border border-white/10 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[var(--idtf-naranja)] shrink-0" />
                    Barrera 2: Brecha en formación pertinente, habilidades socioemocionales y acompañamiento integral
                  </div>
                  <p className="text-xs text-[var(--idtf-text-secondary)] pl-5">
                    Necesidad de actualizar modelos formativos (tecnología aplicada, IA generativa), fortalecer habilidades blandas/digitales y brindar acompañamiento psicosocial para superar el síndrome del impostor y la desmotivación en jóvenes en transición hacia el empleo.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CTA Button to Proceed to Page 3 (Colaboración y Registro) */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
        <button
          type="button"
          onClick={onBackToMap}
          className="w-full sm:w-auto px-5 py-3 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-xs font-mono transition-all flex items-center justify-center gap-2"
        >
          ← Volver al Mapa 3D
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-[var(--idtf-naranja)] to-amber-500 text-slate-950 text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Continuar a Registro de Aliado y Opciones de Colaboración
          <ArrowRight className="w-5 h-5 text-slate-950" />
        </button>
      </div>

    </div>
  );
};
