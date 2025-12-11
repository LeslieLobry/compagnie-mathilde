// app/page.jsx
import prisma from "@/lib/prisma";
import Galerie from "../components/Galerie/Galerie";

export default async function HomePage() {
  const [settings, spectacles, galleryPhotos, agendaItems] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.spectacle.findMany({ orderBy: { id: "asc" } }),
    prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.agendaItem.findMany({
      orderBy: { order: "asc" }, // on respecte l’ordre défini en admin
      take: 3, // ✅ seulement les 3 premières
    }),
  ]);

  return (
    <main className="page">
      {/* HERO */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="kicker">Théâtre & cabaret</div>
            <h2 className="title">
              {settings?.heroTitle ||
                "Des récits qui éclairent l'intime, une scène sobre et graphique."}
            </h2>
            {settings?.heroSubtitle && (
              <p className="lead">{settings.heroSubtitle}</p>
            )}
            {settings?.heroText && (
              <p className="lead small">{settings.heroText}</p>
            )}

            <div className="cta">
              <a className="btn primary" href="/spectacles">
                Découvrir les spectacles
              </a>
              <a className="btn ghost" href="/contact">
                Nous contacter
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                className="hero-image"
                src={settings?.heroImage || "/accueil.jpeg"}
                alt="Photo de spectacle Compagnie MATHILDE"
              />
            </div>
          </div>
        </div>
      </header>

      {/* SECTION COMPAGNIE */}
      <section className="section">
        <div className="container about">
          <div className="panel">
            <p>
              La compagnie MATHILDE est implantée à Saint-Pair-Sur-Mer dans la
              Manche. Elle défend les textes de Manon Viel qui, mêlant humour et
              onirisme, interroge nos liens les plus intimes en donnant corps à
              des fictions sensibles et insolentes pour revisitent nos modèles
              relationnels et familiaux. Elle porte une parole théâtrale libre,
              joyeuse et poétique, pour ouvrir de nouveaux imaginaires intimes
              et politiques.
            </p>
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
            <div className="agenda">
              {agendaItems.map((item) => (
                <article key={item.id} className="event">
                  <div className="date">{item.period}</div>
                  <div>
                    <h4 style={{ margin: 0, marginBottom: 4 }}>
                      {item.title}
                    </h4>
                    {item.location && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          color: "#a5b1c2",
                        }}
                      >
                        {item.location}
                      </p>
                    )}
                    {item.description && (
                      <p
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          color: "#cbd5f5",
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
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

          <div className="grid">
            {spectacles.map((s) => (
              <article key={s.id} className="card">
                <div className="card-top" />
                <div className="card-bottom">
                  <h3>{s.title}</h3>
                  {s.subtitle && <div className="chip">{s.subtitle}</div>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIE */}
      <Galerie photos={galleryPhotos} />
    </main>
  );
}
