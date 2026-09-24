import React, { useState, useEffect } from "react";
import { X, ShieldCheck, UserPlus, Trash2, Mail, Building2, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { WhitelistEntry } from "../../types";
import { fetchWhitelistApi, addWhitelistApi, removeWhitelistApi } from "../../lib/api";

interface WhitelistManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhitelistManagerModal({ isOpen, onClose }: WhitelistManagerModalProps) {
  const [list, setList] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newRole, setNewRole] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchWhitelistApi().then((items) => {
        setList(items);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setLoading(true);
    setStatusMsg(null);

    const updated = await addWhitelistApi({
      email: newEmail.trim(),
      name: newName.trim() || "Aliado Evaluador",
      organization: newOrg.trim() || "Organización Aliada",
      role: newRole.trim() || "Evaluador"
    });

    setList(updated);
    setLoading(false);
    setNewEmail("");
    setNewName("");
    setNewOrg("");
    setNewRole("");
    setStatusMsg({ type: "success", text: "¡Correo agregado exitosamente a la lista blanca!" });
  };

  const handleDelete = async (email: string) => {
    if (email === "conectividadsignificativa@gmail.com") {
      setStatusMsg({ type: "error", text: "No se puede eliminar la cuenta de administración principal." });
      return;
    }

    setLoading(true);
    const updated = await removeWhitelistApi(email);
    setList(updated);
    setLoading(false);
    setStatusMsg({ type: "success", text: `Correo ${email} removido de la lista blanca.` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--idtf-navy-light)] border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--idtf-morado)]/20 border border-[var(--idtf-morado)]/40 flex items-center justify-center text-[var(--idtf-morado)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Gestión de Lista Blanca (Whitelist)
              </h3>
              <p className="text-xs text-white/60">
                Usuarios y correos autorizados para acceder a este dashboard de reportes en tiempo real.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to add new stakeholder */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/5">
          <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-[var(--idtf-naranja)]" />
            <span>Autorizar Nuevo Aliado / Evaluador</span>
          </div>

          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="socio@institucion.org"
                className="w-full px-3 py-2 bg-black/30 border border-white/15 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--idtf-morado)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1">
                Nombre del Aliado
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-3 py-2 bg-black/30 border border-white/15 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--idtf-morado)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1">
                Organización / Entidad
              </label>
              <input
                type="text"
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                placeholder="ej. Cámara de Comercio / Gremio"
                className="w-full px-3 py-2 bg-black/30 border border-white/15 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--idtf-morado)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1">
                Rol o Función
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="ej. Evaluador Senior"
                  className="w-full px-3 py-2 bg-black/30 border border-white/15 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--idtf-morado)]"
                />
                <button
                  type="submit"
                  disabled={loading || !newEmail.trim()}
                  className="shrink-0 px-4 py-2 rounded-lg bg-[var(--idtf-morado)] hover:brightness-110 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>
          </form>

          {statusMsg && (
            <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${statusMsg.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-red-500/20 text-red-200 border border-red-500/40"}`}>
              {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Existing Whitelist List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
            Aliados con Acceso Autorizado ({list.length})
          </div>

          {loading && list.length === 0 ? (
            <div className="text-center py-6 text-white/40 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando lista blanca...</span>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {list.map((item) => {
                const isRoot = item.email.toLowerCase() === "conectividadsignificativa@gmail.com";
                return (
                  <div key={item.email} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span>{item.email}</span>
                        {isRoot && (
                          <span className="text-[10px] font-semibold text-[var(--idtf-naranja)] bg-[var(--idtf-naranja)]/10 px-2 py-0.5 rounded border border-[var(--idtf-naranja)]/30">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/60 flex items-center gap-2 mt-0.5">
                        <span>{item.name || "Aliado"}</span>
                        <span>·</span>
                        <span>{item.organization || "General"}</span>
                        <span>·</span>
                        <span className="text-white/40">{item.role || "Evaluador"}</span>
                      </div>
                    </div>

                    {!isRoot && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.email)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remover de la lista blanca"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-black/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
          >
            Cerrar Gestión
          </button>
        </div>

      </div>
    </div>
  );
}
