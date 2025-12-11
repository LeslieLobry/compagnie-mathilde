// app/spectacles/page.jsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import "./css.css"
export const metadata = {
  title: "Spectacles — Compagnie MATHILDE",
};

export default async function SpectaclesPage() {
  const spectacles = await prisma.spectacle.findMany({
    orderBy: { id: "asc" },
    include: {
      photos: {
        orderBy: [
          { order: "asc" }, // on respecte l'ordre défini dans l'admin
          { id: "asc" },    // fallback
        ],
        take: 1, // ✅ uniquement la première photo
      },
    },
  });

  return (
    <main className="page">
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">Spectacles</h2>
          <p className="sub-hero-lead">
            Découvrez les créations de la Compagnie MATHILDE.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid spectacles-grid">
            {spectacles.map((s) => {
              const firstPhoto = s.photos?.[0];
              const posterUrl = firstPhoto?.imagePath || null;

              return (
                <Link
                  key={s.id}
                  href={`/spectacles/${s.id}`}
                  className="card spectacle-card"
                >
                  {/* IMAGE / PLACEHOLDER */}
                  <div className="card-top spectacle-card-top">
                    {posterUrl ? (
                      <div className="spectacle-card-media">
                        <Image
                          src={posterUrl}
                          alt={firstPhoto?.legend || s.title}
                          fill
                          className="spectacle-card-img"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="spectacle-card-placeholder">
                        <span>Visuel à venir</span>
                      </div>
                    )}
                  </div>

                  {/* TEXTE */}
                  <div className="card-bottom spectacle-card-bottom">
                    <h3>{s.title}</h3>
                    {s.subtitle && <div className="chip">{s.subtitle}</div>}

                    {s.description && (
                      <p className="spectacle-card-excerpt">
                        {s.description.slice(0, 180)}
                        {s.description.length > 180 ? "…" : ""}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
