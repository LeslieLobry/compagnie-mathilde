// app/admin/presse/page.jsx
import prisma from "@/lib/prisma";
import AdminPressManager from "@/components/AdminPressManager/AdminPressManager";

export default async function AdminPressePage() {
  const items = await prisma.pressItem.findMany({
    orderBy: [
      { order: "asc" },
      { date: "desc" },
      { id: "desc" },
    ],
  });

  return (
    <main className="page admin-page">
      <section className="section">
        <div className="container">
          <h1 className="sub-hero-title">Gestion de la presse</h1>
          <p className="sub-hero-lead">
            Ajouter, modifier ou supprimer les articles de presse.
          </p>

          <AdminPressManager initialItems={items} />
        </div>
      </section>
    </main>
  );
}
