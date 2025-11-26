// app/presse/page.jsx

export default function PressePage() {
  return (
    <main className="page">
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">Presse</h2>
          <p className="sub-hero-lead">
            Citations, articles et dossiers à télécharger.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container press">
          <blockquote>
            « Une écriture qui fait dialoguer humour et gravité. » —{" "}
            <em>Nom du média</em>
          </blockquote>

          <div className="panel">
            <strong>Dossiers &amp; visuels</strong>
            <ul>
              <li>
                <a href="#">Dossier artistique (PDF)</a>
              </li>
              <li>
                <a href="#">Visuels HD (ZIP)</a>
              </li>
            </ul>
            <p>Liens à compléter avec vos fichiers.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
