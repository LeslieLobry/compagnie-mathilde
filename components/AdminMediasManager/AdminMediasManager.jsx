// components/AdminMediasManager.jsx
"use client";

import { useState } from "react";

export default function AdminMediasManager({ initialItems }) {
  const [items, setItems] = useState(initialItems || []);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [legend, setLegend] = useState("");
  const [order, setOrder] = useState(0);
  const [file, setFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setLegend("");
    setOrder(0);
    setFile(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setLegend(item.legend || "");
    setOrder(item.order ?? 0);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette photo ?")) return;

    const res = await fetch(`/api/admin/medias/${id}`, {
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

    const formData = new FormData();
    formData.append("title", title);
    formData.append("legend", legend);
    formData.append("order", String(order || 0));
    if (file) {
      formData.append("image", file);
    }

    const url = editingId
      ? `/api/admin/medias/${editingId}`
      : "/api/admin/medias";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    setSaving(false);

    if (!res.ok) {
      setMessage("Erreur lors de l'enregistrement");
      return;
    }

    const item = await res.json();

    if (editingId) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? item : i))
      );
      setMessage("Photo mise à jour ✔");
    } else {
      setItems((prev) => [...prev, item].sort((a, b) => a.order - b.order));
      setMessage("Photo ajoutée ✔");
    }

    resetForm();
  };

  return (
    <div className="admin-grid">
      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editingId ? "Modifier une photo" : "Ajouter une photo"}</h3>

        <label>
          Titre (optionnel)
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          Légende / crédit (optionnel)
          <input
            type="text"
            value={legend}
            onChange={(e) => setLegend(e.target.value)}
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

        <label>
          Image {editingId ? "(laisser vide pour conserver l'actuelle)" : "*"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
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
        <h3>Liste des médias</h3>
        {items.length === 0 ? (
          <p>Aucune photo pour l&apos;instant.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ordre</th>
                <th>Prévisu</th>
                <th>Titre</th>
                <th>Légende</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>{m.order}</td>
                  <td>
                    <img
                      src={m.imagePath}
                      alt=""
                      style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 6 }}
                    />
                  </td>
                  <td>{m.title}</td>
                  <td>{m.legend}</td>
                  <td className="admin-actions">
                    <button type="button" onClick={() => handleEdit(m)}>
                      Modifier
                    </button>
                    <button type="button" onClick={() => handleDelete(m.id)}>
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
