// app/medias/page.jsx
import prisma from "@/lib/prisma";
import MediasGallery from "../../components/MediasGallery/MediasGallery";

export default async function MediasPage() {
  const medias = await prisma.mediaItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <main className="page">
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">Médias</h2>
          <p className="sub-hero-lead">
            Photographies de scène et portraits.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {medias.length === 0 ? (
            <p>Aucune photo pour l&apos;instant.</p>
          ) : (
            <MediasGallery medias={medias} />
          )}
        </div>
      </section>
    </main>
  );
}
