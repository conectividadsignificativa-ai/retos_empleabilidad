import { useState, FormEvent } from "react";
import { 
  Coins, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Flame, 
  Zap, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  RefreshCw, 
  Info,
  Compass,
  MapPin,
  Building,
  User,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Laptop,
  Briefcase,
  Megaphone,
  Handshake,
  Puzzle,
  Layers,
  BookOpen,
  HeartHandshake
} from "lucide-react";
import { TRIANGULATED_CHALLENGES } from "./data/simulatorData";
import { Territory, OrganizationProfile, CollaborationCategoryId, ChallengeSynergiesRecord } from "./types";
import { Colombia3DMap } from "./components/Colombia3DMap";
import { VcsMethodology } from "./components/VcsMethodology";
import { AllyRegistration } from "./components/AllyRegistration";
import { PactoSignificativo } from "./components/PactoSignificativo";
import { ChallengeDetail } from "./components/ChallengeDetail";
import { PuzzleInfographic } from "./components/PuzzleInfographic";
import { submitPactoResponse } from "./lib/firebase";

const COLLABORATION_CATEGORIES: {
  id: CollaborationCategoryId;
  title: string;
  description: string;
  icon: typeof DollarSign;
  chipClass: string;
}[] = [
  {
    id: "financieros",
    title: "Financieros",
    description: "Puede aportar con económico para la implementación de los startups / ruta de empleabilidad, ya sea en su fase inicial o en una etapa posterior de escalamiento.",
    icon: DollarSign,
    chipClass: "idtf-chip--naranja"
  },
  {
    id: "acompanamiento",
    title: "Acompañamiento",
    description: "Puede aportar con Disposición de talento especializado para ejercer mentorías y orientar a los equipos de startups / buscadores a lo largo del proceso o contar con oferta educativa para el fortalecimiento de los startups (cursos rápidos)",
    icon: GraduationCap,
    chipClass: "idtf-chip"
  },
  {
    id: "espacios",
    title: "Espacios",
    description: "Puede aportar con Habilitación de laboratorios e instalaciones físicas para el desarrollo de actividades en las regiones del Pacífico y el Caribe.",
    icon: Building,
    chipClass: "idtf-chip--verde"
  },
  {
    id: "dotacion",
    title: "Dotación",
    description: "Suministro de equipos y soluciones de conectividad para los equipos juveniles, incluyendo computadores, tablets y acceso a internet",
    icon: Laptop,
    chipClass: "idtf-chip--naranja"
  },
  {
    id: "vinculacion",
    title: "Vinculación",
    description: "Contratación de los y las jóvenes participantes en las entidades aliadas una vez concluido el proceso, como reconocimiento a su trayectoria y formación.",
    icon: Briefcase,
    chipClass: "idtf-chip"
  },
  {
    id: "comunicaciones",
    title: "Comunicaciones",
    description: "Apoyo en estrategias de difusión y publicidad para dar a conocer el proceso, sus resultados y el impacto de los startups. Uso de plataformas existentes de marketing para posicionar a los startups.",
    icon: Megaphone,
    chipClass: "idtf-chip--verde"
  }
];

const createEmptySynergies = (): ChallengeSynergiesRecord => ({
  selectedServices: [],
  otherServiceText: "",
  capacityDetail: "",
  financieros: "",
  acompanamiento: "",
  espacios: "",
  dotacion: "",
  vinculacion: "",
  comunicaciones: ""
});

export default function App() {
  // Navigation steps: 
  // 1: Selección de Zona en Mapa 3D
  // 2: Metodología VCS & Diagnóstico OIT/UNFPA/UE + Registro Aliado (Página 2.1)
  // 3: Lista de Retos e Instrucción Presupuesto 10 Monedas IDTF
  // 4: Detalle del Reto e Inversión
  // 5: Firma del Pacto Final
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Active Challenge ID for Step 4 (null = list view, string = challenge detail view)
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  // Profile Form State
  const [profile, setProfile] = useState<OrganizationProfile>({
    companyName: "",
    actorType: "Empresa de Software / TI",
    contactName: "",
    contactRole: "",
    contactEmail: "",
    territory: "Pacífico (Cali, Pasto, Buenaventura, etc.)"
  });

  // Coin Allocation (Total 10 Coins)
  const [coins, setCoins] = useState<Record<string, number>>({
    "Reto A": 0,
    "Reto B": 0,
    "Reto C": 0,
    "Reto D": 0
  });

  // Mandatory structured synergy contributions per challenge
  const [synergies, setSynergies] = useState<Record<string, ChallengeSynergiesRecord>>({
    "Reto A": createEmptySynergies(),
    "Reto B": createEmptySynergies(),
    "Reto C": createEmptySynergies(),
    "Reto D": createEmptySynergies()
  });

  // Pact signed state
  const [isPactSigned, setIsPactSigned] = useState<boolean>(false);

  // Coins Calculation
  const totalCoinsSpent = (Object.values(coins) as number[]).reduce((a, b) => a + b, 0);
  const remainingCoins = 10 - totalCoinsSpent;

  // Filter challenges according to location selected
  const getFilteredChallenges = () => {
    if (profile.territory.includes("Caribe")) {
      return TRIANGULATED_CHALLENGES.filter(c => c.region === "Caribe");
    } else {
      return TRIANGULATED_CHALLENGES.filter(c => c.region === "Pacífico");
    }
  };

  const filteredChallenges = getFilteredChallenges();

  // Step 1 -> Step 2 transition (Proceed from Map to VCS Methodology)
  const handleProceedToMethodology = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 -> Step 3 transition (From VCS Methodology to Ally Registration)
  const handleCompleteMethodology = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3 -> Step 4 transition (From Ally Registration to Strategic Challenges List)
  const handleCompleteAllyRegistration = (e: FormEvent) => {
    e.preventDefault();
    if (!profile.contactName || !profile.companyName) {
      alert("Por favor ingresa tu nombre y el de tu organización para continuar.");
      return;
    }

    // Direct to the list of challenges (selectedChallengeId = null) for the chosen location
    setSelectedChallengeId(null);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 4 -> Step 5 transition (From Challenges to Pacto Significativo)
  const handleProceedToPacto = () => {
    if (remainingCoins > 0) {
      alert(`Por favor asigna la totalidad de tus 10 monedas simbólicas en los retos antes de continuar. Aún tienes ${remainingCoins} monedas disponibles.`);
      return;
    }
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit response payload to Firebase Firestore
  const handleSubmitPactoResponse = async () => {
    await submitPactoResponse({
      contactName: profile.contactName,
      companyName: profile.companyName,
      contactRole: profile.contactRole,
      contactEmail: profile.contactEmail,
      territory: profile.territory,
      coins: coins,
      synergies: synergies,
    });
  };

  // Adjust Coin Allocation
  const handleCoinChange = (challengeId: string, delta: number) => {
    const current = coins[challengeId] || 0;
    const nextVal = current + delta;
    if (nextVal < 0) return;
    if (delta > 0 && remainingCoins <= 0) return;

    setCoins(prev => ({
      ...prev,
      [challengeId]: nextVal
    }));
  };

  // Toggle last mile service checkbox for a challenge
  const handleToggleService = (challengeId: string, serviceName: string) => {
    setSynergies(prev => {
      const currentRecord = prev[challengeId] || createEmptySynergies();
      const currentServices = currentRecord.selectedServices || [];
      const exists = currentServices.includes(serviceName);
      const updatedServices = exists
        ? currentServices.filter(s => s !== serviceName)
        : [...currentServices, serviceName];

      return {
        ...prev,
        [challengeId]: {
          ...currentRecord,
          selectedServices: updatedServices
        }
      };
    });
  };

  // Update text for "Otro" service
  const handleOtherServiceTextChange = (challengeId: string, text: string) => {
    setSynergies(prev => ({
      ...prev,
      [challengeId]: {
        ...(prev[challengeId] || createEmptySynergies()),
        otherServiceText: text
      }
    }));
  };

  // Update capacity details text area
  const handleCapacityDetailChange = (challengeId: string, text: string) => {
    setSynergies(prev => ({
      ...prev,
      [challengeId]: {
        ...(prev[challengeId] || createEmptySynergies()),
        capacityDetail: text
      }
    }));
  };

  const currentChallenge = TRIANGULATED_CHALLENGES.find(c => c.id === selectedChallengeId) || TRIANGULATED_CHALLENGES[0];

  return (
    <div className="min-h-screen bg-[var(--idtf-navy)] text-[var(--idtf-white)] flex flex-col font-sans relative overflow-x-hidden selection:bg-[var(--idtf-naranja)] selection:text-[var(--idtf-navy)]" id="app-root">
      
      {/* IDTF Corner Accent Bar (top right) */}
      <div className="idtf-corner-accent" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* IDTF Side Accent Bar (bottom left) */}
      <div className="idtf-side-accent" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Header with IDTF FACILITY Brand Wordmark & Budget HUD */}
      <header className="sticky top-0 z-40 bg-[var(--idtf-navy)]/90 backdrop-blur-md border-b border-white/10" id="app-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          
          {/* IDTF Brand Header */}
          <div className="flex items-center gap-4">
            <div className="idtf-isologo shrink-0" aria-label="Facility Logo">
              <div className="idtf-isologo__bar idtf-isologo__bar--1" />
              <div className="idtf-isologo__bar idtf-isologo__bar--2" />
              <div className="idtf-isologo__bar idtf-isologo__bar--3" />
            </div>

            <div>
              <div className="text-xs font-mono tracking-widest text-[var(--idtf-morado)] uppercase font-bold">
                IDTF · FACILITY
              </div>
              <h1 className="text-sm font-extrabold text-white tracking-tight uppercase">
                Retos de empleabilidad - Conectividad significativa
              </h1>
            </div>
          </div>

          {/* Single Consolidated Sticky Badge in Header (Steps 4 & 5) */}
          {currentStep >= 4 && (
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-[var(--idtf-navy-light)] to-[#1a233d] border-2 border-[var(--idtf-naranja)]/60 px-4 py-2 rounded-full shadow-2xl">
              <Coins className="w-5 h-5 text-[var(--idtf-naranja)] shrink-0" />
              <div className="text-xs font-mono flex items-center gap-1.5">
                <span className="text-white/80 hidden sm:inline font-bold">Monedas Libres:</span>
                <span className="font-black text-sm text-[var(--idtf-naranja)]">{remainingCoins}</span>
                <span className="text-white/40">/ 10</span>
              </div>
            </div>
          )}

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 sm:py-16 flex flex-col justify-center relative z-10" id="app-main">

        {/* ========================================================= */}
        {/* PASO 1: SELECCIÓN TERRITORIAL CON MAPA 3D                */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-10 max-w-4xl mx-auto" id="step-1-map">
            
            {/* Breadcrumb Header */}
            <div className="idtf-breadcrumb justify-center">
              <span className="idtf-breadcrumb__step">01</span>
              <span className="text-[var(--idtf-text-muted)]">/</span>
              <span className="idtf-breadcrumb__section">SELECCIÓN TERRITORIAL</span>
              <span className="text-[var(--idtf-text-muted)]">/</span>
              <span className="idtf-breadcrumb__current">MAPA DIGITAL 3D</span>
            </div>

            {/* Prominent Large Introductory Question */}
            <div className="text-center space-y-4 max-w-3xl mx-auto px-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--idtf-morado)]/20 border border-[var(--idtf-morado)]/40 text-xs font-mono font-bold text-[var(--idtf-morado)] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[var(--idtf-naranja)] animate-pulse" />
                Pacto por la Conectividad Significativa
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                ¿En qué <span className="text-[var(--idtf-naranja)] underline decoration-[var(--idtf-naranja)]/40 decoration-4">zona del país</span> se enfoca tu oferta para crear oportunidades para el <span className="text-[var(--idtf-morado)]">talento digital juvenil</span>?
              </h1>

              <p className="text-sm sm:text-base text-[var(--idtf-text-secondary)] leading-relaxed max-w-2xl mx-auto">
                Interactúa con el mapa digital de Colombia a continuación. Selecciona el punto geográfico (Pacífico, Caribe o Nivel Nacional) correspondiente a la zona de impacto de tu organización.
              </p>
            </div>

            {/* 3D Digital Colombia Interactive Map Component */}
            <div className="w-full">
              <Colombia3DMap
                selectedTerritory={profile.territory}
                onSelectTerritory={(t) => setProfile({ ...profile, territory: t })}
                onProceed={handleProceedToMethodology}
              />
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 2: METODOLOGÍA VCS Y DIAGNÓSTICO                    */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <VcsMethodology
            profile={profile}
            setProfile={setProfile}
            onProceed={handleCompleteMethodology}
            onBackToMap={() => setCurrentStep(1)}
          />
        )}

        {/* ========================================================= */}
        {/* PASO 3: REGISTRO E IDENTIFICACIÓN DEL ALIADO (FORMULARIO) */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <AllyRegistration
            profile={profile}
            setProfile={setProfile}
            onProceed={handleCompleteAllyRegistration}
            onBackToMethodology={() => setCurrentStep(2)}
            onBackToMap={() => setCurrentStep(1)}
          />
        )}

        {/* ========================================================= */}
        {/* PASO 4: RETOS ESTRATÉGICOS Y ASIGNACIÓN DE PRESUPUESTO    */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          selectedChallengeId && TRIANGULATED_CHALLENGES.find(c => c.id === selectedChallengeId) ? (
            <ChallengeDetail
              challenge={TRIANGULATED_CHALLENGES.find(c => c.id === selectedChallengeId)!}
              coins={coins}
              remainingCoins={remainingCoins}
              handleCoinChange={handleCoinChange}
              synergies={synergies}
              handleToggleService={handleToggleService}
              handleOtherServiceTextChange={handleOtherServiceTextChange}
              handleCapacityDetailChange={handleCapacityDetailChange}
              onBackToList={() => {
                setSelectedChallengeId(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onProceedToPacto={handleProceedToPacto}
            />
          ) : (
            <div className="space-y-10" id="step-4-challenges-list">
              
              {/* Breadcrumb Header */}
              <div className="idtf-breadcrumb">
                <span className="idtf-breadcrumb__step">04</span>
                <span className="text-[var(--idtf-text-muted)]">/</span>
                <span className="idtf-breadcrumb__section">{profile.territory}</span>
                <span className="text-[var(--idtf-text-muted)]">/</span>
                <span className="idtf-breadcrumb__current">RETOS ESTRATÉGICOS</span>
              </div>

              {/* Section Header */}
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-white/10 pb-6">
                <div className="idtf-section-header mb-0">
                  <div className="idtf-section-header__number">04</div>
                  <div>
                    <h2 className="idtf-section-header__title">
                      RETOS <span className="accent">ESTRATÉGICOS</span>
                    </h2>
                    <p className="text-sm text-[var(--idtf-text-secondary)] mt-1">
                      Organización: <strong className="text-white">{profile.companyName || "Aliado"}</strong> • {profile.territory}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-mono text-[var(--idtf-naranja)] hover:underline shrink-0"
                >
                  ← Cambiar datos del aliado
                </button>
              </div>

              {/* Rutas de Empleabilidad TIC Hero Banner with Puzzle Graphic */}
              <div className="idtf-card idtf-card--verde p-6 sm:p-8 rounded-[var(--idtf-radius-md)] space-y-6 bg-[var(--idtf-navy-light)] border border-white/10 shadow-xl relative overflow-hidden">
                <div className="space-y-3 relative z-10">
                  <div className="text-xs font-mono uppercase text-[var(--idtf-verde)] font-extrabold tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[var(--idtf-verde)]" />
                    RUTAS DE EMPLEABILIDAD TIC DEL TERRITORIO
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    Retos para fortalecer las Rutas de Empleabilidad TIC del Territorio
                  </h3>

                  <p className="text-sm font-extrabold text-[var(--idtf-naranja)] font-mono flex items-center gap-2">
                    <Puzzle className="w-4 h-4 text-[var(--idtf-naranja)] shrink-0" />
                    Ningún actor tiene todas las piezas; juntos podemos construir la solución
                  </p>

                  <p className="text-xs sm:text-sm text-[var(--idtf-text-secondary)] leading-relaxed max-w-4xl">
                    Convocamos a empresas, gremios e instituciones a cocrear respuestas innovadoras que fortalezcan las rutas de empleabilidad y consoliden un ecosistema continuo de apoyo para las juventudes del territorio.
                  </p>
                </div>

                {/* Single Assembled 8-Piece Puzzle Infographic */}
                <PuzzleInfographic />
              </div>

              {/* Instruction & Budget Status Card */}
              <div className="idtf-card idtf-card--naranja flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border-l-4 border-l-[var(--idtf-naranja)] bg-[var(--idtf-navy-light)] p-6 rounded-[var(--idtf-radius-md)]" id="top-budget-instruction-card">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start text-xs font-mono uppercase text-[var(--idtf-naranja)] font-extrabold tracking-wider">
                    <Coins className="w-4 h-4 text-[var(--idtf-naranja)]" />
                    Asignación Estratégica de Inversión
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white leading-snug">
                    Explora los retos territoriales e invierte tus monedas en las prioridades de tu organización
                  </div>
                  <p className="text-xs text-[var(--idtf-text-secondary)] max-w-xl leading-relaxed">
                    Haz clic en cualquiera de los retos para revisar el diagnóstico detallado, asignar tu presupuesto simbólico y seleccionar los servicios de última milla a aportar.
                  </p>
                </div>

                {remainingCoins === 0 ? (
                  <button
                    type="button"
                    onClick={handleProceedToPacto}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-[var(--idtf-naranja)] to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wide shrink-0 flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                  >
                    Continuar al Pacto
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-[var(--idtf-naranja)]/10 border border-[var(--idtf-naranja)]/40 px-3.5 py-2 rounded-xl text-xs font-mono text-[var(--idtf-naranja)] font-bold shrink-0">
                    <Coins className="w-4 h-4 text-[var(--idtf-naranja)] shrink-0" />
                    <span>Monedas restantes: {remainingCoins} / 10</span>
                  </div>
                )}
              </div>

              {/* Challenge Allocation Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="challenges-grid">
                {filteredChallenges.map((ch) => {
                  const allocated = coins[ch.id] || 0;

                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        setSelectedChallengeId(ch.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="idtf-card idtf-card--verde cursor-pointer hover:scale-[1.01] transition-transform duration-300 flex flex-col justify-between space-y-5 bg-[var(--idtf-navy-light)] p-6 rounded-[var(--idtf-radius-md)] border border-white/10 group shadow-lg"
                    >
                      {/* Image Header */}
                      <div className="relative aspect-16/10 rounded-[var(--idtf-radius-sm)] overflow-hidden bg-[var(--idtf-navy)]">
                        <img 
                          src={ch.image} 
                          alt={ch.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                        
                        <div className="absolute top-3 left-3">
                          <span className="idtf-chip idtf-chip--verde shadow-md">
                            Reto {ch.challengeNumber} • {ch.region}
                          </span>
                        </div>

                        {allocated > 0 && (
                          <div className="absolute top-3 right-3 bg-[var(--idtf-naranja)] text-[var(--idtf-navy)] font-mono text-xs font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            {allocated} Monedas
                          </div>
                        )}
                      </div>

                      {/* Challenge Info */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-extrabold text-white group-hover:text-[var(--idtf-naranja)] transition-colors leading-snug">
                          {ch.title}
                        </h3>
                        <p className="text-xs text-[var(--idtf-text-secondary)] line-clamp-3 leading-relaxed">
                          "{ch.hmw}"
                        </p>
                      </div>

                      {/* Bottom action bar */}
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-mono uppercase text-[var(--idtf-text-secondary)] block font-bold">
                            Inversión actual:
                          </span>
                          <span className="text-base font-bold text-white font-mono">
                            {allocated > 0 ? `${allocated} Monedas` : "Sin monedas"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChallengeId(ch.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="idtf-btn idtf-btn--primary py-2 px-4 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
                        >
                          Ver e Invertir Monedas
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Bottom Proceed CTA */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-full sm:w-auto px-5 py-3 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-xs font-mono transition-all"
                >
                  ← Volver a Datos del Aliado
                </button>

                {remainingCoins === 0 ? (
                  <button
                    type="button"
                    onClick={handleProceedToPacto}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-[var(--idtf-naranja)] to-amber-500 text-slate-950 text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Continuar a la Firma del Pacto por la Conectividad
                    <ArrowRight className="w-5 h-5 text-slate-950" />
                  </button>
                ) : (
                  <div className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[var(--idtf-navy-light)] border border-[var(--idtf-naranja)]/40 text-xs font-mono text-[var(--idtf-naranja)] flex items-center gap-2 justify-center">
                    <Coins className="w-4 h-4 shrink-0" />
                    <span>Invierta las <strong>{remainingCoins}</strong> monedas restantes para continuar a la firma del Pacto</span>
                  </div>
                )}
              </div>

            </div>
          )
        )}

        {/* ========================================================= */}
        {/* PASO 5: FIRMA DEL PACTO E INVITACIÓN (ENVÍO A FIREBASE)    */}
        {/* ========================================================= */}
        {currentStep === 5 && (
          <PactoSignificativo
            profile={profile}
            coins={coins}
            challenges={filteredChallenges}
            onBackToChallenges={() => setCurrentStep(4)}
            onSubmitResponse={handleSubmitPactoResponse}
          />
        )}

      </main>

      {/* IDTF Partner Bar Footer (ONU, UE, OIT, PNUD, Joint SDG Fund) */}
      <footer className="bg-[var(--idtf-navy-light)] border-t border-white/10 py-8 relative z-10" id="app-footer">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="idtf-partner-bar">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--idtf-text-muted)] font-extrabold mr-2">
              Alianza Estratégica
            </span>
            <span className="text-xs font-mono text-[var(--idtf-morado)] font-bold">OIT COLOMBIA</span>
            <div className="idtf-partner-bar__divider" />
            <span className="text-xs font-mono text-[var(--idtf-naranja)] font-bold">UNIÓN EUROPEA</span>
            <div className="idtf-partner-bar__divider" />
            <span className="text-xs font-mono text-[var(--idtf-verde)] font-bold">IDTF · FACILITY</span>
            <div className="idtf-partner-bar__divider" />
            <span className="text-xs font-mono text-white/70 font-semibold">JOINT SDG FUND</span>
          </div>

          <div className="text-center text-xs text-[var(--idtf-text-muted)] font-mono">
            IDTF Facility • Transformación Digital Inclusiva • Caribe &amp; Pacífico Colombiano 2026
          </div>
        </div>
      </footer>

    </div>
  );
}
