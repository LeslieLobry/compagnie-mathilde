// app/spectacles/[id]/page.jsx
import './spectacles.css'
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

/**
 * Metadata dynamique pour chaque spectacle
 */
export async function generateMetadata({ params }) {
  const { id } = await params; // Next 15 : params est une Promise
  const numId = Number(id);

  if (Number.isNaN(numId)) return {};

  const spectacle = await prisma.spectacle.findUnique({
    where: { id: numId },
  });

  if (!spectacle) return {};

  return {
    title: `${spectacle.title} — Compagnie MATHILDE`,
  };
}

/**
 * Page spectacle
 */
export default async function SpectaclePage({ params }) {
  const { id } = await params; // Next 15 : params est une Promise
  const numId = Number(id);

  if (Number.isNaN(numId)) {
    notFound();
  }

  const spectacle = await prisma.spectacle.findUnique({
    where: { id: numId },
    include: {
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!spectacle) {
    notFound();
  }

  const heroPhoto =
    spectacle.photos && spectacle.photos.length > 0
      ? spectacle.photos[0]
      : null;

  return (
    <main className="page spectacle-page">
      {/* HERO en 2 colonnes : texte + image */}
      <section className="spectacle-hero">
        <div className="container spectacle-hero-inner">
          <div className="spectacle-hero-text">
            <span className="spectacle-kicker">Spectacle</span>
            <h1 className="spectacle-title">{spectacle.title}</h1>

            {spectacle.subtitle && (
              <p className="spectacle-subtitle">{spectacle.subtitle}</p>
            )}

            <div className="spectacle-hero-meta">
              {spectacle.texte && (
                <span className="spectacle-pill">
                  Texte&nbsp;: <strong>{spectacle.texte}</strong>
                </span>
              )}

              {spectacle.mes && (
                <span className="spectacle-pill">
                  Mise en scène&nbsp;: <strong>{spectacle.mes}</strong>
                </span>
              )}
            </div>
          </div>

          {heroPhoto && (
            <div className="spectacle-hero-image">
              <img
                src={heroPhoto.imagePath}
                alt={heroPhoto.legend || spectacle.title}
              />
            </div>
          )}
        </div>
      </section>

      {/* DESCRIPTION + CRÉDITS */}
      <section className="section spectacle-content">
        <div className="container spectacle-layout">
          {/* La pièce */}
          <div className="panel spectacle-story">
            <h2 className="panel-title">La pièce</h2>
            {spectacle.description ? (
              <p className="spectacle-text">{spectacle.description}</p>
            ) : (
              <p className="spectacle-text">
                La description détaillée de ce spectacle sera ajoutée
                prochainement.
              </p>
            )}
          </div>

          {/* Crédits */}
          <aside className="panel spectacle-credits">
            <h2 className="panel-title">Crédits artistiques</h2>

            <dl className="credits-list">
              {spectacle.texte && (
                <div className="credits-row">
                  <dt>Texte</dt>
                  <dd>{spectacle.texte}</dd>
                </div>
              )}

              {spectacle.mes && (
                <div className="credits-row">
                  <dt>Mise en scène</dt>
                  <dd>{spectacle.mes}</dd>
                </div>
              )}

              {spectacle.distribution && (
                <div className="credits-row">
                  <dt>Distribution</dt>
                  <dd>{spectacle.distribution}</dd>
                </div>
              )}

              {spectacle.autresInfos && (
                <div className="credits-row">
                  <dt>Infos complémentaires</dt>
                  <dd>{spectacle.autresInfos}</dd>
                </div>
              )}
            </dl>

            {spectacle.dossierPath && (
              <p className="spectacle-dossier">
                <a
                  href={spectacle.dossierPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn ghost"
                >
                  Télécharger le dossier (PDF)
                </a>
              </p>
            )}

            <p className="spectacle-contact">
              Pour un dossier complet, une fiche technique ou une demande de
              diffusion :{" "}
              <a href="/contact" className="spectacle-contact-link">
                contacter la Compagnie
              </a>
              .
            </p>
          </aside>
        </div>
      </section>

      {/* GALERIE PHOTO */}
      {spectacle.photos && spectacle.photos.length > 0 && (
        <section className="section spectacle-gallery">
          <div className="container">
            <div className="spectacle-gallery-header">
              <h2 className="section-title">Galerie photo</h2>
              <p className="section-lead">
                Quelques images issues du spectacle.
              </p>
            </div>

            <div className="spectacle-gallery-grid">
              {spectacle.photos.map((p) => (
                <figure key={p.id} className="spectacle-gallery-item">
                  <div className="spectacle-gallery-image-wrapper">
                    <img
                      src={p.imagePath}
                      alt={p.legend || spectacle.title}
                    />
                  </div>
                  {p.legend && (
                    <figcaption className="spectacle-caption">
                      {p.legend}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
