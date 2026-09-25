import React, { useState, useEffect } from "react";
import { SOLUTIONS_DATA, Solution } from "./data/solutionsData";
import { UserProfile, CommentItem, FeedbackData, AdminAuthUser } from "./types";
import { 
  getOrCreateUserId, 
  getStoredUserProfile, 
  saveStoredUserProfile, 
  fetchFeedbackData, 
  toggleSolutionLike, 
  postSolutionComment, 
  registerUserApi,
  getStoredAdminUser,
  saveStoredAdminUser
} from "./lib/api";
import { RegionSelector } from "./components/RegionSelector";
import { RegionSolutionsView } from "./components/RegionSolutionsView";
import { RegistrationModal } from "./components/RegistrationModal";
import { CommentModal } from "./components/CommentModal";
import { AdminAuthModal } from "./components/AdminDashboard/AdminAuthModal";
import { ExecutiveDashboard } from "./components/AdminDashboard/ExecutiveDashboard";
import { Building2, Heart, MessageSquare, Layers, ShieldCheck, BarChart3 } from "lucide-react";

export function App() {
  const [page, setPage] = useState<"landing" | "pacifico" | "caribe" | "dashboard">("landing");
  const [userId] = useState<string>(() => getOrCreateUserId());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredUserProfile());
  const [adminUser, setAdminUser] = useState<AdminAuthUser | null>(() => getStoredAdminUser());
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [targetRegionAfterRegister, setTargetRegionAfterRegister] = useState<"pacifico" | "caribe" | null>(null);
  const [activeCommentSolution, setActiveCommentSolution] = useState<Solution | null>(null);

  const [feedback, setFeedback] = useState<FeedbackData>({
    likes: {},
    userLikes: {},
    comments: {}
  });

  // Load and continuously sync feedback and comments so all guests see comments in real time
  useEffect(() => {
    let isMounted = true;

    const loadData = () => {
      fetchFeedbackData(userId).then((data) => {
        if (isMounted && data) {
          setFeedback(data);
        }
      });
    };

    loadData();

    // Auto-poll comments and likes every 6 seconds (or 3 seconds if comment modal is active)
    const pollIntervalMs = activeCommentSolution ? 3000 : 6000;
    const interval = setInterval(loadData, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId, activeCommentSolution]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Handle region selection from Page 1
  const handleSelectRegion = (region: "pacifico" | "caribe") => {
    const isIdentified = Boolean(userProfile.name.trim() && userProfile.organization.trim());
    if (!isIdentified) {
      // Prompt modal with suggestion to identify
      setTargetRegionAfterRegister(region);
      setIsRegistrationOpen(true);
    } else {
      setPage(region);
    }
  };

  // Handle saving user profile
  const handleSaveProfile = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    saveStoredUserProfile(newProfile);
    await registerUserApi(newProfile);

    if (targetRegionAfterRegister) {
      setPage(targetRegionAfterRegister);
      setTargetRegionAfterRegister(null);
    }
  };

  // If user skips modal or closes it while targeting a region, still let them proceed to that region!
  const handleCloseRegistrationModal = () => {
    setIsRegistrationOpen(false);
    if (targetRegionAfterRegister) {
      setPage(targetRegionAfterRegister);
      setTargetRegionAfterRegister(null);
    }
  };

  // Toggle Like on a solution with persistent database storage
  const handleToggleLike = async (solutionId: string) => {
    const currentLiked = Boolean(feedback.userLikes[solutionId]);
    const currentCount = feedback.likes[solutionId] || 0;

    // Optimistic UI update
    setFeedback((prev) => ({
      ...prev,
      likes: {
        ...prev.likes,
        [solutionId]: currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1
      },
      userLikes: {
        ...prev.userLikes,
        [solutionId]: !currentLiked
      }
    }));

    // Server database update
    const result = await toggleSolutionLike(solutionId, userId, userProfile);
    setFeedback((prev) => ({
      ...prev,
      likes: {
        ...prev.likes,
        [solutionId]: result.likesCount
      },
      userLikes: {
        ...prev.userLikes,
        [solutionId]: result.userLiked
      }
    }));
  };

  // Add Comment to a solution with persistent database storage
  const handleAddComment = async (
    solutionId: string, 
    text: string, 
    authorInfo?: { name: string; org: string; email?: string }
  ) => {
    const author = {
      name: authorInfo?.name || userProfile.name || "Participante",
      org: authorInfo?.org || userProfile.organization || "Organización Aliada",
      email: authorInfo?.email || userProfile.email || ""
    };

    // If author entered new profile data, update local profile
    if (authorInfo?.name && (!userProfile.name || !userProfile.organization)) {
      const updatedProfile: UserProfile = {
        name: authorInfo.name,
        organization: authorInfo.org,
        email: authorInfo.email || userProfile.email,
        role: userProfile.role
      };
      setUserProfile(updatedProfile);
      saveStoredUserProfile(updatedProfile);
      registerUserApi(updatedProfile);
    }

    const savedComment = await postSolutionComment(solutionId, text, author);

    // Update state with newly saved comment
    setFeedback((prev) => {
      const existing = prev.comments[solutionId] || [];
      return {
        ...prev,
        comments: {
          ...prev.comments,
          [solutionId]: [savedComment, ...existing]
        }
      };
    });
  };

  // Solutions filtered by active region
  const pacificoSolutions = SOLUTIONS_DATA.filter((s) => s.region === "pacifico");
  const caribeSolutions = SOLUTIONS_DATA.filter((s) => s.region === "caribe");

  // Summary stats for landing page cards
  const pacificoStats = {
    likes: pacificoSolutions.reduce((sum, s) => sum + (feedback.likes[s.id] || 0), 0),
    comments: pacificoSolutions.reduce((sum, s) => sum + ((feedback.comments[s.id] || []).length), 0)
  };

  const caribeStats = {
    likes: caribeSolutions.reduce((sum, s) => sum + (feedback.likes[s.id] || 0), 0),
    comments: caribeSolutions.reduce((sum, s) => sum + ((feedback.comments[s.id] || []).length), 0)
  };

  // If on executive dashboard and authenticated, render full-screen Executive Dashboard
  if (page === "dashboard" && adminUser) {
    return (
      <ExecutiveDashboard
        adminUser={adminUser}
        onLogout={() => {
          setAdminUser(null);
          setPage("landing");
        }}
        onBackToApp={() => setPage("landing")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--idtf-navy)] text-white flex flex-col justify-between selection:bg-[var(--idtf-naranja)] selection:text-[var(--idtf-navy)]">
      
      {/* Decorative IDTF Side Accent Bars */}
      <div className="idtf-side-accent hidden sm:flex">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="idtf-corner-accent hidden sm:flex">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Main Top Header */}
      <header className="border-b border-white/10 bg-[var(--idtf-navy-light)]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo / Title Wordmark */}
          <div 
            onClick={() => setPage("landing")} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="idtf-isologo">
              <span className="idtf-isologo__bar idtf-isologo__bar--1"></span>
              <span className="idtf-isologo__bar idtf-isologo__bar--2"></span>
              <span className="idtf-isologo__bar idtf-isologo__bar--3"></span>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--idtf-morado)]">
                Ventana de Conectividad Significativa
              </div>
              <div className="text-sm font-extrabold uppercase tracking-tight text-white group-hover:text-[var(--idtf-naranja)] transition-colors">
                Empleabilidad TIC • Nodo Pacífico & Nodo Caribe
              </div>
            </div>
          </div>

          {/* Right status / navigation */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {page !== "landing" && (
              <button
                type="button"
                onClick={() => setPage("landing")}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 font-semibold uppercase tracking-wider transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Nodos Territoriales</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setTargetRegionAfterRegister(null);
                setIsRegistrationOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors border border-white/10"
              title="Registrar o actualizar mis datos de aliado"
            >
              <Building2 className="w-3.5 h-3.5 text-[var(--idtf-naranja)]" />
              <span className="hidden md:inline">
                {userProfile.name ? `${userProfile.name} (${userProfile.organization || "Aliado"})` : "Identificarme"}
              </span>
              <span className="md:hidden">
                {userProfile.name ? userProfile.name.split(" ")[0] : "Identificarme"}
              </span>
            </button>

            {/* Direct access to Whitelist Executive Dashboard */}
            <button
              type="button"
              onClick={() => {
                if (adminUser) {
                  setPage("dashboard");
                } else {
                  setIsAdminAuthModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--idtf-morado)]/30 hover:bg-[var(--idtf-morado)]/50 text-white font-semibold transition-all border border-[var(--idtf-morado)]/60 text-xs shadow-sm"
              title="Acceder al Dashboard de Reportes en Tiempo Real (Protegido por Whitelist)"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[var(--idtf-morado)]" />
              <span className="hidden sm:inline">Dashboard de Reportes</span>
              <span className="sm:hidden">Reportes</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main View Router */}
      <main className="flex-1 flex flex-col justify-center">
        {page === "landing" && (
          <RegionSelector
            onSelectRegion={handleSelectRegion}
            userProfile={userProfile}
            onOpenProfileModal={(reg) => {
              setTargetRegionAfterRegister(reg || null);
              setIsRegistrationOpen(true);
            }}
            pacificoStats={pacificoStats}
            caribeStats={caribeStats}
          />
        )}

        {page === "pacifico" && (
          <RegionSolutionsView
            region="pacifico"
            solutions={pacificoSolutions}
            likes={feedback.likes}
            userLikes={feedback.userLikes}
            comments={feedback.comments}
            onToggleLike={handleToggleLike}
            onOpenComments={(solution) => setActiveCommentSolution(solution)}
            onBackToRegions={() => setPage("landing")}
            onSwitchRegion={(target) => setPage(target)}
            userProfile={userProfile}
            onOpenProfileModal={() => {
              setTargetRegionAfterRegister(null);
              setIsRegistrationOpen(true);
            }}
          />
        )}

        {page === "caribe" && (
          <RegionSolutionsView
            region="caribe"
            solutions={caribeSolutions}
            likes={feedback.likes}
            userLikes={feedback.userLikes}
            comments={feedback.comments}
            onToggleLike={handleToggleLike}
            onOpenComments={(solution) => setActiveCommentSolution(solution)}
            onBackToRegions={() => setPage("landing")}
            onSwitchRegion={(target) => setPage(target)}
            userProfile={userProfile}
            onOpenProfileModal={() => {
              setTargetRegionAfterRegister(null);
              setIsRegistrationOpen(true);
            }}
          />
        )}
      </main>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={handleCloseRegistrationModal}
        onSave={handleSaveProfile}
        initialProfile={userProfile}
        regionContext={targetRegionAfterRegister}
      />

      {/* Comment Modal */}
      <CommentModal
        isOpen={Boolean(activeCommentSolution)}
        onClose={() => setActiveCommentSolution(null)}
        solution={activeCommentSolution}
        comments={activeCommentSolution ? (feedback.comments[activeCommentSolution.id] || []) : []}
        userProfile={userProfile}
        onAddComment={handleAddComment}
        likesCount={activeCommentSolution ? (feedback.likes[activeCommentSolution.id] || 0) : 0}
        userLiked={activeCommentSolution ? Boolean(feedback.userLikes[activeCommentSolution.id]) : false}
        onToggleLike={handleToggleLike}
      />

      {/* Whitelist Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setAdminUser(user);
          setIsAdminAuthModalOpen(false);
          setPage("dashboard");
        }}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-white/10 bg-[var(--idtf-navy-light)] py-6 px-4 text-center text-xs text-white/50 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-white/70 font-semibold uppercase tracking-wider text-[11px]">
          <span>Organización Internacional del Trabajo (OIT)</span>
          <span>•</span>
          <span>Unión Europea</span>
          <span>•</span>
          <span>IDTF Facility</span>
          <span>•</span>
          <span>Ventana de Conectividad Significativa</span>
        </div>
        <p className="text-[11px] text-white/40">
          Plataforma de validación de soluciones de empleabilidad para jóvenes en el sector TIC. Sistema de registro persistente de interacciones.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              if (adminUser) {
                setPage("dashboard");
              } else {
                setIsAdminAuthModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-[var(--idtf-naranja)] text-[11px] font-semibold border border-white/10 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--idtf-morado)]" />
            <span>Acceso Directivo a Reportes en Tiempo Real (Whitelist)</span>
          </button>
        </div>
      </footer>

    </div>
  );
}

export default App;
