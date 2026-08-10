import { TriangulatedChallengeData, SynergyCategory } from "../types";
import reto1Img from "../assets/images/reto_1_apple_dark_1785839951713.jpg";
import reto2Img from "../assets/images/reto_2_apple_dark_1785839965483.jpg";
import reto3Img from "../assets/images/reto_3_apple_dark_1785839977139.jpg";
import reto4Img from "../assets/images/reto_4_apple_dark_1785839988655.jpg";

export const SYNERGY_CATEGORIES: { id: SynergyCategory; label: string; icon: string; description: string }[] = [
  {
    id: "Financiera (Co-financiamiento / Becas)",
    label: "Financiera",
    icon: "Coins",
    description: "Co-financiamiento de exención de exámenes de certificación, matching grants, bolsas de incentivos o subsidios de transporte."
  },
  {
    id: "Acompañamiento / Mentoría Senior",
    label: "Acompañamiento / Mentoría",
    icon: "Users",
    description: "Horas de mentoría directa de desarrolladores Senior o Project Managers para guiar la inserción laboral y código práctico."
  },
  {
    id: "Espacios e Infraestructura Física",
    label: "Espacios e Infraestructura",
    icon: "Building2",
    description: "Prestación de sedes, laboratorios de computación, salas de innovación o espacios de coworking comunitarios."
  },
  {
    id: "Equipos y Conectividad (Hardware / Nube)",
    label: "Equipos y Conectividad",
    icon: "Laptop",
    description: "Donación o comodato de computadores (min. 16GB RAM), conectividad satelital o licencias en la nube (AWS/Azure/GCP)."
  },
  {
    id: "Vinculación Laboral / Pasantías / Proyectos",
    label: "Vinculación Laboral",
    icon: "Briefcase",
    description: "Disposición de vacantes de primer empleo Junior, pasantías remuneradas o asignación de células de desarrollo tercerizado."
  },
  {
    id: "Comunicaciones y Visibilidad / Difusión",
    label: "Comunicaciones y Visibilidad",
    icon: "Megaphone",
    description: "Difusión institucional, convocatoria masiva en medios/redes, co-organización de hackatones o eventos de empleabilidad."
  },
  {
    id: "Mapeo Relacional y Ecosistema (Redes)",
    label: "Mapeo Relacional y Ecosistema",
    icon: "Share2",
    description: "Apertura de redes de contactos corporativos, vinculación de proveedores, gremios o clientes de la cadena de valor TIC."
  }
];

export const TRIANGULATED_CHALLENGES: TriangulatedChallengeData[] = [
  {
    id: "Reto A",
    challengeNumber: 1,
    region: "Pacífico",
    image: reto1Img,
    title: "Ruta Articulada de Empleabilidad Digital y Capacidades del Ecosistema",
    hmw: "¿Cómo convertir las capacidades existentes del ecosistema del Pacífico en una ruta articulada que conecte de manera efectiva el talento juvenil con oportunidades reales de formación, emprendimiento y empleo digital?",
    painCategory: "Desarticulación del ecosistema y debilidad en redes de conexión entre actores",
    painDescription: "El reto consiste en co-crear un modelo de ruta de empleabilidad digital que, aprovechando la densidad institucional y los servicios de última milla ya existentes en el territorio (vacantes laborales, programas de mentoría, incubación de emprendimientos, certificaciones, prácticas empresariales, espacios físicos, conectividad, laboratorios de innovación y formación especializada), articule la certificación con prácticas en espacios simulados controlados (sandboxes), el reconocimiento de trayectorias alternativas y las redes de mentoría, para conectar a los jóvenes —especialmente a la población en transición hacia el empleo que no estudia ni trabaja— con el mercado laboral. La ruta debe contener, además, módulos adaptables (alfabetización digital básica, conectividad productiva y agrotech) que permitan su implementación en nodos territoriales (Cali, Pasto, etc.) en articulación con los actores locales.",
    leverCategories: [
      "A. Certificación y prácticas en espacios simulados controlados (Sandboxes)",
      "B. Reconocimiento de trayectorias alternativas y redes de mentoría",
      "C. Módulos adaptables (alfabetización digital básica, conectividad productiva y agrotech)"
    ],
    potentialActors: [
      "SENA Pacífico",
      "Cámara de Comercio de Pasto",
      "Gobernación de Nariño (Sec. TIC)",
      "Compromiso Valle",
      "Empresas TIC locales y gremios regionales"
    ],
    advantages: [
      "Aprovecha la densidad institucional y los servicios de última milla ya existentes en el territorio.",
      "Ofrece módulos adaptables para nodos territoriales (Cali, Pasto, etc.) en agrotech y conectividad productiva."
    ],
    disadvantages: [
      "Requiere alta articulación multisectorial entre actores educativos, gubernamentales y privados.",
      "Mantenimiento e infraestructura tecnológica continua para los espacios simulados (Sandboxes)."
    ]
  },
  {
    id: "Reto B",
    challengeNumber: 2,
    region: "Pacífico",
    image: reto2Img,
    title: "Acompañamiento Psicosocial, Mentoría y Referentes Locales",
    hmw: "¿Cómo podríamos diseñar un modelo de acompañamiento psicosocial, mentoría y referentes locales que fortalezca la confianza y motivación de los jóvenes en su tránsito hacia el empleo digital, adaptándose a las realidades de Cali y del resto de la región?",
    painCategory: "Brecha en la formación pertinente, habilidades socioemocionales y acompañamiento integral",
    painDescription: "El reto consiste en diseñar un modelo de acompañamiento psicosocial, mentoría y referentes locales que, en Cali, aborde de manera focalizada el síndrome del impostor y la desmotivación que enfrenta la población de jóvenes en transición hacia el empleo que no estudia ni trabaja, y que, en el resto de la región, se articule con referentes regionales y con procesos de apropiación comunitaria de la conectividad. El modelo debe reconocer que las barreras de acceso al empleo digital no son únicamente técnicas o de oferta, sino también emocionales y simbólicas, y que su superación requiere referentes cercanos, redes de soporte y espacios de acompañamiento sostenidos en el tiempo, ajustados a las particularidades de cada territorio.",
    leverCategories: [
      "A. Acompañamiento psicosocial y superación del síndrome del impostor",
      "B. Redes de soporte y mentoría cercana sostenida",
      "C. Referentes locales e inspiración para la apropiación comunitaria"
    ],
    potentialActors: [
      "Parquesoft Pacífico",
      "Alcaldía de Cali / Secretarías de Juventud",
      "Fundaciones Sociales del Valle y Nariño",
      "Redes de Mentores Locales"
    ],
    advantages: [
      "Aborda las barreras emocionales, simbólicas y de autoexclusión en la juventud.",
      "Fomenta la apropiación comunitaria de la conectividad con referentes inspiradores del territorio."
    ],
    disadvantages: [
      "Exige profesionales y mentores capacitados en facilitación psicosocial comunitaria.",
      "Demanda seguimiento individualizado y cercano en el tiempo."
    ]
  },
  {
    id: "Reto C",
    challengeNumber: 1,
    region: "Caribe",
    image: reto3Img,
    title: "Visibilidad del Talento, Pasaporte de Habilidades y Eliminación de Sesgos",
    hmw: "¿Cómo podríamos conectar a las juventudes del Caribe con el mercado laboral TIC a través de mecanismos que privilegien el talento y el desempeño técnico por encima de sesgos geográficos, étnicos o credencialistas?",
    painCategory: "Desconexión estructural entre el mercado laboral y las juventudes por falta de acceso a redes de oportunidad",
    painDescription: "El reto consiste en diseñar e implementar un ecosistema de “palancas” relacionales y visibilidad del talento que conecte a las juventudes del Caribe con el mercado laboral TIC, eliminando sesgos de contratación —geográficos, étnicos y de títulos— que hoy limitan su acceso a oportunidades reales. Esto implica articular redes de mentoría que tejan vínculos entre el talento joven y el sector productivo, explorar la viabilidad de un Pasaporte de Habilidades que certifique competencias más allá de la trayectoria educativa formal, y avanzar hacia sistemas de selección a ciegas basados en desempeño técnico, junto con otros mecanismos innovadores que ya se están gestando en la región.",
    leverCategories: [
      "A. Pasaporte de Habilidades que certifique competencias más allá del título",
      "B. Selección a ciegas basada en desempeño técnico",
      "C. Redes de mentoría y palancas relacionales con el sector productivo"
    ],
    potentialActors: [
      "Cámaras de Comercio del Caribe (Barranquilla, Cartagena, Santa Marta)",
      "ProBarranquilla",
      "Universidades del Caribe (Uninorte, UTB)",
      "Plataformas de Talento TIC y Gremios Regionales"
    ],
    advantages: [
      "Elimina sesgos de contratación (geográficos, étnicos y credencialistas) mediante desempeño objetivo.",
      "Construye redes de mentoría y palancas relacionales basadas en el talento para los jóvenes del Caribe."
    ],
    disadvantages: [
      "Requiere adopción y cambio cultural en las áreas de selección de talento de las empresas.",
      "Exige estandarización del Pasaporte de Habilidades a nivel regional."
    ]
  },
  {
    id: "Reto D",
    challengeNumber: 2,
    region: "Caribe",
    image: reto4Img,
    title: "Acompañamiento Integral y Certificación de Habilidades Socioemocionales y Digitales",
    hmw: "¿Cómo podríamos estructurar un modelo de acompañamiento integral y certificación de habilidades socioemocionales y digitales que fortalezca la autoconfianza y la resiliencia de los jóvenes del Caribe, reduciendo la autoexclusión y mejorando su desempeño en procesos de selección y entornos laborales?",
    painCategory: "Déficit en el desarrollo de capacidades socioemocionales y digitales, amplificado por desinformación y autoexclusión",
    painDescription: "El reto consiste en estructurar un modelo de acompañamiento integral que combine el fortalecimiento de habilidades socioemocionales con la certificación de competencias digitales, dirigido a los jóvenes del Caribe que enfrentan barreras de autoconfianza al momento de acceder al mercado laboral. El modelo debe abordar la autoexclusión —entendida como la renuncia anticipada a postularse u optar por oportunidades por temor a no ser suficientes— como una barrera tan relevante como las brechas técnicas, y debe traducirse en herramientas concretas de resiliencia y preparación que mejoren el desempeño de los jóvenes tanto en procesos de selección como en su posterior desenvolvimiento en entornos laborales.",
    leverCategories: [
      "A. Fortalecimiento de habilidades socioemocionales críticas (resiliencia, adaptabilidad)",
      "B. Certificación de competencias digitales y socioemocionales",
      "C. Acompañamiento integral pre-empleo y laboral"
    ],
    potentialActors: [
      "OIT / UNFPA / Unión Europea - IDTF Facility",
      "Secretarías de Desarrollo Económico del Caribe",
      "Gremio TIC del Caribe",
      "SENA Regional Caribe"
    ],
    advantages: [
      "Desarrolla autoconfianza, resiliencia y certifica habilidades socioemocionales clave.",
      "Reduce significativamente la autoexclusión y mejora la permanencia en entornos laborales."
    ],
    disadvantages: [
      "Demanda un modelo continuo de seguimiento y coaching socioemocional calificado.",
      "Requiere metodologías de evaluación cualitativas bien estandarizadas."
    ]
  }
];
