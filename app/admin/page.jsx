// app/admin/page.jsx
import prisma from "@/lib/prisma";
import AdminSettingsForm from "../../components/AdminSettingsForm/AdminSettingsForm";
import Link from "next/link";

export default async function AdminHomePage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
  });

  return (
    <main className="page">
      <section className="section">
        <div className="container">
          {/* HEADER DU TABLEAU DE BORD */}
          <h2 className="section-title">Tableau de bord — Administration</h2>
          <p className="section-lead">
            Gérez toutes les sections du site depuis cet espace.
          </p>

          {/* LIENS RAPIDES */}
          <div className="admin-links">
            <Link href="/admin/spectacles" className="admin-card">
              <h3>Spectacles</h3>
              <p>Ajouter / modifier les spectacles.</p>
            </Link>

            <Link href="/admin/agenda" className="admin-card">
              <h3>Agenda</h3>
              <p>Gérer les dates de tournée et événements.</p>
            </Link>

            <Link href="/admin/medias" className="admin-card">
              <h3>Médias</h3>
              <p>Ajouter des photos, légendes, crédits.</p>
            </Link>

            <div className="admin-card admin-card--current">
              <h3>Settings — Accueil</h3>
              <p>Modifier le Hero et les textes principaux.</p>
            </div>
          </div>

          {/* FORMULAIRE DES SETTINGS */}
          <h3 style={{ marginTop: "40px" }}>Contenu de la page d’accueil</h3>
          <AdminSettingsForm settings={settings} />
        </div>
      </section>
    </main>
  );
}
