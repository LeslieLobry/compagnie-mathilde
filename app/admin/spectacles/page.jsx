// app/admin/spectacles/page.jsx
import prisma from "@/lib/prisma";
import AdminSpectaclesManager from "../../../components/AdminSpectaclesManager/AdminSpectaclesManager";
import AdminBackButton from "@/components/AdminBackButton/AdminBackButton";
export default async function AdminSpectaclesPage() {
  const spectacles = await prisma.spectacle.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <main className="page">
          <AdminBackButton />
      <section className="section">
        <div className="container">
          <h2 className="section-title">Administration — Spectacles</h2>
          <p className="section-lead">
            Ajouter, modifier ou supprimer les spectacles, puis gérer
            leurs photos et dossiers PDF.
          </p>

          <AdminSpectaclesManager initialSpectacles={spectacles} />
        </div>
      </section>
    </main>
  );
}
