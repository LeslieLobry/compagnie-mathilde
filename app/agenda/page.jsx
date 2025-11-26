// app/agenda/page.jsx
import prisma from "@/lib/prisma";

export default async function AgendaPage() {
  const items = await prisma.agendaItem.findMany({
    orderBy: { order: "asc" },
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
            <div className="agenda">
              {items.map((item) => (
                <div key={item.id} className="event">
                  <div className="date">{item.period}</div>
                  <div>
                    <strong>{item.title}</strong>
                    {item.location && (
                      <>
                        <br />
                        <span>{item.location}</span>
                      </>
                    )}
                    {item.description && (
                      <>
                        <br />
                        <span>{item.description}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
