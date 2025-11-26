// app/spectacles/page.jsx
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function SpectaclesPage() {
  const spectacles = await prisma.spectacle.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <main className="page">
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">Spectacles</h2>
          <p className="sub-hero-lead">Sélection de créations.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid">
            {spectacles.map((s) => (
              <Link
                key={s.id}
                href={`/spectacles/${s.id}`}
                className="card" // on garde le style .card
              >
                <div className="card-top" />
                <div className="card-bottom">
                  <h3>{s.title}</h3>
                  {s.subtitle && <div className="chip">{s.subtitle}</div>}
                  {(s.texte || s.mes) && (
                    <div className="meta">
                      {s.texte && <span>Texte : {s.texte}</span>}
                      {s.mes && <span>M.e.s : {s.mes}</span>}
                    </div>
                  )}
                  {s.description && <p>{s.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
