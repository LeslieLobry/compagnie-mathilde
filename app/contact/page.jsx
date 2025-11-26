// app/contact/page.jsx

export default function ContactPage() {
  return (
    <main className="page">
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">Contact</h2>
          <p className="sub-hero-lead">
            Production, diffusion, presse : entrons en contact.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container cols">
          <form>
            <input type="text" name="nom" placeholder="Nom" required />
            <input type="email" name="email" placeholder="Email" required />
            <textarea
              name="message"
              placeholder="Votre message"
              rows={4}
            />
            <button className="btn primary" type="submit">
              Envoyer
            </button>
          </form>

          <div className="panel">
            <p>
              <strong>Compagnie MATHILDE</strong>
              <br />
              56 rue Jacques-Yves Cousteau
              <br />
              50380 Saint-Pair-sur-Mer
            </p>
            <p>
              <strong>Administration / Production</strong>
              <br />
              Président : Bruno Benoiste-Pilloire
              <br />
              Trésorière : Solene Abboud
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
