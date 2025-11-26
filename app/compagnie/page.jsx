// app/compagnie/page.jsx

export default function CompagniePage() {
  return (
    <main className="page">
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">Compagnie</h2>
          <p className="sub-hero-lead">
            Une écriture et une scène sobres, centrées sur le jeu et la
            lumière.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about">
          <div className="panel">
            <p>
              La Compagnie MATHILDE développe des formes sobres et graphiques,
              centrées sur le jeu et la lumière. Les créations explorent des
              récits de transmission, où l&apos;humour dialogue avec la
              gravité. (Ici, tu pourras coller ton texte d&apos;intention
              complet.)
            </p>
          </div>
          <div className="panel">
            <h4 className="panel-title">Mentions légales</h4>
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
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}
