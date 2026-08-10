import React, { useState } from "react";
import { 
  Sparkles, 
  Globe, 
  ShieldCheck, 
  Building, 
  User, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Send, 
  Coins, 
  FileText,
  Layers,
  HeartHandshake
} from "lucide-react";
import { OrganizationProfile, TriangulatedChallengeData } from "../types";

interface PactoSignificativoProps {
  profile: OrganizationProfile;
  coins: Record<string, number>;
  challenges: TriangulatedChallengeData[];
  onBackToChallenges: () => void;
  onSubmittedSuccess?: () => void;
  onSubmitResponse: () => Promise<void>;
}

export const PactoSignificativo: React.FC<PactoSignificativoProps> = ({
  profile,
  coins,
  challenges,
  onBackToChallenges,
  onSubmitResponse
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute total coins spent and challenges supported
  const totalCoinsSpent = Object.values(coins).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
  const supportedChallenges = challenges.filter(c => (coins[c.id] || 0) > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmitResponse();
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error signing pact:", err);
      setErrorMsg("Ocurrió un inconveniente guardando el registro. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto animate-fade-in" id="pacto-significativo-step">
      
      {/* Breadcrumb Header */}
      <div className="idtf-breadcrumb justify-center">
        <span className="idtf-breadcrumb__step">05</span>
        <span className="text-[var(--idtf-text-muted)]">/</span>
        <span className="idtf-breadcrumb__section">PACTO REGIONAL</span>
        <span className="text-[var(--idtf-text-muted)]">/</span>
        <span className="idtf-breadcrumb__current">FIRMA DEL PACTO Y ENVÍO DE RESPUESTAS</span>
      </div>

      {/* Main Hero Manifesto Card */}
      <div className="idtf-card idtf-card--morado p-8 sm:p-10 rounded-[var(--idtf-radius-lg)] space-y-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#1b1539] via-[#10142b] to-[#0d1226] border border-[var(--idtf-morado)]/40">
        
        {/* Top Institutional Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <span className="px-3 py-1 rounded-full bg-[var(--idtf-morado)]/30 border border-[var(--idtf-morado)]/60 text-xs font-mono font-bold text-[var(--idtf-morado)] uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[var(--idtf-naranja)]" />
            OIT · UNFPA · UNIÓN EUROPEA
          </span>

          <span className="text-xs text-[var(--idtf-verde)] font-mono font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[var(--idtf-verde)]" />
            Pacto por la Conectividad Significativa
          </span>
        </div>

        {/* Title & Manifesto */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            Invitación al <span className="text-[var(--idtf-naranja)]">Pacto por la Conectividad Significativa</span> y la Empleabilidad Digital Juvenil
          </h2>

          <p className="text-sm sm:text-base text-[var(--idtf-text-secondary)] leading-relaxed">
            Al firmar esta manifestación de interés, <strong>{profile.companyName || "Tu Organización"}</strong> se suma como un aliado estratégico fundamental dentro de la estrategia impulsada por la <strong>Organización Internacional del Trabajo (OIT)</strong>, el <strong>Fondo de Población de las Naciones Unidas (UNFPA)</strong> y la <strong>Unión Europea</strong> en Colombia.
          </p>
        </div>

        {/* Manifesto Commitments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-[var(--idtf-navy)]/80 p-4 rounded-[var(--idtf-radius-md)] border border-white/10 space-y-2">
            <div className="text-xs font-mono text-[var(--idtf-verde)] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--idtf-verde)]" />
              Trabajo Decente
            </div>
            <p className="text-xs text-[var(--idtf-text-secondary)]">
              Fomentar condiciones justas, incluyentes e igualitarias para el acceso juvenil al empleo digital.
            </p>
          </div>

          <div className="bg-[var(--idtf-navy)]/80 p-4 rounded-[var(--idtf-radius-md)] border border-white/10 space-y-2">
            <div className="text-xs font-mono text-[var(--idtf-naranja)] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--idtf-naranja)]" />
              Cierre de Brechas
            </div>
            <p className="text-xs text-[var(--idtf-text-secondary)]">
              Transformar barreras de formación y experiencia en rutas efectivas de inserción laboral TIC.
            </p>
          </div>

          <div className="bg-[var(--idtf-navy)]/80 p-4 rounded-[var(--idtf-radius-md)] border border-white/10 space-y-2">
            <div className="text-xs font-mono text-[var(--idtf-morado)] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--idtf-morado)]" />
              Sinergia Regional
            </div>
            <p className="text-xs text-[var(--idtf-text-secondary)]">
              Impulsar la dinamización económica y la innovación en las regiones Caribe y Pacífico.
            </p>
          </div>
        </div>

      </div>

      {/* Summary of Response Data to be Saved */}
      <div className="space-y-6">
        <div className="idtf-section-header">
          <div className="idtf-section-header__number">02</div>
          <div>
            <h3 className="idtf-section-header__title">
              RESUMEN DE TU <span className="accent">POSTULACIÓN Y ASIGNACIÓN</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--idtf-text-secondary)] mt-1">
              Revisa los detalles antes de enviar tus respuestas a la base de datos oficial del programa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Ally Profile Box */}
          <div className="idtf-card idtf-card--naranja p-6 rounded-[var(--idtf-radius-md)] space-y-4 bg-[var(--idtf-navy-light)] md:col-span-1">
            <div className="text-xs font-mono uppercase text-[var(--idtf-naranja)] font-bold flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="w-4 h-4" />
              Datos del Aliado
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[var(--idtf-text-secondary)] font-mono block">Nombre:</span>
                <span className="text-white font-bold text-sm">{profile.contactName || "No especificado"}</span>
              </div>

              <div>
                <span className="text-[var(--idtf-text-secondary)] font-mono block">Organización:</span>
                <span className="text-white font-bold text-sm">{profile.companyName || "No especificada"}</span>
              </div>

              {profile.contactRole && (
                <div>
                  <span className="text-[var(--idtf-text-secondary)] font-mono block">Cargo / Rol:</span>
                  <span className="text-white font-semibold">{profile.contactRole}</span>
                </div>
              )}

              {profile.contactEmail && (
                <div>
                  <span className="text-[var(--idtf-text-secondary)] font-mono block">Correo:</span>
                  <span className="text-white font-semibold">{profile.contactEmail}</span>
                </div>
              )}

              <div>
                <span className="text-[var(--idtf-text-secondary)] font-mono block">Territorio Enfoque:</span>
                <span className="text-[var(--idtf-naranja)] font-bold">{profile.territory}</span>
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Box */}
          <div className="idtf-card idtf-card--verde p-6 rounded-[var(--idtf-radius-md)] space-y-4 bg-[var(--idtf-navy-light)] md:col-span-2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono uppercase text-[var(--idtf-verde)] font-bold flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[var(--idtf-naranja)]" />
                  Presupuesto IDTF Asignado
                </span>
                <span className="text-xs font-mono font-black text-white bg-[var(--idtf-naranja)]/20 px-3 py-1 rounded-full border border-[var(--idtf-naranja)]/40">
                  {totalCoinsSpent} / 10 Monedas
                </span>
              </div>

              {supportedChallenges.length === 0 ? (
                <p className="text-xs text-[var(--idtf-text-secondary)] py-4">
                  Aún no has asignado monedas IDTF a ningún reto estratégico. Puedes volver al paso anterior para asignar tu presupuesto.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {supportedChallenges.map((ch) => {
                    const allocated = coins[ch.id] || 0;
                    return (
                      <div key={ch.id} className="bg-[var(--idtf-navy)] p-3 rounded-[var(--idtf-radius-sm)] border border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-6 h-6 rounded-full bg-[var(--idtf-morado)]/30 text-[var(--idtf-morado)] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {ch.id.replace("Reto ", "")}
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {ch.title}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-[var(--idtf-naranja)] shrink-0 bg-white/5 px-2.5 py-1 rounded">
                          {allocated} Moneda{allocated > 1 ? 's' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onBackToChallenges}
              className="text-xs text-[var(--idtf-naranja)] font-mono font-bold hover:underline pt-2 text-left"
            >
              ← Modificar asignación de Monedas IDTF
            </button>
          </div>

        </div>
      </div>

      {/* Confirmation State or Form Submit Action */}
      {isSubmitted ? (
        <div className="idtf-card idtf-card--verde p-8 sm:p-10 rounded-[var(--idtf-radius-lg)] text-center space-y-6 bg-gradient-to-br from-[#0e291e] via-[#10142b] to-[#0a0e20] border-2 border-[var(--idtf-verde)] shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[var(--idtf-verde)]/20 text-[var(--idtf-verde)] flex items-center justify-center mx-auto border-2 border-[var(--idtf-verde)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-white">
              ¡Respuestas Enviadas y Pacto Firmado Con Éxito!
            </h3>
            <p className="text-sm text-[var(--idtf-text-secondary)] leading-relaxed">
              Gracias, <strong>{profile.contactName || "Aliado"}</strong>. Los datos de <strong>{profile.companyName || "tu organización"}</strong> han sido registrados satisfactoriamente en la base de datos de la <strong>Ventana de Conectividad Significativa (VCS)</strong>.
            </p>
          </div>

          <div className="p-4 bg-[var(--idtf-navy)] rounded-[var(--idtf-radius-md)] border border-white/10 max-w-md mx-auto text-xs font-mono text-[var(--idtf-verde)]">
            ID de Registro Guardado · Conexión OIT / UNFPA / UE Activa
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-[var(--idtf-radius-md)] text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBackToChallenges}
              className="w-full sm:w-auto px-5 py-3.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-xs font-mono transition-all"
            >
              ← Volver a Retos
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto py-4 px-10 rounded-xl bg-gradient-to-r from-[var(--idtf-naranja)] via-amber-500 to-[var(--idtf-verde)] text-slate-950 text-base font-black uppercase tracking-wide flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Guardando respuestas en Firebase...</span>
              ) : (
                <>
                  <Send className="w-5 h-5 text-slate-950" />
                  Enviar Respuestas y Firmar Pacto Digital
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
