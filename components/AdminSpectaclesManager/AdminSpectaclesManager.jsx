// components/AdminSpectaclesManager.jsx
"use client";

import { useState } from "react";

export default function AdminSpectaclesManager({ initialSpectacles }) {
  const [spectacles, setSpectacles] = useState(initialSpectacles || []);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [texte, setTexte] = useState("");
  const [mes, setMes] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setTexte("");
    setMes("");
    setDescription("");
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setTitle(s.title || "");
    setSubtitle(s.subtitle || "");
    setTexte(s.texte || "");
    setMes(s.mes || "");
    setDescription(s.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce spectacle ?")) return;

    const res = await fetch(`/api/admin/spectacles/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Erreur lors de la suppression");
      return;
    }

    setSpectacles((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      title,
      subtitle,
      texte,
      mes,
      description,
    };

    const url = editingId
      ? `/api/admin/spectacles/${editingId}`
      : "/api/admin/spectacles";

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

    const spectacle = await res.json();

    if (editingId) {
      // mise à jour
      setSpectacles((prev) =>
        prev.map((s) => (s.id === spectacle.id ? spectacle : s))
      );
      setMessage("Spectacle mis à jour ✔");
    } else {
      // création
      setSpectacles((prev) => [...prev, spectacle]);
      setMessage("Spectacle ajouté ✔");
    }

    resetForm();
  };

  return (
    <div className="admin-grid">
      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editingId ? "Modifier un spectacle" : "Nouveau spectacle"}</h3>

        <label>
          Titre *
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          Sous-titre (ex : Théâtre &amp; cabaret — 1h15)
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </label>

        <label>
          Auteur / Texte
          <input
            type="text"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
          />
        </label>

        <label>
          Mise en scène
          <input
            type="text"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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

      {/* LISTE DES SPECTACLES */}
      <div>
        <h3>Liste des spectacles</h3>
        {spectacles.length === 0 ? (
          <p>Aucun spectacle enregistré pour l&apos;instant.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Sous-titre</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {spectacles.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.title}</td>
                  <td>{s.subtitle}</td>
                  <td className="admin-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(s)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                    >
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
