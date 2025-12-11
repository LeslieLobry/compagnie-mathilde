// app/presse/page.jsx
import prisma from "@/lib/prisma";
import "./presse.css"
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PressePage() {
  const items = await prisma.pressItem.findMany({
    orderBy: [
      { order: "asc" },
      { date: "desc" },
      { id: "desc" },
    ],
  });

  return (
    <main className="page">
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">Presse</h2>
          <p className="sub-hero-lead">Citations, articles.</p>
        </div>
      </section>

      <section className="section">
        <div className="container press">
          {items.length === 0 ? (
            <p className="press-empty">
              Pas encore d&apos;articles de presse disponibles.
            </p>
          ) : (
            <div className="press-grid">
              {items.map((item) => (
                <article key={item.id} className="press-card">
                  {item.imageUrl && (
                    <div className="press-card-image">
                      <img src={item.imageUrl} alt={item.title} />
                    </div>
                  )}

                  <div className="press-card-body">
                    <p className="press-meta">
                      <strong>{item.mediaName}</strong>
                      {item.date && (
                        <> · {formatDate(item.date)}</>
                      )}
                    </p>

                    <h3 className="press-title">{item.title}</h3>

                    {item.quote && (
                      <p className="press-quote">
                        « {item.quote} »
                      </p>
                    )}

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="press-link"
                      >
                        Lire l&apos;article
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
