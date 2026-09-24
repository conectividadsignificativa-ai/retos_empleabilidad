import React, { useState } from "react";
import { ShieldCheck, Mail, AlertCircle, Loader2, X, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { verifyWhitelistAuth } from "../../lib/api";
import { AdminAuthUser } from "../../types";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AdminAuthUser) => void;
}

export function AdminAuthModal({ isOpen, onClose, onAuthSuccess }: AdminAuthModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAuthenticateWithEmail = async (targetEmail: string) => {
    if (!targetEmail.trim()) {
      setError("Por favor ingresa tu cuenta de Gmail o correo institucional.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await verifyWhitelistAuth(targetEmail);
    setLoading(false);

    if (result.authorized && result.user) {
      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(result.user);
      }, 500);
    } else {
      setError(result.error || `La cuenta ${targetEmail} no está registrada en la lista blanca de aliados.`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthenticateWithEmail(email);
  };

  const handleGmailOneClick = () => {
    handleAuthenticateWithEmail("conectividadsignificativa@gmail.com");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[var(--idtf-navy-light)] border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-7 text-white">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[var(--idtf-morado)]/20 border border-[var(--idtf-morado)]/50 flex items-center justify-center text-[var(--idtf-morado)]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--idtf-naranja)]">
              Acceso Directivo · Lista Blanca
            </div>
            <h3 className="text-lg font-bold text-white">
              Dashboard de Reportes
            </h3>
          </div>
        </div>

        <p className="text-xs text-white/70 mb-5 leading-relaxed">
          Consulta en tiempo real el comportamiento de las votaciones, indicadores territoriales y retroalimentación de las propuestas. Cuenta autorizada en lista blanca: <strong className="text-[var(--idtf-naranja)]">conectividadsignificativa@gmail.com</strong>.
        </p>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <div>¡Cuenta conectividadsignificativa@gmail.com verificada! Abriendo dashboard...</div>
          </div>
        )}

        <div className="space-y-4">
          {/* Main Option: Sign In with Google / Gmail */}
          <div>
            <button
              type="button"
              onClick={handleGmailOneClick}
              disabled={loading || success}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-3 transition-all border border-slate-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {/* Google G Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="truncate">Ingresar con conectividadsignificativa@gmail.com</span>
            </button>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/15"></div>
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
              o verificar otra cuenta
            </span>
            <div className="flex-1 h-px bg-white/15"></div>
          </div>

          {/* Form for manual input */}
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Ingresar correo para validación
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-black/30 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--idtf-morado)] focus:ring-1 focus:ring-[var(--idtf-morado)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success || !email.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--idtf-morado)] to-[#795290] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando Whitelist...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validar Cuenta de Whitelist</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 text-center text-[11px] text-white/50">
          Protegido por lista blanca institucional de la Ventana de Conectividad Significativa (OIT · Unión Europea · IDTF Facility).
        </div>

      </div>
    </div>
  );
}
