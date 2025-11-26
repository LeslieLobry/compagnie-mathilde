// components/AdminAgendaManager.jsx
"use client";

import { useState } from "react";

export default function AdminAgendaManager({ initialItems }) {
  const [items, setItems] = useState(initialItems || []);
  const [editingId, setEditingId] = useState(null);

  const [period, setPeriod] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setPeriod("");
    setTitle("");
    setLocation("");
    setDescription("");
    setOrder(0);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setPeriod(item.period || "");
    setTitle(item.title || "");
    setLocation(item.location || "");
    setDescription(item.description || "");
    setOrder(item.order ?? 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette date d'agenda ?")) return;

    const res = await fetch(`/api/admin/agenda/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Erreur lors de la suppression");
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
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

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      setMessage("Erreur lors de l'enregistrement");
      return;
    }

    const item = await res.json();

    if (editingId) {
      // update
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? item : i))
      );
      setMessage("Date mise à jour ✔");
    } else {
      // create
      setItems((prev) => [...prev, item].sort((a, b) => a.order - b.order));
      setMessage("Date ajoutée ✔");
    }

    resetForm();
  };

  return (
    <div className="admin-grid">
      {/* FORM */}
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
              {items.map((i) => (
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
