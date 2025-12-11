// components/AdminGalleryManager/AdminGalleryManager.jsx
"use client";

import { useState } from "react";
import "./AdminGalleryManager.css"; // ⬅️ import du CSS local

export default function AdminGalleryManager({ initialPhotos }) {
  const [photos, setPhotos] = useState(initialPhotos || []);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(e) {
    const f = e.target.files?.[0] || null;
    setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      alert("Merci de choisir une image.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);
      if (alt) formData.append("alt", alt);

      const res = await fetch("/api/admin/galerie", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error(await res.text());
        alert("Erreur lors de l'ajout de la photo.");
        return;
      }

      const newPhoto = await res.json();
      setPhotos((prev) => [newPhoto, ...prev]);

      setFile(null);
      setTitle("");
      setAlt("");
      const input = document.getElementById("file");
      if (input) input.value = "";
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette photo de la galerie ?")) return;

    try {
      const res = await fetch(`/api/admin/galerie/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error(await res.text());
        alert("Erreur lors de la suppression.");
        return;
      }

      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  }

  return (
    <div className="admin-gallery">
      {/* Formulaire d'ajout */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="file">Image *</label>
          <input
            id="file"
            name="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Ajout..." : "Ajouter la photo"}
        </button>
      </form>

      {/* Liste des photos */}
      <div className="admin-gallery-list">
        {photos.length === 0 && <p>Aucune photo pour le moment.</p>}

        <div className="admin-gallery-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="admin-gallery-item">
              <div className="admin-gallery-thumb">
                <img
                  src={photo.imageUrl}
                  alt={photo.alt || photo.title || "Photo de spectacle"}
                />
              </div>
                <button
                  type="button"
                  className="btn danger admin-gallery-delete"
                  onClick={() => handleDelete(photo.id)}
                >
                  Supprimer
                </button>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
