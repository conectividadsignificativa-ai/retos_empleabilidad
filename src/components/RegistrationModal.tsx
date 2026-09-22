import React, { useState } from "react";
import { User, Mail, Building, Briefcase, X, CheckCircle, ShieldCheck } from "lucide-react";
import { UserProfile } from "../types";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile: UserProfile;
  regionContext?: "pacifico" | "caribe" | null;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  regionContext
}) => {
  const [name, setName] = useState(initialProfile.name || "");
  const [email, setEmail] = useState(initialProfile.email || "");
  const [organization, setOrganization] = useState(initialProfile.organization || "");
  const [role, setRole] = useState(initialProfile.role || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }
    if (!organization.trim()) {
      setError("Por favor ingresa el nombre de tu organización, empresa o entidad.");
      return;
    }

    setError("");
    onSave({
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim(),
      role: role.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[var(--idtf-navy)] border border-white/20 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--idtf-naranja)]/20 border border-[var(--idtf-naranja)]/40 flex items-center justify-center text-[var(--idtf-naranja)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--idtf-morado)]">
              Registro de Participación
            </span>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">
              Identificación de Aliado
            </h3>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-6 leading-relaxed">
          {regionContext ? (
            <>
              Tus datos permitirán atribuir y certificar tus <span className="text-white font-medium">likes (votos)</span> y <span className="text-white font-medium">comentarios</span> sobre las soluciones del <strong className="text-[var(--idtf-naranja)] uppercase">Nodo {regionContext}</strong> en la base de datos de la Ventana de Conectividad Significativa.
            </>
          ) : (
            <>
              Ingresa tus datos para registrar tus interacciones, votos y comentarios en la base de datos del proyecto.
            </>
          )}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[var(--idtf-naranja)]" />
              Nombre Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. María Camila Suárez"
              className="w-full bg-[var(--idtf-navy-light)] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--idtf-naranja)] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--idtf-morado)]" />
              Correo Electrónico *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. camila@empresa.com"
              className="w-full bg-[var(--idtf-navy-light)] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--idtf-morado)] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[var(--idtf-verde)]" />
              Organización / Empresa / Institución *
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Ej. Cámara de Comercio / Empresa TIC / Universidad"
              className="w-full bg-[var(--idtf-navy-light)] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--idtf-verde)] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-white/50" />
              Cargo o Rol (Opcional)
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej. Director de Talento / Líder de Innovación / Mentor"
              className="w-full bg-[var(--idtf-navy-light)] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-[var(--idtf-naranja)] hover:bg-[var(--idtf-naranja-dark)] text-[var(--idtf-navy)] font-bold text-sm uppercase tracking-wide py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              Guardar e Ingresar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sm:w-auto px-4 py-3 text-xs font-semibold uppercase text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors text-center"
            >
              Explorar como invitado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
