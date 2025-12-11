// app/agenda/page.jsx
import prisma from "@/lib/prisma";
import "./agenda.css"
export default async function AgendaPage() {
  const items = await prisma.agendaItem.findMany({
    orderBy: [
      { order: "asc" },
      { id: "asc" },
    ],
  });

  return (
    <main className="page">
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">Agenda</h2>
          <p className="sub-hero-lead">Dates de tournée et de création.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <p>Aucune date renseignée pour l&apos;instant.</p>
          ) : (
            <div className="agenda-grid">
              {items.map((item) => (
                <article key={item.id} className="agenda-card">
                  <div className="agenda-card-image-wrapper">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="agenda-card-image"
                      />
                    )}

                    {/* overlay gradient + badge date */}
                    <div className="agenda-card-image-overlay" />
                    <div className="agenda-card-period-chip">
                      {item.period}
                    </div>
                  </div>

                  <div className="agenda-card-body">
                    <h3 className="agenda-card-title">{item.title}</h3>

                    {item.location && (
                      <p className="agenda-card-location">
                        {item.location}
                      </p>
                    )}

                    {item.description && (
                      <p className="agenda-card-description">
                        {item.description}
                      </p>
                    )}

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn primary agenda-card-button"
                      >
                        Prendre des places
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
