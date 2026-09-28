import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Trophy, 
  Building2, 
  Search, 
  ArrowUpDown, 
  LogOut, 
  Printer, 
  Layers, 
  FileSpreadsheet, 
  ExternalLink,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Copy,
  Check,
  FileText
} from "lucide-react";
import { RealtimeReportData, SolutionReportMetric, AdminAuthUser } from "../../types";
import { fetchRealtimeReports, saveStoredAdminUser, resetFeedbackDataApi } from "../../lib/api";
import { ProposalDetailModal } from "./ProposalDetailModal";
import { WhitelistManagerModal } from "./WhitelistManagerModal";

interface ExecutiveDashboardProps {
  adminUser: AdminAuthUser;
  onLogout: () => void;
  onBackToApp: () => void;
}

export function ExecutiveDashboard({ adminUser, onLogout, onBackToApp }: ExecutiveDashboardProps) {
  const [reportData, setReportData] = useState<RealtimeReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Filters & Search
  const [regionFilter, setRegionFilter] = useState<"all" | "pacifico" | "caribe">("all");
  const [commentRegionFilter, setCommentRegionFilter] = useState<"all" | "pacifico" | "caribe">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "comments" | "number">("votes");

  // Modals & Export States
  const [selectedProposal, setSelectedProposal] = useState<SolutionReportMetric | null>(null);
  const [isWhitelistOpen, setIsWhitelistOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      const ok = await resetFeedbackDataApi();
      if (ok) {
        setResetSuccessMessage("Base de datos restablecida a 0 exitosamente. Toda la plataforma está limpia y lista para votaciones oficiales.");
        await loadReports(true);
        setTimeout(() => setResetSuccessMessage(null), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
      setIsResetConfirmOpen(false);
    }
  };

  // Load reports function
  const loadReports = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await fetchRealtimeReports();
      setReportData(data);
      setLastRefreshedAt(new Date());
      setSecondsAgo(0);
    } catch (err) {
      console.error("Error loading real-time reports:", err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  // Initial load
  useEffect(() => {
    loadReports();
  }, []);

  // Timer for seconds ago counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefreshedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastRefreshedAt]);

  // Auto-refresh interval (every 5 seconds for snappy real-time updates)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadReports();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filtered recent comments list across all proposals
  const filteredRecentComments = useMemo(() => {
    if (!reportData || !reportData.recentComments) return [];
    if (commentRegionFilter === "all") return reportData.recentComments;
    return reportData.recentComments.filter((c) => c.region === commentRegionFilter);
  }, [reportData, commentRegionFilter]);

  // Filtered and sorted proposals list
  const filteredMetrics = useMemo(() => {
    if (!reportData) return [];
    let list = [...reportData.metrics];

    if (regionFilter !== "all") {
      list = list.filter((m) => m.region === regionFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.solutionId.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "votes") {
      list.sort((a, b) => b.votesCount - a.votesCount || b.commentsCount - a.commentsCount);
    } else if (sortBy === "comments") {
      list.sort((a, b) => b.commentsCount - a.commentsCount || b.votesCount - a.votesCount);
    } else if (sortBy === "number") {
      list.sort((a, b) => (a.region === b.region ? a.number - b.number : a.region.localeCompare(b.region)));
    }

    return list;
  }, [reportData, regionFilter, searchTerm, sortBy]);

  // Maximum votes among metrics for relative bar widths
  const maxVotes = useMemo(() => {
    if (!reportData || reportData.metrics.length === 0) return 1;
    return Math.max(1, ...reportData.metrics.map((m) => m.votesCount));
  }, [reportData]);

  // Helper to build CSV content safely with UTF-8 BOM and local semicolons
  const buildCSVContent = (): string => {
    if (!reportData) return "";

    let csvContent = "\uFEFF"; // UTF-8 BOM for Microsoft Excel
    csvContent += "REPORTE EJECUTIVO DE VOTACIONES Y RETROALIMENTACIÓN - VENTANA DE CONECTIVIDAD SIGNIFICATIVA\n";
    csvContent += "PROGRAMA DE EMPLEABILIDAD TIC · IDTF / OIT / UNIÓN EUROPEA\n";
    csvContent += `Generado el;${new Date().toLocaleString("es-CO")}\n`;
    csvContent += `Evaluador / Auditor;${adminUser.name} (${adminUser.organization} - ${adminUser.email})\n\n`;

    // 1. Resumen General
    csvContent += "1. CONSOLIDADO GENERAL DE PARTICIPACIÓN\n";
    csvContent += "Indicador Clave;Valor\n";
    csvContent += `Total Votos / Likes Registrados;${reportData.summary.totalVotes}\n`;
    csvContent += `Votos Nodo Pacífico;${reportData.summary.pacificoVotes}\n`;
    csvContent += `Votos Nodo Caribe;${reportData.summary.caribeVotes}\n`;
    csvContent += `Total Comentarios y Aportes;${reportData.summary.totalComments}\n`;
    csvContent += `Aliados y Votantes Únicos;${reportData.summary.uniqueVoters}\n`;
    csvContent += `Organizaciones Involucradas;${reportData.summary.uniqueOrganizations}\n\n`;

    // 2. Ranking de propuestas
    csvContent += "2. RANKING DE PROPUESTAS TERRITORIALES\n";
    csvContent += "Ranking;ID Propuesta;Nodo;Número;Título de la Propuesta;Votos / Likes;% del Total;Comentarios;Focos Temáticos\n";

    reportData.metrics.forEach((m) => {
      const escapedTitle = `"${(m.title || "").replace(/"/g, '""')}"`;
      const tagsStr = `"${(m.tags || []).join(", ").replace(/"/g, '""')}"`;
      csvContent += `${m.rank};${m.solutionId};${m.region.toUpperCase()};${m.number};${escapedTitle};${m.votesCount};${m.votePercentage}%;${m.commentsCount};${tagsStr}\n`;
    });

    // 3. Detalle completo de comentarios
    csvContent += "\n3. DETALLE COMPLETO DE COMENTARIOS Y RETROALIMENTACIÓN CUALITATIVA\n";
    csvContent += "ID Propuesta;Nodo;Número;Título de la Solución;Autor;Organización;Fecha;Comentario / Retroalimentación\n";

    let hasComments = false;
    reportData.metrics.forEach((m) => {
      (m.comments || []).forEach((c) => {
        hasComments = true;
        const textEscaped = `"${(c.text || "").replace(/"/g, '""')}"`;
        const authorEscaped = `"${(c.authorName || "Aliado Invitado").replace(/"/g, '""')}"`;
        const orgEscaped = `"${(c.authorOrg || "Organización Aliada").replace(/"/g, '""')}"`;
        const titleEscaped = `"${(m.title || "").replace(/"/g, '""')}"`;
        csvContent += `${m.solutionId};${m.region.toUpperCase()};${m.number};${titleEscaped};${authorEscaped};${orgEscaped};${c.createdAt || ""};${textEscaped}\n`;
      });
    });

    if (!hasComments) {
      csvContent += "Sin comentarios registrados aún en la plataforma;;;;;;;\n";
    }

    return csvContent;
  };

  // Safe file downloader with DOM attachment and delayed revoke
  const triggerDownload = (blob: Blob, filename: string): boolean => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 4000);
      return true;
    } catch (e) {
      console.warn("Blob download error:", e);
      return false;
    }
  };

  // Direct server download
  const triggerServerDownload = (endpoint: string, filename: string): boolean => {
    try {
      const link = document.createElement("a");
      link.href = `${endpoint}?_t=${Date.now()}`;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 4000);
      return true;
    } catch (e) {
      console.warn("Server direct download error:", e);
      return false;
    }
  };

  // Export CSV function (triggers client Blob + server fallback)
  const handleExportCSV = () => {
    const csvContent = buildCSVContent();
    const filename = `Reporte_Votaciones_VCS_${new Date().toISOString().slice(0, 10)}.csv`;

    if (csvContent) {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      triggerDownload(blob, filename);
    }

    // Always trigger direct server route as complementary guarantee
    triggerServerDownload("/api/admin/reports/csv", filename);

    setExportNotice("Descarga de CSV iniciada. Si tu navegador bloquea la descarga en esta pestaña, puedes copiarlo con un clic o abrir el panel de exportación.");
    setTimeout(() => setExportNotice(null), 8000);
  };

  // Copy CSV content to clipboard for immediate paste into Excel or Google Sheets
  const handleCopyCSV = async () => {
    const csvContent = buildCSVContent();
    if (!csvContent) {
      setExportNotice("No hay datos disponibles para copiar.");
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(csvContent);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = csvContent;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setExportNotice("¡Reporte CSV copiado al portapapeles! Puedes pegarlo (Ctrl+V) directamente en Microsoft Excel, LibreOffice o Google Sheets.");
      setTimeout(() => setCopied(false), 3000);
      setTimeout(() => setExportNotice(null), 7000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      setExportNotice("No se pudo copiar automáticamente. Usa la descarga directa desde el servidor.");
    }
  };

  // Export JSON function
  const handleExportJSON = () => {
    if (!reportData) return;
    const exportObj = {
      exportMetadata: {
        title: "Reporte Institucional de Votaciones y Feedback - VCS",
        generatedAt: new Date().toISOString(),
        auditedBy: adminUser
      },
      ...reportData
    };
    const jsonStr = JSON.stringify(exportObj, null, 2);
    const filename = `Reporte_VCS_Data_${new Date().toISOString().slice(0, 10)}.json`;

    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    triggerDownload(blob, filename);
    triggerServerDownload("/api/admin/reports/json", filename);

    setExportNotice("Descarga de JSON institucional iniciada.");
    setTimeout(() => setExportNotice(null), 6000);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const handleLogoutClick = () => {
    saveStoredAdminUser(null);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[var(--idtf-navy)] text-white flex flex-col selection:bg-[var(--idtf-naranja)] selection:text-[var(--idtf-navy)] print:bg-white print:text-black">
      
      {/* Top Administrative Bar */}
      <header className="border-b border-white/10 bg-[var(--idtf-navy-light)]/90 backdrop-blur-md sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--idtf-morado)] flex items-center justify-center text-white shadow">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--idtf-naranja)]">
                  Panel de Control Directivo · IDTF / OIT
                </span>
                <span className="text-white/30 text-xs">·</span>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>En vivo ({secondsAgo}s)</span>
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                Reportes en Tiempo Real · Votaciones & Feedback
              </h1>
            </div>
          </div>

          {/* User profile & controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Auto-refresh toggle */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                autoRefresh 
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" 
                  : "bg-white/5 border-white/10 text-white/50"
              }`}
              title="Actualización automática periódica"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Auto-refresco {autoRefresh ? "ON" : "OFF"}</span>
            </button>

            {/* Manual refresh button */}
            <button
              type="button"
              onClick={() => loadReports(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all"
              title="Recargar datos ahora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Whitelist manager button */}
            <button
              type="button"
              onClick={() => setIsWhitelistOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--idtf-morado)]/30 hover:bg-[var(--idtf-morado)]/50 text-white text-xs font-semibold border border-[var(--idtf-morado)]/60 transition-all"
              title="Ver y autorizar correos de aliados"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--idtf-morado)]" />
              <span className="hidden sm:inline">Whitelist</span>
            </button>

            {/* Export modal trigger button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold border border-emerald-500/50 transition-all shadow"
              title="Descargar o exportar reportes de votaciones y comentarios (CSV / JSON)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {/* Reset / Purge Data Button (Clean for Production) */}
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold border border-red-500/40 transition-all"
              title="Limpiar base de datos y reiniciar a 0 para producción"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Limpiar Base (0)</span>
            </button>

            {/* Back to public view */}
            <button
              type="button"
              onClick={onBackToApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
              title="Volver a la vista pública de propuestas"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Propuestas</span>
            </button>

            {/* User profile dropdown / logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/15">
              <div className="hidden lg:block text-right text-xs leading-tight">
                <div className="font-bold text-white truncate max-w-[140px]">{adminUser.name}</div>
                <div className="text-[10px] text-white/60 truncate max-w-[140px]">{adminUser.organization}</div>
              </div>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-colors"
                title="Cerrar sesión de evaluador"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Printable Executive Header (visible only on print) */}
        <div className="hidden print:block mb-8 pb-4 border-b border-black">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
            Informe Oficial de Votaciones y Retroalimentación Territorial
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Ventana de Conectividad Significativa · Organización Internacional del Trabajo (OIT) · Unión Europea · IDTF Facility
          </p>
          <div className="text-xs text-gray-500 mt-2 flex gap-4">
            <span>Fecha: {new Date().toLocaleString("es-CO")}</span>
            <span>Evaluador: {adminUser.name} ({adminUser.organization})</span>
          </div>
        </div>

        {/* Top Executive KPI Cards */}
        {reportData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Total Votos */}
            <div className="p-5 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 shadow-lg relative overflow-hidden group">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1">
                Votos Totales Acumulados
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {reportData.summary.totalVotes}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  Likes
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Pacífico: <strong>{reportData.summary.pacificoVotes}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span>Caribe: <strong>{reportData.summary.caribeVotes}</strong></span>
                </span>
              </div>
            </div>

            {/* Card 2: Propuesta Líder */}
            <div className="p-5 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 shadow-lg relative overflow-hidden">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--idtf-naranja)] mb-1 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Propuesta Más Votada</span>
              </div>
              {reportData.summary.leadingSolution ? (
                <div>
                  <div className="text-lg font-bold text-white line-clamp-2 leading-tight">
                    {reportData.summary.leadingSolution.title}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                    <span className="font-bold text-[var(--idtf-naranja)]">
                      {reportData.summary.leadingSolution.votes} votos
                    </span>
                    <span>·</span>
                    <span className="uppercase font-semibold text-white/50">
                      Nodo {reportData.summary.leadingSolution.region}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-white/50">Sin votos registrados</div>
              )}
            </div>

            {/* Card 3: Total Comentarios */}
            <div className="p-5 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 shadow-lg">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Comentarios & Aportes</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {reportData.summary.totalComments}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  Aportes cualitativos
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60 truncate">
                Retroalimentación institucional activa
              </div>
            </div>

            {/* Card 4: Organizaciones Aliadas */}
            <div className="p-5 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 shadow-lg">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--idtf-morado)]" />
                <span>Organizaciones Representadas</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {reportData.summary.uniqueOrganizations}
                </span>
                <span className="text-xs text-white/60 font-semibold">
                  Entidades
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
                Gremios, cajas, empresas y academia
              </div>
            </div>

            {/* Card 5: Votantes Únicos */}
            <div className="p-5 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 shadow-lg">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Votantes / Aliados</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {reportData.summary.uniqueVoters}
                </span>
                <span className="text-xs text-white/60 font-semibold">
                  Identificados
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
                Participantes directos en la consulta
              </div>
            </div>

          </div>
        )}

        {/* Visual Ranking Comparison Chart */}
        {reportData && (
          <div className="p-6 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[var(--idtf-naranja)]" />
                  <span>Distribución Comparativa de Votos por Propuesta</span>
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Visualización de popularidad y tracción estratégica entre los aliados. Haz clic en cualquier barra para ver el detalle de comentarios.
                </p>
              </div>

              {/* Node Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-3 rounded bg-cyan-500"></span>
                  <span>Nodo Pacífico</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-3 rounded bg-amber-500"></span>
                  <span>Nodo Caribe</span>
                </span>
              </div>
            </div>

            {/* Bar charts container */}
            <div className="space-y-3 pt-2">
              {reportData.metrics.map((item) => {
                const isPac = item.region === "pacifico";
                const barWidth = maxVotes > 0 ? (item.votesCount / maxVotes) * 100 : 0;

                return (
                  <div 
                    key={item.solutionId}
                    onClick={() => setSelectedProposal(item)}
                    className="group cursor-pointer p-2.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 text-center font-bold text-white/50 text-[11px]">
                          #{item.rank}
                        </span>
                        <span className="font-bold text-white group-hover:text-[var(--idtf-naranja)] transition-colors truncate">
                          {item.title}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${isPac ? "bg-cyan-500/20 text-cyan-300" : "bg-amber-500/20 text-amber-300"}`}>
                          {isPac ? "Pacífico" : "Caribe"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs">
                        <span className="text-white/60 font-medium">
                          {item.commentsCount} comentarios
                        </span>
                        <span className="font-extrabold text-white text-sm w-12 text-right">
                          {item.votesCount} {item.votesCount === 1 ? "voto" : "votos"}
                        </span>
                      </div>
                    </div>

                    {/* Bar track */}
                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden flex items-center">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isPac 
                            ? "bg-gradient-to-r from-cyan-600 to-cyan-400" 
                            : "bg-gradient-to-r from-amber-600 to-amber-400"
                        }`}
                        style={{ width: `${item.votesCount > 0 ? Math.max(4, barWidth) : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Real-Time Live Comments Wall & Qualitative Feedback Feed */}
        {reportData && (
          <div className="p-6 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    Transparencia Territorial en Directo
                  </span>
                  <span className="text-white/30">·</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Feed en Vivo</span>
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 mt-0.5">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span>Muro de Comentarios y Aportes en Tiempo Real ({reportData.summary.totalComments})</span>
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Todas las reflexiones, sugerencias y observaciones registradas por los participantes y aliados en el ecosistema.
                </p>
              </div>

              {/* Filter pills for comments */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Filtrar por nodo:</span>
                <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCommentRegionFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${commentRegionFilter === "all" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
                  >
                    Todos ({reportData.recentComments?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentRegionFilter("pacifico")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${commentRegionFilter === "pacifico" ? "bg-cyan-500/30 text-cyan-300" : "text-white/60 hover:text-white"}`}
                  >
                    Pacífico
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentRegionFilter("caribe")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${commentRegionFilter === "caribe" ? "bg-amber-500/30 text-amber-300" : "text-white/60 hover:text-white"}`}
                  >
                    Caribe
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Grid */}
            {filteredRecentComments.length === 0 ? (
              <div className="py-10 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-xl space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
                <p className="font-semibold text-white/60">Aún no se registran comentarios en la base de datos.</p>
                <p className="text-[11px] text-white/40">Tan pronto los aliados o invitados envíen aportes desde la vista de propuestas, se desplegarán aquí en vivo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {filteredRecentComments.map((c) => {
                  const isPac = c.region === "pacifico";
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        const matchedSol = reportData.metrics.find((m) => m.solutionId === c.solutionId);
                        if (matchedSol) setSelectedProposal(matchedSol);
                      }}
                      className="p-4 rounded-xl bg-black/30 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 cursor-pointer group hover:bg-black/40"
                      title="Hacer clic para ver la ficha completa de esta propuesta"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isPac ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}>
                            Nodo {c.region} · Solución #{c.solutionNumber}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {new Date(c.createdAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-white group-hover:text-[var(--idtf-naranja)] transition-colors line-clamp-1">
                          {c.solutionTitle}
                        </div>

                        <p className="text-xs text-white/85 leading-relaxed italic bg-white/[0.03] p-2.5 rounded-lg border border-white/5 whitespace-pre-wrap">
                          "{c.text}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {c.authorName ? c.authorName.charAt(0).toUpperCase() : "A"}
                          </div>
                          <div className="min-w-0 text-[11px]">
                            <div className="font-semibold text-white truncate">{c.authorName || "Participante Invitado"}</div>
                            <div className="text-[10px] text-white/50 truncate">{c.authorOrg || "Organización Aliada"}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-[var(--idtf-naranja)] font-medium group-hover:underline shrink-0">
                          Ver ficha →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Detailed Table & Reporting Action Bar */}
        <div className="p-6 rounded-2xl bg-[var(--idtf-navy-light)] border border-white/10 shadow-lg space-y-5">
          
          {/* Action Bar: Filters, Search, Exports */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Filter buttons & Search */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Region Selector */}
              <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRegionFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${regionFilter === "all" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
                >
                  Todas (9)
                </button>
                <button
                  type="button"
                  onClick={() => setRegionFilter("pacifico")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${regionFilter === "pacifico" ? "bg-cyan-500/30 text-cyan-300" : "text-white/60 hover:text-white"}`}
                >
                  Pacífico (5)
                </button>
                <button
                  type="button"
                  onClick={() => setRegionFilter("caribe")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${regionFilter === "caribe" ? "bg-amber-500/30 text-amber-300" : "text-white/60 hover:text-white"}`}
                >
                  Caribe (4)
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar propuesta o palabra clave..."
                  className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--idtf-morado)]"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--idtf-morado)]"
                >
                  <option value="votes">Más votadas primero</option>
                  <option value="comments">Más comentadas primero</option>
                  <option value="number">Por código y nodo</option>
                </select>
              </div>

            </div>

            {/* Export buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
              {/* Primary CSV export button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95"
                title="Descargar archivo Excel / CSV de forma automática"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Descargar CSV</span>
              </button>

              {/* Direct Copy to Clipboard for Excel */}
              <button
                type="button"
                onClick={handleCopyCSV}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  copied 
                    ? "bg-emerald-500/30 border-emerald-400 text-emerald-200" 
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-white"
                }`}
                title="Copiar datos al portapapeles para pegar directo (Ctrl+V) en Excel"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/70" />}
                <span>{copied ? "¡Copiado!" : "Copiar CSV"}</span>
              </button>

              {/* Full Export Options Modal */}
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white/90 text-xs font-semibold transition-colors"
                title="Ver todas las opciones de exportación y enlace directo de servidor"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--idtf-naranja)]" />
                <span className="hidden sm:inline">Más Opciones</span>
              </button>

              {/* JSON export */}
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-colors shadow"
                title="Descargar datos en formato JSON institucional"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </button>

              {/* Print / PDF export */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-colors shadow"
                title="Imprimir o guardar como PDF"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir / PDF</span>
              </button>
            </div>

          </div>

          {/* Proposals Master Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/30 text-white/50 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-3 text-center w-12">Rank</th>
                  <th className="py-3 px-4">Propuesta Territorial</th>
                  <th className="py-3 px-3 text-center">Nodo</th>
                  <th className="py-3 px-3 text-center">Votos</th>
                  <th className="py-3 px-3 text-center">% Votos</th>
                  <th className="py-3 px-3 text-center">Comentarios</th>
                  <th className="py-3 px-4 print:hidden text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-white/40">
                      No se encontraron propuestas con los criterios de búsqueda aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredMetrics.map((item) => {
                    const isPac = item.region === "pacifico";
                    return (
                      <tr 
                        key={item.solutionId}
                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => setSelectedProposal(item)}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-3 text-center font-black text-sm text-white/70">
                          #{item.rank}
                        </td>

                        {/* Title & Tags */}
                        <td className="py-3.5 px-4 min-w-[280px]">
                          <div className="font-bold text-white text-sm group-hover:text-[var(--idtf-naranja)] transition-colors leading-snug">
                            {item.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-white/50">
                            {item.tags.slice(0, 3).map((tag, idx) => (
                              <React.Fragment key={tag}>
                                <span>{tag}</span>
                                {idx < Math.min(item.tags.length - 1, 2) && <span>·</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        </td>

                        {/* Node */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isPac ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}>
                            {isPac ? "Pacífico" : "Caribe"}
                          </span>
                        </td>

                        {/* Votes */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-black text-white text-sm">
                            {item.votesCount}
                          </span>
                        </td>

                        {/* Vote Percentage */}
                        <td className="py-3.5 px-3 text-center font-bold text-[var(--idtf-naranja)]">
                          {item.votePercentage}%
                        </td>

                        {/* Comments count */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{item.commentsCount}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right print:hidden">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProposal(item);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition-colors"
                          >
                            <span>Ver Feedback</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* Proposal Detail & Comments Modal */}
      <ProposalDetailModal
        isOpen={Boolean(selectedProposal)}
        onClose={() => setSelectedProposal(null)}
        proposal={selectedProposal}
      />

      {/* Whitelist Manager Modal */}
      <WhitelistManagerModal
        isOpen={isWhitelistOpen}
        onClose={() => {
          setIsWhitelistOpen(false);
          loadReports();
        }}
      />

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--idtf-navy-light)] border border-red-500/40 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">¿Reiniciar Base de Datos a 0?</h3>
                  <p className="text-xs text-red-300 font-semibold">Plataforma en Producción</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-white/80 leading-relaxed bg-black/20 p-3.5 rounded-xl border border-white/10">
              <p>
                Esta acción eliminará de manera definitiva todos los votos de prueba y comentarios acumulados hasta el momento.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-white/70">
                <li>Los contadores de votos iniciarán en <strong>0</strong>.</li>
                <li>Los hilos de comentarios quedarán en <strong>blanco</strong>.</li>
                <li>La lista blanca de correos autorizados permanecerá <strong>intacta</strong>.</li>
              </ul>
              <p className="text-emerald-400 font-semibold pt-1">
                Esto garantiza que las métricas y análisis oficiales comiencen sin ningún sesgo o ruido de calibración.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Limpiando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Limpiar a 0</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Options & Server Fallback Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--idtf-navy-light)] border border-white/20 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Exportación Oficial de Reportes</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase font-semibold">
                      En Vivo
                    </span>
                  </h3>
                  <p className="text-xs text-white/60">
                    Descarga consolidada de votos, porcentajes, ranking y comentarios cualitativos territoriales.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Export Method Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              
              {/* Card 1: Descargar CSV */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Descargar CSV (Excel)</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Formato regional con separador punto y coma (;) y codificación UTF-8 BOM para apertura nativa e inmediata en Microsoft Excel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleExportCSV();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo CSV</span>
                </button>
              </div>

              {/* Card 2: Copiar al Portapapeles */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--idtf-morado)]/50 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Copy className="w-4 h-4" />
                    <span>Copiar CSV al Portapapeles</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Copia todo el texto del reporte para pegarlo directo (Ctrl+V) en Microsoft Excel, Google Sheets o un correo sin depender de descargas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCSV}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                    copied 
                      ? "bg-purple-600/40 text-purple-200 border border-purple-400" 
                      : "bg-[var(--idtf-morado)] hover:bg-[var(--idtf-morado)]/80 text-white"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-purple-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "¡Datos Copiados!" : "Copiar al Portapapeles"}</span>
                </button>
              </div>

              {/* Card 3: Descarga Directa desde Servidor */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <ExternalLink className="w-4 h-4" />
                    <span>Descarga Directa Servidor</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Enlace HTTP nativo directo desde el backend (/api/admin/reports/csv). Ideal si el navegador o iframe bloquea descargas en segundo plano.
                  </p>
                </div>
                <a
                  href="/api/admin/reports/csv"
                  download={`Reporte_Votaciones_VCS_${new Date().toISOString().slice(0, 10)}.csv`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Enlace Servidor HTTP</span>
                </a>
              </div>

              {/* Card 4: Descargar JSON */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Descargar Archivo JSON</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Estructura técnica completa con metadatos, objetos anidados de cada comentario y sellos de tiempo ISO para auditoría digital.
                  </p>
                </div>
                <a
                  href="/api/admin/reports/json"
                  download={`Reporte_VCS_Data_${new Date().toISOString().slice(0, 10)}.json`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors text-center border border-white/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo JSON</span>
                </a>
              </div>

            </div>

            {/* CSV Data Preview Box */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="font-semibold text-white/80">Previsualización del Contenido CSV:</span>
                <span className="text-[10px] text-white/40">Separador: ";" · UTF-8 BOM</span>
              </div>
              <div className="bg-black/50 p-3 rounded-xl border border-white/10 text-[11px] font-mono overflow-x-auto max-h-36 whitespace-pre text-emerald-300 select-all scrollbar-thin">
                {buildCSVContent() || "Sin datos para previsualizar."}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[11px] text-white/50">
                Total Propuestas: <strong>9</strong> · Nodo Pacífico (5) · Nodo Caribe (4)
              </span>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Export Notice Banner Toast */}
      {exportNotice && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-emerald-500/50 text-white shadow-2xl backdrop-blur-md max-w-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs flex-1">
            <span className="font-medium text-white/90">{exportNotice}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyCSV}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/15 transition-colors"
            >
              Copiar
            </button>
            <a
              href="/api/admin/reports/csv"
              download={`Reporte_Votaciones_VCS_${new Date().toISOString().slice(0, 10)}.csv`}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
            >
              Descarga Directa
            </a>
            <button
              type="button"
              onClick={() => setExportNotice(null)}
              className="p-1 rounded text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {resetSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{resetSuccessMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[var(--idtf-navy-light)] py-5 px-4 text-center text-xs text-white/40 print:hidden">
        Ventana de Conectividad Significativa · Sistema de Reportes Ejecutivos en Tiempo Real con Autenticación Whitelist.
      </footer>

    </div>
  );
}
