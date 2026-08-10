import React from "react";
import { 
  ArrowLeft, 
  Coins, 
  Flame, 
  Zap, 
  Handshake, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { 
  TriangulatedChallengeData, 
  ChallengeSynergiesRecord 
} from "../types";

const LAST_MILE_SERVICES = [
  "Formación y capacitación",
  "Certificación y validación de habilidades",
  "Intermediación laboral y conexión con vacantes",
  "Mentoría y acompañamiento",
  "Emprendimiento e innovación",
  "Bilingüismo",
  "Investigación, analítica y generación de conocimiento",
  "Infraestructura, plataformas y tecnología",
  "Networking y articulación empresarial",
  "Otro"
];

interface ChallengeDetailProps {
  challenge: TriangulatedChallengeData;
  coins: Record<string, number>;
  remainingCoins: number;
  handleCoinChange: (challengeId: string, delta: number) => void;
  synergies: Record<string, ChallengeSynergiesRecord>;
  handleToggleService: (challengeId: string, serviceName: string) => void;
  handleOtherServiceTextChange: (challengeId: string, text: string) => void;
  handleCapacityDetailChange: (challengeId: string, text: string) => void;
  onBackToList: () => void;
  onProceedToPacto: () => void;
}

export const ChallengeDetail: React.FC<ChallengeDetailProps> = ({
  challenge,
  coins,
  remainingCoins,
  handleCoinChange,
  synergies,
  handleToggleService,
  handleOtherServiceTextChange,
  handleCapacityDetailChange,
  onBackToList,
  onProceedToPacto,
}) => {
  const currentCoins = coins[challenge.id] || 0;
  const challengeSynergies = synergies[challenge.id] || {
    selectedServices: [],
    otherServiceText: "",
    capacityDetail: ""
  };

  const selectedServices = challengeSynergies.selectedServices || [];
  const otherServiceText = challengeSynergies.otherServiceText || "";
  const capacityDetail = challengeSynergies.capacityDetail || "";

  return (
    <div className="space-y-8 animate-fade-in" id={`challenge-detail-${challenge.id}`}>
      
      {/* Breadcrumb Header */}
      <div className="idtf-breadcrumb">
        <span className="idtf-breadcrumb__step">04</span>
        <span className="text-[var(--idtf-text-muted)]">/</span>
        <span className="idtf-breadcrumb__section">{challenge.region}</span>
        <span className="text-[var(--idtf-text-muted)]">/</span>
        <span className="idtf-breadcrumb__current">RETO {challenge.challengeNumber}: {challenge.title}</span>
      </div>

      {/* Back Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToList}
          className="idtf-btn idtf-btn--secondary text-xs py-2.5 px-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Lista de Retos
        </button>

        <div className="text-xs font-mono text-[var(--idtf-naranja)] font-bold bg-[var(--idtf-navy-light)] px-3.5 py-1.5 rounded-full border border-[var(--idtf-naranja)]/30">
          Presupuesto Libre: {remainingCoins} / 10 Monedas
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="idtf-card idtf-card--naranja space-y-8 p-6 sm:p-10 bg-[var(--idtf-navy-light)] rounded-[var(--idtf-radius-lg)] border border-white/10 shadow-2xl">
        
        {/* Hero Image & Header */}
        <div className="relative aspect-16/9 sm:aspect-21/9 rounded-[var(--idtf-radius-md)] overflow-hidden bg-[var(--idtf-navy)] border border-white/10">
          <img 
            src={challenge.image} 
            alt={challenge.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--idtf-navy)] via-transparent to-transparent opacity-90" />

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <span className="idtf-chip idtf-chip--naranja shadow-md">
              Reto {challenge.challengeNumber} • Región {challenge.region}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {challenge.title}
            </h2>
          </div>
        </div>

        {/* How Might We (HMW) Question */}
        <div className="bg-[var(--idtf-navy)] p-6 rounded-[var(--idtf-radius-md)] border-l-4 border-[var(--idtf-naranja)] space-y-2 shadow-inner">
          <p className="text-xs font-mono uppercase text-[var(--idtf-naranja)] font-bold tracking-wider">
            Pregunta Central de Innovación (HMW):
          </p>
          <p className="text-base sm:text-lg text-white italic font-medium leading-relaxed">
            "{challenge.hmw}"
          </p>
        </div>

        {/* Pain & Advantage Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          
          {/* Pain Description */}
          <div className="bg-[var(--idtf-navy)]/80 border border-white/10 p-5 rounded-[var(--idtf-radius-md)] space-y-3">
            <div className="flex items-center gap-2 text-[var(--idtf-naranja)] font-mono text-xs uppercase font-bold">
              <Flame className="w-4 h-4 text-[var(--idtf-naranja)]" />
              Dolor Territorial Mapeado
            </div>
            <div className="text-xs font-mono text-[var(--idtf-morado)] font-bold">
              {challenge.painCategory}
            </div>
            <p className="text-xs text-[var(--idtf-text-secondary)] leading-relaxed">
              {challenge.painDescription}
            </p>
          </div>

          {/* Advantages */}
          <div className="bg-[var(--idtf-navy)]/80 border border-white/10 p-5 rounded-[var(--idtf-radius-md)] space-y-3">
            <div className="flex items-center gap-2 text-[var(--idtf-verde)] font-mono text-xs uppercase font-bold">
              <Zap className="w-4 h-4 text-[var(--idtf-verde)]" />
              Impacto y Ventajas Clave
            </div>
            <ul className="space-y-2 text-xs text-white/90">
              {challenge.advantages.map((adv, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[var(--idtf-verde)] font-bold shrink-0">✓</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* TARJETA 1: INVESTMENT INTERACTIVE BOX */}
        <div className="bg-[var(--idtf-navy)] border-2 border-[var(--idtf-naranja)]/40 p-6 sm:p-8 rounded-[var(--idtf-radius-md)] space-y-6 shadow-xl">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Coins className="w-6 h-6 text-[var(--idtf-naranja)]" />
                Asignación de Monedas IDTF para este Reto
              </h3>
              <p className="text-xs text-[var(--idtf-text-secondary)] mt-0.5">
                Utiliza tu presupuesto simbólico para respaldar y dar prioridad a esta solución.
              </p>
            </div>

            <div className="font-mono text-right">
              <div className="text-xs text-[var(--idtf-text-muted)]">Presupuesto Libre:</div>
              <div className="text-xl font-extrabold text-[var(--idtf-naranja)]">
                {remainingCoins} Monedas
              </div>
            </div>
          </div>

          {/* Coin Controller Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[var(--idtf-navy-light)] p-6 rounded-[var(--idtf-radius-md)] border border-white/10">
            <div className="text-center sm:text-left">
              <span className="text-xs font-mono uppercase text-[var(--idtf-text-secondary)] block font-bold">
                Monedas Invertidas en este Reto:
              </span>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <span className="text-4xl font-extrabold text-white font-mono">
                  {currentCoins}
                </span>
                <span className="text-xs font-mono text-[var(--idtf-naranja)] font-bold">
                  Moneda{currentCoins !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleCoinChange(challenge.id, -1)}
                disabled={currentCoins <= 0}
                className="w-12 h-12 rounded-full bg-[var(--idtf-navy)] text-white font-extrabold text-2xl hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed border border-white/20 flex items-center justify-center transition-all shadow-sm"
              >
                -
              </button>

              <button
                type="button"
                onClick={() => handleCoinChange(challenge.id, 1)}
                disabled={remainingCoins <= 0}
                className="w-12 h-12 rounded-full bg-[var(--idtf-naranja)] text-[var(--idtf-navy)] font-extrabold text-2xl hover:bg-[var(--idtf-naranja-dark)] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* TARJETA 2 INDEPENDIENTE: APORTES Y CAPACIDADES DE COLABORACIÓN INSTITUCIONAL */}
        <div className="idtf-card idtf-card--verde p-6 sm:p-8 rounded-[var(--idtf-radius-md)] space-y-6 shadow-xl bg-[var(--idtf-navy-light)] border border-[var(--idtf-verde)]/40">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Handshake className="w-6 h-6 text-[var(--idtf-verde)] shrink-0" />
                <h3 className="text-xl font-extrabold text-white tracking-tight uppercase">
                  Aportes y Capacidades de Colaboración Institucional
                </h3>
              </div>
              <p className="text-xs text-[var(--idtf-text-secondary)]">
                Información clave del proceso de cocreación para consolidar el ecosistema de empleabilidad.
              </p>
            </div>

            <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-[var(--idtf-verde)]/20 text-[var(--idtf-verde)] border border-[var(--idtf-verde)]/40 px-3 py-1 rounded-full shrink-0">
              Información Clave
            </span>
          </div>

          {/* Question & Checkboxes Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-extrabold text-white block">
                ¿Qué tipo de servicio de última milla ofrece su organización? <span className="text-[var(--idtf-naranja)] font-mono text-xs font-normal">(Selección múltiple)</span>
              </label>
              <p className="text-xs text-[var(--idtf-text-secondary)]">
                Marque las opciones en las que su entidad tiene oferta, experiencia o recursos para sumar a este reto:
              </p>
            </div>

            {/* Checkboxes Grid - 3 Columns on LG screens for compact UI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {LAST_MILE_SERVICES.map((service) => {
                const isChecked = selectedServices.includes(service);
                return (
                  <label
                    key={service}
                    className={`flex items-start gap-2.5 p-3 rounded-[var(--idtf-radius-sm)] border cursor-pointer transition-all ${
                      isChecked
                        ? "bg-[var(--idtf-navy)] border-[var(--idtf-verde)] text-white shadow-md ring-1 ring-[var(--idtf-verde)]/40"
                        : "bg-[var(--idtf-navy)]/70 border-white/15 text-white/90 hover:bg-[var(--idtf-navy)] hover:border-white/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleService(challenge.id, service)}
                      className="mt-0.5 w-4 h-4 rounded border-white/40 text-[var(--idtf-verde)] focus:ring-[var(--idtf-verde)] accent-[var(--idtf-verde)] shrink-0 cursor-pointer"
                    />
                    <span className="text-xs font-medium leading-snug select-none text-white">
                      {service}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Campo de texto para "Otro" */}
            {selectedServices.includes("Otro") && (
              <div className="p-4 rounded-[var(--idtf-radius-sm)] bg-[var(--idtf-navy)] border border-[var(--idtf-naranja)]/40 space-y-2 animate-fade-in">
                <label className="text-xs font-bold text-[var(--idtf-naranja)] block font-mono">
                  ¿Otro? Indique cuál servicio ofrece su organización:
                </label>
                <input
                  type="text"
                  value={otherServiceText}
                  onChange={(e) => handleOtherServiceTextChange(challenge.id, e.target.value)}
                  placeholder="Escriba aquí el tipo de servicio adicional..."
                  className="w-full px-4 py-2.5 bg-[var(--idtf-navy-light)] border border-white/25 rounded-[var(--idtf-radius-sm)] text-white placeholder:text-white/50 text-xs focus:border-[var(--idtf-naranja)] outline-none font-medium"
                />
              </div>
            )}

            {/* Campo de detalle amplio de oferta y capacidad con Chips/Pills de Autocompletado */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-extrabold text-white block uppercase tracking-wide">
                  Detalle la oferta, recursos y capacidades específicas:
                </label>
                <span className="text-[11px] font-mono text-[var(--idtf-text-secondary)]">
                  Haz clic en las sugerencias para autocompletar:
                </span>
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  "+ 5 Mentores Senior Tech",
                  "+ 20 Becas de formación",
                  "+ 10 Vacantes junior a ciegas",
                  "+ Laboratorio / Espacio físico",
                  "+ Infraestructura / Conectividad",
                  "+ Becas de Bilingüismo"
                ].map((pillText) => (
                  <button
                    key={pillText}
                    type="button"
                    onClick={() => {
                      const cleanText = pillText.replace(/^\+\s*/, "");
                      const newDetail = capacityDetail 
                        ? `${capacityDetail}, ${cleanText}`
                        : cleanText;
                      handleCapacityDetailChange(challenge.id, newDetail);
                    }}
                    className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-white/10 hover:bg-[var(--idtf-verde)]/20 hover:border-[var(--idtf-verde)] text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer"
                  >
                    {pillText}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={capacityDetail}
                onChange={(e) => handleCapacityDetailChange(challenge.id, e.target.value)}
                placeholder="Ej. Disponibilidad de 5 mentores en desarrollo de software, 20 becas de capacitación, laboratorios habilitados en Cali/Barranquilla, vacantes para selección a ciegas..."
                className="w-full px-4 py-3 bg-[var(--idtf-navy)] border border-white/25 rounded-[var(--idtf-radius-sm)] text-white placeholder:text-white/50 text-xs focus:border-[var(--idtf-verde)] focus:ring-1 focus:ring-[var(--idtf-verde)] outline-none resize-y min-h-[90px] font-medium"
              />
            </div>

          </div>

        </div>

        {/* Bottom Nav CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onBackToList}
            className="w-full sm:w-auto px-5 py-3 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-xs font-mono transition-all"
          >
            ← Volver a la Lista de Retos
          </button>

          {remainingCoins === 0 ? (
            <button
              type="button"
              onClick={onProceedToPacto}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-[var(--idtf-naranja)] to-amber-500 text-slate-950 text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Continuar al Pacto por la Conectividad
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
          ) : (
            <div className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--idtf-navy)] border border-[var(--idtf-naranja)]/40 text-xs font-mono text-[var(--idtf-naranja)] flex items-center gap-2 justify-center">
              <Coins className="w-4 h-4 shrink-0" />
              <span>Invierta las <strong>{remainingCoins}</strong> monedas restantes para habilitar el Pacto</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

