// app/admin/medias/page.jsx
import prisma from "@/lib/prisma";
import AdminMediasManager from "../../../components/AdminMediasManager/AdminMediasManager";

export default async function AdminMediasPage() {
  const medias = await prisma.mediaItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <main className="page">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Administration — Médias</h2>
          <p className="section-lead">
            Ajouter, modifier ou supprimer les photos de la page Médias.
          </p>

          <AdminMediasManager initialItems={medias} />
        </div>
      </section>
    </main>
  );
}
