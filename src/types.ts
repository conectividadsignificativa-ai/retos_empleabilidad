export type ActorType = 
  | "Empresa de Software / TI"
  | "Gremio / Cámara de Comercio"
  | "Academia / IES"
  | "Entidad Pública"
  | "Cooperación Internacional / ONG"
  | "Otro Actor del Ecosistema";

export type Territory = 
  | "Caribe (Barranquilla, Cartagena, etc.)"
  | "Pacífico (Cali, Pasto, Buenaventura, etc.)";

export type RelevanceLevel = "Muy relevante" | "Parcialmente relevante" | "No relevante";
export type RecognitionLevel = "Sí, 100%" | "Parcialmente" | "No nos identificamos";

export interface ChallengeValidation {
  relevance: RelevanceLevel;
  recognition: RecognitionLevel;
  comment: string;
}

export type CollaborationCategoryId = 
  | "financieros"
  | "acompanamiento"
  | "espacios"
  | "dotacion"
  | "vinculacion"
  | "comunicaciones";

export interface CollaborationCategoryInfo {
  id: CollaborationCategoryId;
  title: string;
  description: string;
}

export type LastMileServiceOption = 
  | "Formación y capacitación"
  | "Certificación y validación de habilidades"
  | "Intermediación laboral y conexión con vacantes"
  | "Mentoría y acompañamiento"
  | "Emprendimiento e innovación"
  | "Bilingüismo"
  | "Investigación, analítica y generación de conocimiento"
  | "Infraestructura, plataformas y tecnología"
  | "Networking y articulación empresarial"
  | "Otro";

export interface ChallengeSynergiesRecord {
  selectedServices: string[];
  otherServiceText: string;
  capacityDetail: string;
  financieros?: string;
  acompanamiento?: string;
  espacios?: string;
  dotacion?: string;
  vinculacion?: string;
  comunicaciones?: string;
}

export type SynergyCategory = 
  | "Financiera (Co-financiamiento / Becas)"
  | "Acompañamiento / Mentoría Senior"
  | "Espacios e Infraestructura Física"
  | "Equipos y Conectividad (Hardware / Nube)"
  | "Vinculación Laboral / Pasantías / Proyectos"
  | "Comunicaciones y Visibilidad / Difusión"
  | "Mapeo Relacional y Ecosistema (Redes)";

export interface ChallengeSynergy {
  categories: SynergyCategory[];
  capacityDetail: string;
  iloSupportNeeded: string;
}

export interface TriangulatedChallengeData {
  id: "Reto A" | "Reto B" | "Reto C" | "Reto D";
  challengeNumber: 1 | 2 | 3 | 4;
  region: "Pacífico" | "Caribe";
  image: string;
  title: string;
  hmw: string;
  painCategory: string;
  painDescription: string;
  leverCategories: string[];
  potentialActors: string[];
  advantages: string[];
  disadvantages: string[];
}

export interface OrganizationProfile {
  companyName: string;
  actorType: ActorType;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  territory: Territory;
}

export interface FullCoDesignSubmission {
  profile: OrganizationProfile;
  validations: Record<string, ChallengeValidation>;
  votes: Record<string, number>; // Must sum to 10 points
  synergies: Record<string, ChallengeSynergy>;
  submittedAt?: string;
}
