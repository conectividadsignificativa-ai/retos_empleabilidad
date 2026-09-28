// Script to seed 1 test comment and 1 like for each of the 9 solutions
// Using strictly fictitious organization names and anonymous user identifiers (Anónimo 1, Anónimo 2, etc.)

async function seedAll() {
  const BASE_URL = "http://localhost:3000";

  // 1. Reset first to ensure a pristine state
  console.log("Resetting database to 0...");
  const resetRes = await fetch(`${BASE_URL}/api/admin/reset-data`, { method: "POST" });
  console.log("Reset response:", await resetRes.json());

  // 2. Define the test data with strictly fictitious organizations and anonymous authors
  const testItems = [
    {
      solutionId: "pacifico-terremoto",
      evaluator: {
        name: "Anónimo 1",
        email: "anonimo1@ficticio.org",
        org: "Organización Ficticia 1",
        role: "Evaluador Técnico 1"
      },
      comment: "Excelente iniciativa para resiliencia territorial y respuesta post-desastre con micro-nodos y mapeadores digitales juveniles."
    },
    {
      solutionId: "pacifico-1",
      evaluator: {
        name: "Anónimo 2",
        email: "anonimo2@ficticio.org",
        org: "Organización Ficticia 2",
        role: "Evaluador Técnico 2"
      },
      comment: "La red de micro-conexiones formaliza el relacionamiento que hoy falta para los jóvenes de la región, facilitando el acceso a vacantes sin sesgos de reclutamiento."
    },
    {
      solutionId: "pacifico-2",
      evaluator: {
        name: "Anónimo 3",
        email: "anonimo3@ficticio.org",
        org: "Organización Ficticia 3",
        role: "Evaluador Técnico 3"
      },
      comment: "El modelo de formadores de vanguardia reduce la brecha de certificación y genera capacidad instalada técnica directamente en el territorio."
    },
    {
      solutionId: "pacifico-3",
      evaluator: {
        name: "Anónimo 4",
        email: "anonimo4@ficticio.org",
        org: "Organización Ficticia 4",
        role: "Evaluador Técnico 4"
      },
      comment: "La formación dual garantiza inserción laboral directa con sostenimiento empresarial y acompañamiento socioemocional pertinente."
    },
    {
      solutionId: "pacifico-4",
      evaluator: {
        name: "Anónimo 5",
        email: "anonimo5@ficticio.org",
        org: "Organización Ficticia 5",
        role: "Evaluador Técnico 5"
      },
      comment: "Los retos capstone con metodología de assessment center permiten a las empresas medir competencias blandas y técnicas en condiciones reales de trabajo."
    },
    {
      solutionId: "caribe-1",
      evaluator: {
        name: "Anónimo 6",
        email: "anonimo6@ficticio.org",
        org: "Organización Ficticia 6",
        role: "Evaluador Técnico 6"
      },
      comment: "La intermediación activa con enfoque territorial es fundamental para conectar vacantes de la industria con el talento de barrios periféricos."
    },
    {
      solutionId: "caribe-2",
      evaluator: {
        name: "Anónimo 7",
        email: "anonimo7@ficticio.org",
        org: "Organización Ficticia 7",
        role: "Evaluador Técnico 7"
      },
      comment: "Los torneos de código a ciegas y el modelo de pago por resultados aseguran validación práctica objetiva y derriban barreras de bilingüismo técnico."
    },
    {
      solutionId: "caribe-3",
      evaluator: {
        name: "Anónimo 8",
        email: "anonimo8@ficticio.org",
        org: "Organización Ficticia 8",
        role: "Evaluador Técnico 8"
      },
      comment: "La contención socioemocional durante los primeros 90 días protege la inversión de las empresas y minimiza la deserción temprana."
    },
    {
      solutionId: "caribe-4",
      evaluator: {
        name: "Anónimo 9",
        email: "anonimo9@ficticio.org",
        org: "Organización Ficticia 9",
        role: "Evaluador Técnico 9"
      },
      comment: "Los semilleros inmersivos y el pacto por el empleo rompen el síndrome del impostor y consolidan clústeres formativos de alta retención."
    }
  ];

  for (const item of testItems) {
    console.log(`\n--- Registrando datos de prueba: ${item.evaluator.name} (${item.evaluator.org}) para ${item.solutionId} ---`);

    // 1. Registrar usuario anónimo
    const regRes = await fetch(`${BASE_URL}/api/register-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: item.evaluator.name,
        email: item.evaluator.email,
        organization: item.evaluator.org,
        role: item.evaluator.role
      })
    });
    console.log(`Usuario registrado (${item.evaluator.name}):`, regRes.status);

    // 2. Registrar Like
    const likeRes = await fetch(`${BASE_URL}/api/solutions/${item.solutionId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: item.evaluator.email,
        userName: item.evaluator.name,
        userOrg: item.evaluator.org
      })
    });
    const likeData = await likeRes.json();
    console.log(`Like registrado para ${item.solutionId}:`, likeData);

    // 3. Registrar Comentario de prueba
    const commentRes = await fetch(`${BASE_URL}/api/solutions/${item.solutionId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: item.evaluator.name,
        authorEmail: item.evaluator.email,
        authorOrg: item.evaluator.org,
        text: item.comment
      })
    });
    const commentData = await commentRes.json();
    console.log(`Comentario registrado para ${item.solutionId}:`, commentData.success, commentData.comment?.text?.slice(0, 40) + "...");
  }

  // 3. Verificar estado final
  console.log("\n================ VERIFICACIÓN FINAL ================");
  const repRes = await fetch(`${BASE_URL}/api/admin/reports`);
  const report = await repRes.json();
  console.log("Resumen del reporte:");
  console.log(`Total Votos: ${report.summary.totalVotes}`);
  console.log(`Total Comentarios: ${report.summary.totalComments}`);
  console.log(`Votantes Únicos: ${report.summary.uniqueVoters}`);
  console.log(`Organizaciones Únicas: ${report.summary.uniqueOrganizations}`);
  console.log(`Votos Pacífico: ${report.summary.pacificoVotes}`);
  console.log(`Votos Caribe: ${report.summary.caribeVotes}`);
  console.log("\nMétricas por Solución:");
  report.metrics.forEach((m: any) => {
    console.log(`- [#${m.rank}] [${m.region.toUpperCase()}] ${m.solutionId}: ${m.votesCount} voto(s), ${m.commentsCount} comentario(s) | Org: ${m.organizations.join(", ")} | Autor: ${m.recentComments?.[0]?.authorName}`);
  });
}

seedAll().catch(console.error);
