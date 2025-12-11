// app/admin/galerie/page.jsx
import prisma from "@/lib/prisma";
import AdminGalleryManager from "../../../components/AdminGalleryManager/AdminGalleryManager";
import AdminBackButton from "@/components/AdminBackButton/AdminBackButton";
export default async function AdminGaleriePage() {
  const photos = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page">
          <AdminBackButton />
    
      <section className="section">
        <div className="container">
          <h2 className="section-title">Administration — Galerie</h2>
          <p className="section-lead">
            Ajouter, modifier ou supprimer les photos de la galerie.
          </p>

          <AdminGalleryManager initialPhotos={photos} />
        </div>
      </section>
    </main>
  );
}
