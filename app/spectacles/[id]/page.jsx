// app/spectacles/[id]/page.jsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return {};
  const spectacle = await prisma.spectacle.findUnique({ where: { id } });
  if (!spectacle) return {};
  return {
    title: `${spectacle.title} — Compagnie MATHILDE`,
  };
}

export default async function SpectaclePage({ params }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const spectacle = await prisma.spectacle.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!spectacle) notFound();

  return (
    <main className="page">
      {/* HEADER */}
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">{spectacle.title}</h2>
          {spectacle.subtitle && (
            <p className="sub-hero-lead">{spectacle.subtitle}</p>
          )}
        </div>
      </section>

      {/* DESCRIPTION + CREDITS */}
      <section className="section">
        <div className="container about">
          <div className="panel">
            <h4 className="panel-title">La pièce</h4>
            {spectacle.description ? (
              <p>{spectacle.description}</p>
            ) : (
              <p>
                La description détaillée de ce spectacle sera ajoutée
                prochainement.
              </p>
            )}
          </div>

          <div className="panel">
            <h4 className="panel-title">Crédits artistiques</h4>
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

              {spectacle.distribution && (
                <>
                  <dt>Distribution</dt>
                  <dd>{spectacle.distribution}</dd>
                </>
              )}

              {spectacle.autresInfos && (
                <>
                  <dt>Infos complémentaires</dt>
                  <dd>{spectacle.autresInfos}</dd>
                </>
              )}
            </dl>

            {spectacle.dossierPath && (
              <p style={{ marginTop: 18 }}>
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

            <p style={{ marginTop: 16, fontSize: 14 }}>
              Pour un dossier complet, une fiche technique ou une demande de
              diffusion :{" "}
              <a href="/contact" style={{ textDecoration: "underline" }}>
                contacter la Compagnie
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* GALERIE PHOTO */}
      {spectacle.photos && spectacle.photos.length > 0 && (
        <section className="section">
          <div className="container">
            <h3 className="section-title">Galerie photo</h3>
            <p className="section-lead">
              Quelques images issues du spectacle.
            </p>

            <div className="gallery">
              {spectacle.photos.map((p) => (
                <figure key={p.id}>
                  <img
                    src={p.imagePath}
                    alt={p.legend || spectacle.title}
                  />
                  {p.legend && (
                    <figcaption
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#a5b1c2",
                      }}
                    >
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
