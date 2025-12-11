// app/admin/agenda/page.jsx
import prisma from "@/lib/prisma";
import AdminAgendaManager from "../../../components/AdminAgendaManager/AdminAgendaManager";
import AdminBackButton from "@/components/AdminBackButton/AdminBackButton";

export default async function AdminAgendaPage() {
  const items = await prisma.agendaItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <main className="page">
      <AdminBackButton />
      <section className="section">
        <div className="container">
          <h2 className="section-title">Administration — Agenda</h2>
          <p className="section-lead">
            Ajouter, modifier ou supprimer les dates affichées dans l&apos;agenda.
          </p>

          <AdminAgendaManager initialItems={items} />
        </div>
      </section>
    </main>
  );
}
