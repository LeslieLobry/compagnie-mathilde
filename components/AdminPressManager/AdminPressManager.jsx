// components/AdminPressManager.jsx
"use client";

import { useState } from "react";

const emptyForm = {
  title: "",
  mediaName: "",
  url: "",
  quote: "",
  imageUrl: "", // sera rempli automatiquement après upload
  date: "",
  order: 0,
};

export default function AdminPressManager({ initialItems }) {
  const [items, setItems] = useState(initialItems || []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null); // <-- fichier à uploader

  const isEditing = editingId !== null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFile(null);
  };

  const refreshItems = async () => {
    const res = await fetch("/api/admin/presse");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageUrl = form.imageUrl || null;

      // 1) Si un fichier est sélectionné, on l'upload d'abord
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);

        const uploadRes = await fetch("/api/admin/presse/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();

        if (!uploadRes.ok) {
          setMessage(
            uploadJson.error ||
              "Erreur lors du téléversement de la photo."
          );
          setLoading(false);
          return;
        }

        imageUrl = uploadJson.imageUrl;
      }

      // 2) Ensuite on enregistre l'entrée de presse avec l'URL S3
      const payload = {
        ...form,
        imageUrl,
        order: Number(form.order) || 0,
      };

      const url = isEditing
        ? `/api/admin/presse/${editingId}`
        : "/api/admin/presse";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Erreur lors de l’enregistrement.");
      } else {
        setMessage(isEditing ? "Entrée mise à jour." : "Entrée ajoutée.");
        resetForm();
        await refreshItems();
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      mediaName: item.mediaName || "",
      url: item.url || "",
      quote: item.quote || "",
      imageUrl: item.imageUrl || "",
      date: item.date ? item.date.slice(0, 10) : "",
      order: item.order ?? 0,
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette entrée de presse ?")) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/presse/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "Erreur lors de la suppression.");
      } else {
        setMessage("Entrée supprimée.");
        await refreshItems();
        if (editingId === id) {
          resetForm();
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-press">
      {/* Formulaire */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{isEditing ? "Modifier un article" : "Ajouter un article"}</h2>

        {message && <p className="admin-message">{message}</p>}

        <div className="field">
          <label htmlFor="title">Titre *</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="mediaName">Nom du média *</label>
          <input
            id="mediaName"
            name="mediaName"
            value={form.mediaName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="url">Lien vers l&apos;article</label>
          <input
            id="url"
            name="url"
            type="url"
            placeholder="https://..."
            value={form.url}
            onChange={handleChange}
          />
        </div>

        {/* Upload de la photo / scan */}
        <div className="field">
          <label htmlFor="imageFile">Photo / scan de l&apos;article</label>
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {form.imageUrl && (
            <div className="admin-image-preview">
              <p>Image actuelle :</p>
              <img
                src={form.imageUrl}
                alt={form.title || "Visuel presse"}
                style={{ maxWidth: "200px", marginTop: "8px" }}
              />
              <p className="hint">
                Laissez vide pour conserver cette image, ou choisissez un
                nouveau fichier pour la remplacer.
              </p>
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="quote">Citation / extrait</label>
          <textarea
            id="quote"
            name="quote"
            rows={3}
            value={form.quote}
            onChange={handleChange}
          />
        </div>

        <div className="field-inline">
          <div className="field">
            <label htmlFor="date">Date de parution</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="order">Ordre d&apos;affichage</label>
            <input
              id="order"
              name="order"
              type="number"
              value={form.order}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="actions">
          <button className="btn primary" type="submit" disabled={loading}>
            {loading
              ? "Enregistrement..."
              : isEditing
              ? "Mettre à jour"
              : "Ajouter"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn"
              onClick={resetForm}
              disabled={loading}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Liste des entrées */}
      <div className="admin-list">
        <h2>Articles existants</h2>

        {items.length === 0 ? (
          <p>Aucune entrée pour l&apos;instant.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ordre</th>
                <th>Titre</th>
                <th>Média</th>
                <th>Date</th>
                <th>Lien</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.order}</td>
                  <td>{item.title}</td>
                  <td>{item.mediaName}</td>
                  <td>
                    {item.date
                      ? new Date(item.date).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                  <td>{item.url ? "Oui" : "Non"}</td>
                  <td className="admin-row-actions">
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => handleEdit(item)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn danger small"
                      onClick={() => handleDelete(item.id)}
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
