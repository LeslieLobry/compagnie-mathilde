// components/AdminAgendaManager.jsx
"use client";

import { useState } from "react";

function sortByOrder(a, b) {
  const oa = typeof a.order === "number" ? a.order : 0;
  const ob = typeof b.order === "number" ? b.order : 0;
  if (oa !== ob) return oa - ob;
  return a.id - b.id;
}

function computeNextOrder(items) {
  if (!items || items.length === 0) return 0;
  const max = Math.max(
    ...items.map((i) => (typeof i.order === "number" ? i.order : 0))
  );
  return max + 1;
}

export default function AdminAgendaManager({ initialItems }) {
  const [items, setItems] = useState(
    (initialItems || []).slice().sort(sortByOrder)
  );
  const [editingId, setEditingId] = useState(null);

  const [period, setPeriod] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(computeNextOrder(initialItems || []));

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setPeriod("");
    setTitle("");
    setLocation("");
    setDescription("");
    setOrder(computeNextOrder(items));
    setMessage("");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setPeriod(item.period || "");
    setTitle(item.title || "");
    setLocation(item.location || "");
    setDescription(item.description || "");
    setOrder(typeof item.order === "number" ? item.order : 0);
    setMessage("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette date d'agenda ?")) return;

    try {
      const res = await fetch(`/api/admin/agenda/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Erreur DELETE /api/admin/agenda", await res.text());
        alert("Erreur lors de la suppression");
        return;
      }

      setItems((prev) => prev.filter((i) => i.id !== id).sort(sortByOrder));
      // si on était en train d’éditer celle-là, on nettoie le formulaire
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Erreur réseau DELETE agenda :", error);
      alert("Erreur réseau lors de la suppression");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      period,
      title,
      location,
      description,
      order: Number(order) || 0,
    };

    const url = editingId
      ? `/api/admin/agenda/${editingId}`
      : "/api/admin/agenda";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Erreur save agenda :", await res.text());
        setMessage("Erreur lors de l'enregistrement");
        return;
      }

      const item = await res.json();

      if (editingId) {
        // update
        setItems((prev) =>
          prev
            .map((i) => (i.id === item.id ? item : i))
            .sort(sortByOrder)
        );
        setMessage("Date mise à jour ✔");
      } else {
        // create
        setItems((prev) => [...prev, item].sort(sortByOrder));
        setMessage("Date ajoutée ✔");
      }

      resetForm();
    } catch (error) {
      console.error("Erreur réseau save agenda :", error);
      setMessage("Erreur réseau lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-grid">
      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editingId ? "Modifier une date" : "Nouvelle date"}</h3>

        <label>
          Période / Date *
          <input
            type="text"
            required
            placeholder="Ex : Mars → Mai 2026"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </label>

        <label>
          Titre *
          <input
            type="text"
            required
            placeholder="Ex : Création — Théâtre de l'Essaïon (Paris)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          Lieu / Région
          <input
            type="text"
            placeholder="Ex : Paris, Normandie..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          Ordre d&apos;affichage
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
        </label>

        <div className="admin-buttons">
          <button className="btn primary" type="submit" disabled={saving}>
            {saving
              ? "Enregistrement..."
              : editingId
              ? "Mettre à jour"
              : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn ghost"
              onClick={resetForm}
            >
              Annuler la modification
            </button>
          )}
        </div>

        {message && <p className="admin-message">{message}</p>}
      </form>

      {/* LISTE */}
      <div>
        <h3>Liste des dates</h3>
        {items.length === 0 ? (
          <p>Aucune date pour l&apos;instant.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ordre</th>
                <th>Période</th>
                <th>Titre</th>
                <th>Lieu</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.sort(sortByOrder).map((i) => (
                <tr key={i.id}>
                  <td>{i.order}</td>
                  <td>{i.period}</td>
                  <td>{i.title}</td>
                  <td>{i.location}</td>
                  <td className="admin-actions">
                    <button type="button" onClick={() => handleEdit(i)}>
                      Modifier
                    </button>
                    <button type="button" onClick={() => handleDelete(i.id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
