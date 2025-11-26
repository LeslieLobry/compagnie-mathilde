// app/spectacles/[id]/page.jsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

// (optionnel) SEO dynamique
export async function generateMetadata({ params }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return {};

  const spectacle = await prisma.spectacle.findUnique({
    where: { id },
  });

  if (!spectacle) return {};

  return {
    title: `${spectacle.title} — Compagnie MATHILDE`,
    description: spectacle.description || "Spectacle de la Compagnie MATHILDE",
  };
}

export default async function SpectacleDetailPage({ params }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    notFound();
  }

  const spectacle = await prisma.spectacle.findUnique({
    where: { id },
  });

  if (!spectacle) {
    notFound();
  }

  return (
    <main className="page">
      {/* Bandeau haut */}
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">{spectacle.title}</h2>
          {spectacle.subtitle && (
            <p className="sub-hero-lead">{spectacle.subtitle}</p>
          )}
        </div>
      </section>

      {/* Contenu détaillé */}
      <section className="section">
        <div className="container">
          <div className="about">
            {/* Colonne texte principal */}
            <div className="panel">
              <h4 className="panel-title">Présentation</h4>
              {spectacle.description ? (
                <p>{spectacle.description}</p>
              ) : (
                <p>
                  La description détaillée de ce spectacle sera ajoutée
                  prochainement.
                </p>
              )}
            </div>

            {/* Colonne fiche technique / crédits */}
            <div className="panel">
              <h4 className="panel-title">Crédits & fiche</h4>
              <dl>
                {spectacle.texte && (
                  <>
                    <dt>Texte</dt>
                    <dd>{spectacle.texte}</dd>
                  </>
                )}
                {spectacle.mes && (
                  <>
                    <dt>Mise en scène</dt>
                    <dd>{spectacle.mes}</dd>
                  </>
                )}
                {/* Tu pourras plus tard ajouter d'autres champs en base :
                    distribution, création lumière, production, partenaires... */}
              </dl>

              <p style={{ marginTop: 16, fontSize: 14 }}>
                Pour toute demande (diffusion, dossier complet, fiche technique
                détaillée) : utilisez la page{" "}
                <a href="/contact" style={{ textDecoration: "underline" }}>
                  Contact
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
