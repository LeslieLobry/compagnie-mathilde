// app/page.jsx
import prisma from "@/lib/prisma";

export default async function HomePage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const spectacles = await prisma.spectacle.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <main className="page">
      {/* HERO avec image venant des settings */}
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
