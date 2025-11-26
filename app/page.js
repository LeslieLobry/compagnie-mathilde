// app/page.jsx
import prisma from "@/lib/prisma";

export default async function HomePage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const spectacles = await prisma.spectacle.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <main className="page">
      {/* HERO */}
      <header className="hero">
        <img
          className="hero-bg"
          src={settings?.heroImage || "/accueil.jpeg"}
          alt="Photo de spectacle Compagnie MATHILDE"
        />
        <div className="hero-wrap">
          <div className="hero-text">
            <div className="kicker">Théâtre & cabaret</div>
            <h2 className="title">{settings?.heroTitle}</h2>
            <p className="lead">{settings?.heroSubtitle}</p>
            <p className="lead small">{settings?.heroText}</p>
            <div className="cta">
              <a className="btn primary" href="/spectacles">
                Découvrir les spectacles
              </a>
              <a className="btn ghost" href="/contact">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION COMPAGNIE déplacée ici */}
      <section className="section">
        <div className="container about">
          <div className="panel">
            <p>
           La compagnie MATHILDE est implantée à Saint-Pair-Sur-Mer dans la Manche. 
Elle défend les textes de Manon Viel qui, mêlant humour et onirisme, interroge nos liens les plus intimes en donnant corps à des fictions sensibles et insolentes pour revisitent nos modèles relationnels et familiaux. 
Elle porte une parole théâtrale libre, joyeuse et poétique, pour ouvrir de nouveaux imaginaires intimes et politiques. 

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
    </main>
  );
}
