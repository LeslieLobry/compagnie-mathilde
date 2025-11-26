// components/AdminSpectaclePhotosManager.jsx
"use client";

import { useState } from "react";

export default function AdminSpectaclePhotosManager({
  spectacleId,
  initialPhotos,
}) {
  const [photos, setPhotos] = useState(initialPhotos || []);
  const [editingId, setEditingId] = useState(null);

  const [legend, setLegend] = useState("");
  const [order, setOrder] = useState(0);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setLegend("");
    setOrder(0);
    setFile(null);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setLegend(p.legend || "");
    setOrder(p.order ?? 0);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette photo ?")) return;

    const res = await fetch(
      `/api/admin/spectacles/${spectacleId}/photos/${id}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      alert("Erreur lors de la suppression");
      return;
    }

    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("legend", legend);
    formData.append("order", String(order || 0));
    if (file) formData.append("image", file);

    const url = editingId
      ? `/api/admin/spectacles/${spectacleId}/photos/${editingId}`
      : `/api/admin/spectacles/${spectacleId}/photos`;
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

    const photo = await res.json();

    if (editingId) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? photo : p))
      );
      setMessage("Photo mise à jour ✔");
    } else {
      setPhotos((prev) =>
        [...prev, photo].sort((a, b) => a.order - b.order)
      );
      setMessage("Photo ajoutée ✔");
    }

    resetForm();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>
          {editingId
            ? "Modifier une photo"
            : "Ajouter une photo au spectacle"}
        </h3>

        <label>
          Légende / crédit
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
          Image {editingId ? "(laisser vide pour garder l'actuelle)" : "*"}
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
              Annuler
            </button>
          )}
        </div>

        {message && <p className="admin-message">{message}</p>}
      </form>

      <div>
        <h3>Photos du spectacle</h3>
        {photos.length === 0 ? (
          <p>Aucune photo pour l&apos;instant.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ordre</th>
                <th>Prévisu</th>
                <th>Légende</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {photos.map((p) => (
                <tr key={p.id}>
                  <td>{p.order}</td>
                  <td>
                    <img
                      src={p.imagePath}
                      alt={p.legend || ""}
                      style={{
                        width: 70,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  </td>
                  <td>{p.legend}</td>
                  <td className="admin-actions">
                    <button type="button" onClick={() => handleEdit(p)}>
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
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
    </>
  );
}
