// app/page.jsx
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Galerie from "../components/Galerie/Galerie";

export default async function HomePage() {
  const [settings, spectacles, galleryPhotos, agendaItems] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.spectacle.findMany({
      orderBy: { id: "asc" },
      include: {
        photos: {
          orderBy: [
            { order: "asc" },
            { id: "asc" },
          ],
          take: 1, // ✅ 1ère photo pour la carte
        },
      },
    }),
    prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.agendaItem.findMany({
      orderBy: { order: "asc" }, // on respecte l’ordre défini en admin
      take: 3, // ✅ seulement les 3 premières
    }),
  ]);

  const heroImage = settings?.heroImage || "/accueil.jpeg";

  return (
    <main className="page">
      {/* HERO FULL-WIDTH */}
      <header className="hero hero-full">
        {/* image de fond pleine largeur */}
        <div className="hero-bg">
          <Image
            src={heroImage}
            alt={
              settings?.heroAlt || "Photo de spectacle Compagnie MATHILDE"
            }
            fill
            priority
            sizes="100vw"
            className="hero-bg-image"
          />
        </div>

        {/* voile sombre / gradient */}
        <div className="hero-overlay" />

        {/* contenu par-dessus */}
        <div className="hero-content">
          <div className="hero-inner">
            <div className="hero-text">
              <div className="kicker">Théâtre &amp; cabaret</div>

              <h2 className="title hero-title">
                {settings?.heroTitle ||
                  "Des récits qui éclairent l'intime, une scène sobre et graphique."}
              </h2>

              {settings?.heroSubtitle && (
                <p className="lead hero-lead">{settings.heroSubtitle}</p>
              )}

              {settings?.heroText && (
                <p className="lead small hero-lead">{settings.heroText}</p>
              )}

              <div className="cta hero-actions">
                <a className="btn primary" href="/spectacles">
                  Découvrir les spectacles
                </a>
                <a className="btn ghost" href="/contact">
                  Nous contacter
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION COMPAGNIE */}
      <section className="section">
        <div className="container about">
          <div className="panel-text">
            {settings?.aboutText ? (
              // ✅ On découpe sur les retours à la ligne pour faire plusieurs <p>
              settings.aboutText.split("\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))
            ) : (
              <p>
                La compagnie MATHILDE est implantée à Saint-Pair-Sur-Mer dans la
                Manche. Elle défend les textes de Manon Viel qui, mêlant humour
                et onirisme, interroge nos liens les plus intimes en donnant
                corps à des fictions sensibles et insolentes pour revisitent nos
                modèles relationnels et familiaux. Elle porte une parole
                théâtrale libre, joyeuse et poétique, pour ouvrir de nouveaux
                imaginaires intimes et politiques.
              </p>
            )}
          </div>

          <div className="panel">
            <h4 className="panel-title">informations</h4>
            <dl>
              <dt>Association</dt>
              <dd>Compagnie MATHILDE</dd>
              <dt>Adresse</dt>
              <dd>
                56 rue Jacques-Yves Cousteau
                <br />
                50380 Saint-Pair-sur-Mer
              </dd>
              <dt>Président</dt>
              <dd>Bruno Benoiste-Pilloire</dd>
              <dt>Trésorière</dt>
              <dd>Solene Abboud</dd>
              <dt>Contact</dt>
              <dd>compagniemathilde@gmail.com</dd>
            </dl>
          </div>
        </div>
      </section>

      {/* AGENDA (3 prochaines dates) */}
      <section className="section">
        <div className="container">
          <h3 className="section-title">Agenda</h3>
          <p className="section-lead">
            Les prochaines dates de la Compagnie MATHILDE.
          </p>

          {agendaItems.length === 0 ? (
            <p>Aucune date annoncée pour le moment.</p>
          ) : (
            <div className="home-agenda">
              {agendaItems.map((item) => (
                <article key={item.id} className="event-card">
                  <div className="event-card-date">
                    <span className="event-date-label">{item.period}</span>
                  </div>

                  <div className="event-card-main">
                    <h4 className="event-title">{item.title}</h4>

                    {item.location && (
                      <p className="event-location">{item.location}</p>
                    )}

                    {item.description && (
                      <p className="event-description">{item.description}</p>
                    )}

                    {(item.link || item.imageUrl) && (
                      <div className="event-meta-row">
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn tiny"
                          >
                            Billetterie
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {item.imageUrl && (
                    <div className="event-thumb">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={110}
                        height={72}
                        className="event-thumb-img"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          <div className="section-footer">
            <a href="/agenda" className="btn ghost">
              Voir tout l&apos;agenda
            </a>
          </div>
        </div>
      </section>

      {/* teaser Spectacles */}
      <section className="section">
        <div className="container">
          <h3 className="section-title">Spectacles</h3>
          <p className="section-lead">
            Découvrez les créations de la Compagnie MATHILDE.
          </p>

          <div className="home-spectacles-grid">
            {spectacles.map((s) => {
              const firstPhoto = s.photos?.[0];
              const posterUrl = firstPhoto?.imagePath || null;

              return (
                <Link
                  key={s.id}
                  href={`/spectacles/${s.id}`}
                  className="home-spectacle-card"
                >
                  <div className="home-spectacle-thumb">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={firstPhoto?.legend || s.title}
                        width={400}
                        height={260}
                        className="home-spectacle-img"
                      />
                    ) : (
                      <div className="home-spectacle-placeholder">
                        Visuel à venir
                      </div>
                    )}
                  </div>

                  <div className="home-spectacle-body">
                    <h4 className="home-spectacle-title">{s.title}</h4>
                    {s.subtitle && (
                      <p className="home-spectacle-subtitle">
                        {s.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="section-footer">
            <a href="/spectacles" className="btn ghost">
              Voir tous les spectacles
            </a>
          </div>
        </div>
      </section>


      {/* GALERIE */}
      <Galerie photos={galleryPhotos} />
    </main>
  );
}
