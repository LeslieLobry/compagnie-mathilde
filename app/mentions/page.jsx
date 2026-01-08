export const metadata = {
  title: "Mentions légales | Compagnie MATHILDE",
};

export default function MentionsLegalesPage() {
  return (
    <main className="page">
      <section className="section">
        <div className="container legal">
          <h1>Mentions légales</h1>

          <p>
            Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004
            pour la confiance dans l’économie numérique, il est précisé aux
            utilisateurs du site l’identité des différents intervenants dans
            le cadre de sa réalisation et de son suivi.
          </p>

          <h2>Éditeur du site</h2>
          <p>
            <strong>Compagnie MATHILDE</strong><br />
            Compagnie artistique / de spectacle vivant<br /><br />
            Responsable de la publication : [Nom Prénom]<br />
            Email : [email@compagnie.fr]<br />
            Statut juridique : Association loi 1901<br />
            Numéro SIRET / RNA : [à renseigner]
          </p>

          <h2>Hébergement</h2>
          <p>
            Vercel Inc.<br />
            440 N Barranca Ave #4133<br />
            Covina, CA 91723 – États-Unis<br />
            https://vercel.com
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L’ensemble des contenus présents sur ce site est protégé par le
            droit d’auteur. Toute reproduction est interdite sans autorisation
            préalable.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Conformément au RGPD, vous disposez d’un droit d’accès, de
            rectification et de suppression de vos données personnelles.
            Pour toute demande, contactez : [email@compagnie.fr]
          </p>

          <h2>Cookies</h2>
          <p>
            Le site peut utiliser des cookies nécessaires à son bon
            fonctionnement ou à des fins statistiques.
          </p>
        </div>
      </section>
    </main>
  );
}
