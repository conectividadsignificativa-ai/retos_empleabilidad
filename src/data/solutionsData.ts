export interface Solution {
  id: string;
  region: "pacifico" | "caribe";
  number: number;
  title: string;
  shortSummary: string;
  corporatePain: string;
  lastMileSolution: string;
  coInvestment: string;
  roi: string;
  tags: string[];
}

export const SOLUTIONS_DATA: Solution[] = [
  // ==================== PACÍFICO ====================
  {
    id: "pacifico-terremoto",
    region: "pacifico",
    number: 1,
    title: "Piloto de Respuesta y Recuperación Post-Terremoto – Ventana de Conectividad Significativa",
    shortSummary: "Despliegue de micro-nodos de conectividad y co-working con facilidades de cuidado, incentivos de continuidad de ingresos, brigadas de mapeadores digitales juveniles y credenciales verificables.",
    corporatePain: "Interrupción de la continuidad operativa y de ingresos tras un desastre natural, lo que genera una severa afectación en los medios de vida, empleos e infraestructura productiva de las organizaciones y del talento digital local. Existe además un déficit de información territorial confiable y actualizada sobre las afectaciones, lo que limita la toma de decisiones estratégicas, frena la orientación de inversiones en formación o empleo y dificulta la recuperación económica. Asimismo, se profundizan las brechas de inclusión laboral y se interrumpen las rutas de empleabilidad, afectando especialmente a jóvenes y mujeres con responsabilidades de cuidado.",
    lastMileSolution: "El corazón de la propuesta consiste en el despliegue de micro-nodos de conectividad y co-working ubicados en espacios estratégicos de los aliados, equipados con infraestructura digital y facilidades de cuidado para garantizar la participación activa de los beneficiarios. A partir de esta infraestructura central se estructuran dos líneas de acción principales. La primera línea es el mecanismo de continuidad de ingresos, que otorga un incentivo económico temporal de corto plazo condicionado a la vinculación y colocación laboral efectiva. La segunda línea corresponde a las brigadas de mapeadores digitales juveniles, mediante las cuales personas jóvenes utilizan herramientas tecnológicas para el levantamiento, procesamiento y análisis de datos territoriales de daños. Como elemento transversal a la propuesta central, se implementa la acreditación a través de credenciales digitales verificables que certifican las competencias y la experiencia adquirida durante la atención a la emergencia para integrarlas formalmente en la hoja de vida y consolidar la ruta de empleabilidad.",
    coInvestment: "Aporte conjunto entre actores de cooperación internacional y entidades públicas para la financiación de los incentivos económicos, la coordinación institucional y la facilitación de espacios. Participan cajas de compensación familiar para el reclutamiento, focalización y colocación laboral, junto con el sector privado, gremios tecnológicos y organizaciones especializadas en formación y empleo que aportan capacidades técnicas, herramientas de análisis y oportunidades de vinculación al mercado de trabajo.",
    roi: "Para el sector empresarial representa el acceso directo a talento digital cualificado y validado en campo, permitiendo acelerar la continuidad operativa y la reactivación económica territorial. Para los aliados de gestión del empleo facilita el cumplimiento de metas de inserción laboral efectiva y el fortalecimiento de programas de inclusión social con enfoque de género. Para las autoridades y actores del territorio genera información estratégica y datos precisos para optimizar la inversión de recursos, consolidando además un modelo de respuesta resiliente y replicable ante futuros eventos o crisis.",
    tags: ["Respuesta Post-Desastre", "Micro-nodos Co-working", "Mapeadores Digitales", "Continuidad de Ingresos", "Credenciales Digitales"]
  },
  {
    id: "pacifico-1",
    region: "pacifico",
    number: 2,
    title: "La Palanca Institucionalizada (Red de Micro-conexiones)",
    shortSummary: "Red formal de contactos y micro-conexiones entre cajas de compensación, mentores empresariales e incubadoras territoriales para suplir la falta de 'palanca' en juventudes.",
    corporatePain: "Los procesos tradicionales de selección descartan talento junior por falta de experiencia previa, mientras las empresas invierten recursos excesivos buscando candidatos validados culturalmente.",
    lastMileSolution: "Estructuración de una red formal de contactos que supla la falta de palanca de las juventudes vulnerables. Se integran las micro-conexiones de cajas de compensación y los mentores empresariales sumando las redes de incubación e innovación territorial.",
    coInvestment: "La VCS financia la orquestación logística de los encuentros. Las empresas y redes de incubación aportan horas de sus líderes para mentoría directa y abren sus instalaciones para inmersiones corporativas.",
    roi: "Reducción drástica del costo de reclutamiento al acceder a una cantera de talento pre-filtrada y validada por sus propios ejecutivos.",
    tags: ["Red de Contactos", "Cajas de Compensación", "Mentoría Directa", "Inmersiones Corporativas"]
  },
  {
    id: "pacifico-2",
    region: "pacifico",
    number: 3,
    title: "Pasaporte de Habilidades (Modelo de Formadores de Vanguardia)",
    shortSummary: "Grupo élite de 5 a 7 jóvenes certificados que diseñan sandboxes y currículos locales, formando un cuerpo de pedagogos técnicos para cohortes sucesivas.",
    corporatePain: "Desconfianza en los títulos académicos tradicionales y el alto riesgo financiero que asume la empresa al entrenar talento junior desde cero en herramientas globales sin garantía de éxito o retención.",
    lastMileSolution: "Creación de un Pasaporte de Habilidades a través de un modelo de Formación de Formadores (Transferencia en Cascada). Se identifica a un grupo de vanguardia (5 a 7 jóvenes sobresalientes por tecnología) para que accedan a la certificación inicial. Quienes superen con éxito esta prueba serán contratados y remunerados para diseñar los currículos de refuerzo, simulacros y sandboxes locales dirigidos a las cohortes sucesivas. Esto consolida un cuerpo de pedagogos técnicos de última generación en el territorio, garantizando una actualización constante y pertinente de la formación local.",
    coInvestment: "La VCS financia los exámenes de certificación internacional del grupo de vanguardia inicial y sus honorarios por el diseño de los sandboxes. Una vez creados los simulacros, la segunda línea de estudiantes se prepara sin incurrir en gastos de licencias usando la infraestructura pública. Las empresas asumen entonces el pago de la certificación de esta segunda línea, al tener la garantía de que el talento ya está validado por la vanguardia local.",
    roi: "Las empresas eliminan el riesgo de su inversión en formación. Solo pagan la certificación final del joven de segunda línea tras comprobar, mediante los sandboxes locales, que posee el conocimiento aplicado exacto que su cadena de valor necesita.",
    tags: ["Formadores de Vanguardia", "Sandboxes Locales", "Certificación Internacional", "Pasaporte de Habilidades"]
  },
  {
    id: "pacifico-3",
    region: "pacifico",
    number: 4,
    title: "Formación Dual Digital Híbrida (El Estándar Operativo)",
    shortSummary: "Modelo dual con aliados y empresas co-formadoras desde el día uno, con sostenimiento empresarial, conectividad productiva y acompañamiento psicosocial.",
    corporatePain: "La formación académica produce perfiles desconectados de los flujos de trabajo inmediatos y las herramientas tecnológicas que exige la industria.",
    lastMileSolution: "Posicionar la Formación Dual (liderada institucionalmente por cajas de compensación y organizaciones aliadas) como un estándar visible de la ruta. Este modelo permite alinear las mallas curriculares con el sector productivo, mientras las empresas son co-formadoras desde el primer día.",
    coInvestment: "La empresa asume el pago del estipendio de sostenimiento para el estudiante. La VCS cubre los costos periféricos invisibles: bonos de conectividad productiva y un acompañamiento psicosocial intensivo (con gestión de conocimiento para hacerlo sostenible en el tiempo).",
    roi: "Fidelización temprana del talento y eliminación de la brecha de habilidades, moldeando al joven exactamente a la medida de las herramientas que más utilizan las empresas.",
    tags: ["Formación Dual", "Organizaciones Aliadas", "Empresas Co-formadoras", "Apoyo Psicosocial"]
  },
  {
    id: "pacifico-4",
    region: "pacifico",
    number: 5,
    title: "Laboratorios Juveniles de Innovación Abierta (Fábricas de Soluciones)",
    shortSummary: "Proyectos Capstone aplicados donde jóvenes consultores junior resuelven retos tecnológicos reales de empresas, convirtiendo el laboratorio en un centro de evaluación continuo.",
    corporatePain: "Las empresas requieren resolver necesidades tecnológicas y de digitalización específicas a un precio justo, pero carecen de mecanismos ágiles para identificar talento emergente con experiencia comprobable. En paralelo, los jóvenes egresan sin un portafolio de proyectos reales que valide sus capacidades ante el mercado.",
    lastMileSolution: "Implementación de Proyectos Capstone (desarrollos tecnológicos aplicados como requisito de grado) utilizando infraestructuras como los laboratorios de innovación y puntos de apropiación digital. Las IETDH y entidades TyT adoptan este modelo para conectar a sus estudiantes de último ciclo con el sector productivo. Los jóvenes actúan como consultores junior, resolviendo retos y construyendo un portafolio verificable. Se integra a las organizaciones de trabajadores para impartir módulos de orientación sobre ciudadanía y derechos laborales, preparando a los jóvenes para su transición al mercado formal.",
    coInvestment: "La VCS estructura el marco jurídico de la alianza y orquesta los primeros pilotos. La sostenibilidad a largo plazo se garantiza porque las IETDH/TyT asumen la operación metodológica. Las cámaras de Comercio / gremios apoyan difundiendo el servicio y las empresas fondean la operación pagando un precio justo por la solución tecnológica recibida, recursos que se reinvierten en incentivos para los jóvenes y sostenimiento del laboratorio.",
    roi: "Las empresas obtienen herramientas tecnológicas funcionales a costos competitivos mientras observan a los jóvenes trabajando en vivo. Esto transforma el laboratorio en un Assessment Center continuo, contratando talento directamente para su nómina basándose en resultados reales y no en entrevistas teóricas.",
    tags: ["Proyectos Capstone", "Fábrica de Soluciones", "Assessment Center", "Innovación Abierta"]
  },

  // ==================== CARIBE ====================
  {
    id: "caribe-1",
    region: "caribe",
    number: 1,
    title: "Ecosistema de Intermediación Activa con Comunidades de Talento (La Palanca)",
    shortSummary: "Institucionalización de la palanca empoderando a comunidades tecnológicas y redes juveniles territoriales como curadores primarios de talento TI.",
    corporatePain: "Cuando se acaben las plataformas digitales privadas, el puente se cae o reduce. En la realidad las empresas publican y los prestadores tienen la misión (y los recursos) de proponer candidatos; la plataforma debe ser para los candidatos (sus organizaciones, como developer groups, pioneras Dev o redes mapeadas) y que las empresas (ya que les conviene) se vuelvan su apoyo o palanca.",
    lastMileSolution: "Institucionalizar la \"palanca\" empoderando a comunidades tecnológicas y redes juveniles ya ancladas del territorio como curadores primarios del talento TI. Los nodos juveniles deben ser más de dos en cada territorio, para que compitan y filtren oferta local e inyecten su capital humano en los intermediadores que recogen la demanda empresarial. Las empresas y gremios, lideradas por el clúster de TI de la cámara de comercio del territorio, fortalecen al menos trimestralmente las comunidades y redes juveniles mejorando cada vez más el entendimiento oferta/demanda. Este puente agiliza la selección asegurando jóvenes validados por sus pares y respaldados por el ecosistema.",
    coInvestment: "La VCS invierte capital semilla para fortalecer operativamente a estas comunidades (fomentando la competencia por calidad entre nodos). A cambio, las empresas y gremios (ej. Cámaras de Comercio) se comprometen a realizar inmersiones trimestrales con estas redes para calibrar la oferta con sus necesidades reales.",
    roi: "Las empresas diversifican su base de talento y acceden a perfiles altamente fidelizados, reduciendo los costos y tiempos de los procesos de selección tradicionales.",
    tags: ["Intermediación Activa", "Comunidades de Talento", "Nodos Juveniles", "Inmersiones Trimestrales"]
  },
  {
    id: "caribe-2",
    region: "caribe",
    number: 2,
    title: "Sandbox Bilingüe y Pago por Resultados",
    shortSummary: "Torneos de código a ciegas combinados con formación bilingüe de vanguardia y esquema de pago por resultados al momento de la contratación efectiva.",
    corporatePain: "Candidatos con excelentes capacidades técnicas son descartados por deficiencias en inglés, lo que obliga a la empresa a asumir el alto costo y riesgo de formarlos internamente en un segundo idioma.",
    lastMileSolution: "Implementación de torneos de código a ciegas combinados con un modelo de vanguardia. Se identifica a un grupo élite de jóvenes formados técnicamente. Este grupo accede al programa de empleabilidad basado en resultados de experiencias actuales. Una vez certificados, estos jóvenes diseñan instrumentos de refuerzo y simulacros bilingües para las siguientes cohortes, generando capacidad instalada en el territorio.",
    coInvestment: "La VCS financia las certificaciones iniciales del grupo de vanguardia. Aliados aportan su programa bilingüe bajo la modalidad de pago por resultados. Las empresas asumen el pago de la certificación de la segunda línea de estudiantes solo cuando deciden contratarlos.",
    roi: "La empresa contrata talento tecnológico bilingüe validado en la práctica, eliminando el riesgo financiero de invertir en capacitaciones de idioma que no garantizan resultados técnicos.",
    tags: ["Torneos de Código a Ciegas", "Bilingüismo", "Pago por Resultados", "Validación Práctica"]
  },
  {
    id: "caribe-3",
    region: "caribe",
    number: 3,
    title: "Acompañamiento Integral y Retención Condicionada (Pago por Resultados)",
    shortSummary: "Malla de contención con apoyos de supervivencia, Zonas Seguras Empresariales y esquema de pago por resultados a más de un año de permanencia.",
    corporatePain: "Alta deserción de perfiles junior durante los primeros 90 días de vinculación por baja tolerancia a la frustración y falta de adaptación a la cultura corporativa.",
    lastMileSolution: "Con los actores y servicios identificados en el territorio es posible consolidar una malla de contención en dos frentes. Primero, asegurar apoyos de supervivencia (estipendios/conectividad) para evitar la autoexclusión. Segundo, integrar metodologías socioemocionales certificadas (aportadas por universidades o centros certificados en calidad) con modelos de empleabilidad de fundaciones corporativas ancla. Esto se complementa con la creación de Zonas Seguras Empresariales: espacios de diálogo guiados donde el talento gestiona sus miedos y brechas de adaptación.",
    coInvestment: "La VCS mitiga el riesgo inicial cubriendo los apoyos de subsistencia juvenil y el desarrollo de un Sistema de Alerta Temprana de deserción. La academia y fundaciones operan bajo un esquema de Pago por Resultados, cobrando su éxito solo si el joven permanece empleado más de un año. Las empresas co-invierten asignando un Padrino Técnico interno que actúa como guía cultural en la oficina, apoyado por la contención profesional de las fundaciones aliadas.",
    roi: "Las empresas reciben perfiles tecnológicos blindados emocionalmente, disminuyendo drásticamente la pérdida de capital, tiempo y curva de aprendizaje que generan los abandonos tempranos (fuga de talento).",
    tags: ["Contención Socioemocional", "Zonas Seguras Empresariales", "Pago por Resultados", "Padrino Técnico"]
  },
  {
    id: "caribe-4",
    region: "caribe",
    number: 4,
    title: "Semilleros Corporativos Inmersivos (Pacto por el Empleo)",
    shortSummary: "Pacto por el Empleo con semilleros inmersivos y alianzas previas con empresas para estudiar dentro del entorno corporativo real desde el día uno.",
    corporatePain: "Las empresas manifiestan que la academia forma perfiles desconectados de sus necesidades reales (desfase sectorial). A su vez, los jóvenes sufren de autoexclusión o sienten que no es para ellos porque desconocen los entornos corporativos por fuera de sus realidades barriales.",
    lastMileSolution: "Consolidar un \"Pacto por el Empleo\" basado en la creación de Semilleros Inmersivos a corto plazo. Se implementa una formación clusterizada (agrupando el talento en familias de ocupaciones según las vocaciones del territorio). La disrupción radica en suscribir alianzas con las empresas previos a la ruta. Esto permite habilitar espacios para que los jóvenes estudien y se acerquen a la empresa desde el día uno, conociendo el entorno corporativo real antes de finalizar su formación o entrenamiento (nuevas habilidades o escalamiento de las mismas).",
    coInvestment: "La VCS financia la orquestación inicial de los clústeres formativos. Las universidades y centros de formación técnica aportan el rigor metodológico y el cuerpo docente. Las empresas co-invierten cediendo sus instalaciones, infraestructura tecnológica y horas de sus especialistas, logrando que el semillero se alimente del entorno de trabajo.",
    roi: "Las empresas moldean su fuerza laboral a la medida exacta de su sector productivo desde el primer día del entrenamiento o formación, mientras los jóvenes rompen la barrera del síndrome del impostor, garantizando una transición fluida y sin traumas hacia la contratación formal.",
    tags: ["Pacto por el Empleo", "Semilleros Inmersivos", "Formación Clusterizada", "Transición Sin Traumas"]
  }
];
