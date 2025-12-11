// app/admin/spectacles/[id]/page.jsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminSpectaclePhotosManager from "../../../../components/AdminSpectaclePhotosManage/AdminSpectaclePhotosManage";
import AdminSpectacleDossierForm from "../../../../components/AdminSpectacleDossierForm";

export default async function AdminSpectaclePage({ params }) {
  // ✅ Next 15 : params est une Promise → on l'await
  const { id } = await params;
  const numId = Number(id);

  if (Number.isNaN(numId)) notFound();

  const spectacle = await prisma.spectacle.findUnique({
    where: { id: numId },
    include: {
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!spectacle) notFound();

  return (
    <main className="page">
      <section className="section">
        <div className="container">
          <h2 className="section-title">
            Administration — {spectacle.title}
          </h2>
          <p className="section-lead">
            Gérer la galerie photo et le dossier PDF de ce spectacle.
          </p>

          <div className="admin-grid">
            <AdminSpectaclePhotosManager
              spectacleId={spectacle.id}
              initialPhotos={spectacle.photos}
            />

            <AdminSpectacleDossierForm
              spectacleId={spectacle.id}
              currentPath={spectacle.dossierPath}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
