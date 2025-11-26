// app/spectacles/page.jsx
import prisma from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Spectacles — Compagnie MATHILDE",
};

export default async function SpectaclesPage() {
  const spectacles = await prisma.spectacle.findMany({
    orderBy: { id: "asc" },
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
          <div className="grid">
            {spectacles.map((s) => (
              <Link
                key={s.id}
                href={`/spectacles/${s.id}`}
                className="card"
              >
                {/* Si un jour tu ajoutes une image d'affiche en BDD, tu pourras la mettre ici */}
                <div className="card-top" />
                <div className="card-bottom">
                  <h3>{s.title}</h3>
                  {s.subtitle && <div className="chip">{s.subtitle}</div>}
                  {s.description && (
                    <p style={{ margin: "0 14px 14px", fontSize: 14 }}>
                      {s.description.slice(0, 180)}
                      {s.description.length > 180 ? "…" : ""}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
