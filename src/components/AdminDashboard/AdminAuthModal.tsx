import React, { useState } from "react";
import { ShieldCheck, Mail, KeyRound, AlertCircle, Loader2, X, CheckCircle2, Lock } from "lucide-react";
import { verifyWhitelistAuth } from "../../lib/api";
import { AdminAuthUser } from "../../types";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AdminAuthUser) => void;
}

export function AdminAuthModal({ isOpen, onClose, onAuthSuccess }: AdminAuthModalProps) {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico corporativo o institucional.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await verifyWhitelistAuth(email, pin);
    setLoading(false);

    if (result.authorized && result.user) {
      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(result.user);
      }, 700);
    } else {
      setError(result.error || "El correo no está autorizado en la lista blanca de aliados directivos.");
    }
  };

  const handleQuickDemoAccess = () => {
    setEmail("conectividadsignificativa@gmail.com");
    setPin("VCS2026");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[var(--idtf-navy-light)] border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-7 text-white">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[var(--idtf-morado)]/20 border border-[var(--idtf-morado)]/50 flex items-center justify-center text-[var(--idtf-morado)]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--idtf-naranja)]">
              Acceso Restringido · Lista Blanca
            </div>
            <h3 className="text-lg font-bold text-white">
              Dashboard de Reportes
            </h3>
          </div>
        </div>

        <p className="text-xs text-white/70 mb-5 leading-relaxed">
          Consulta en tiempo real el comportamiento de las votaciones, indicadores de ROI territorial y la retroalimentación cualitativa aportada por los aliados.
        </p>

        {/* Error notice */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <div>¡Identidad confirmada en lista blanca! Abriendo dashboard...</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Correo Electrónico Autorizado
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="ej. conectividadsignificativa@gmail.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-black/30 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--idtf-morado)] focus:ring-1 focus:ring-[var(--idtf-morado)]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-white/80">
                PIN o Clave de Acceso Rápido <span className="text-white/40 font-normal">(Opcional)</span>
              </label>
              <button
                type="button"
                onClick={handleQuickDemoAccess}
                className="text-[11px] text-[var(--idtf-naranja)] hover:underline font-medium"
              >
                Autocompletar Administrador
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Código de validación (ej. VCS2026)"
                className="w-full pl-10 pr-3.5 py-2.5 bg-black/30 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--idtf-morado)] focus:ring-1 focus:ring-[var(--idtf-morado)]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--idtf-morado)] to-[#795290] hover:brightness-110 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando Lista Blanca...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ingresar al Dashboard Ejecutivo</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-white/10 text-center text-[11px] text-white/50">
          Protegido por lista blanca institucional de la Ventana de Conectividad Significativa (OIT · UE · IDTF Facility).
        </div>

      </div>
    </div>
  );
}
