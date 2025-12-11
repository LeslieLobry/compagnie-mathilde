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

// Construit un texte de période à partir de 2 dates "YYYY-MM-DD"
function formatPeriodFromDates(start, end) {
  if (!start) return "";

  const opts = { day: "2-digit", month: "long", year: "numeric" };

  const startDate = new Date(start + "T00:00:00");
  const startLabel = startDate.toLocaleDateString("fr-FR", opts);

  if (!end) return startLabel;

  const endDate = new Date(end + "T00:00:00");
  const endLabel = endDate.toLocaleDateString("fr-FR", opts);

  if (start === end) return startLabel;

  return `${startLabel} → ${endLabel}`;
}

export default function AdminAgendaManager({ initialItems }) {
  const [items, setItems] = useState(
    (initialItems || []).slice().sort(sortByOrder)
  );
  const [editingId, setEditingId] = useState(null);

  // Dates du calendrier
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [periodPreview, setPeriodPreview] = useState("");

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(computeNextOrder(initialItems || []));
  const [link, setLink] = useState("");

  // Image : S3
  const [imageFile, setImageFile] = useState(null);    // fichier sélectionné
  const [imageUrl, setImageUrl] = useState("");        // URL S3 actuelle (si existante)
  const [imagePreview, setImagePreview] = useState(""); // aperçu dans le form

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setStartDate("");
    setEndDate("");
    setPeriodPreview("");
    setTitle("");
    setLocation("");
    setDescription("");
    setOrder(computeNextOrder(items));
    setLink("");
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    setMessage("");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setStartDate("");
    setEndDate("");
    setPeriodPreview(item.period || "");
    setTitle(item.title || "");
    setLocation(item.location || "");
    setDescription(item.description || "");
    setOrder(typeof item.order === "number" ? item.order : 0);
    setLink(item.link || "");
    setImageFile(null);
    setImageUrl(item.imageUrl || "");
    setImagePreview(item.imageUrl || "");
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
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Erreur réseau DELETE agenda :", error);
      alert("Erreur réseau lors de la suppression");
    }
  };

  const onChangeStartDate = (value) => {
    setStartDate(value);
    setPeriodPreview(formatPeriodFromDates(value, endDate));
  };

  const onChangeEndDate = (value) => {
    setEndDate(value);
    setPeriodPreview(formatPeriodFromDates(startDate, value));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(imageUrl || "");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (!startDate) {
      setMessage("Merci de choisir au moins une date de début.");
      setSaving(false);
      return;
    }

    const period = formatPeriodFromDates(startDate, endDate);
    if (!period) {
      setMessage("La période est invalide.");
      setSaving(false);
      return;
    }

    try {
      // 1️⃣ Upload image si un nouveau fichier a été choisi
      let finalImageUrl = imageUrl;

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);

        const uploadRes = await fetch(
          "/api/admin/agenda/upload-image",
          {
            method: "POST",
            body: fd,
          }
        );

        if (!uploadRes.ok) {
          console.error(
            "Erreur upload image agenda :",
            await uploadRes.text()
          );
          setMessage("Erreur lors de l'upload de l'image");
          setSaving(false);
          return;
        }

        const data = await uploadRes.json();
        finalImageUrl = data.url;
      }

      // 2️⃣ Enregistrement de l'item agenda
      const payload = {
        period,
        title,
        location,
        description,
        order: Number(order) || 0,
        link: link?.trim() || null,
        imageUrl: finalImageUrl || null,
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

      if (!res.ok) {
        console.error("Erreur save agenda :", await res.text());
        setMessage("Erreur lors de l'enregistrement");
        setSaving(false);
        return;
      }

      const item = await res.json();

      if (editingId) {
        setItems((prev) =>
          prev
            .map((i) => (i.id === item.id ? item : i))
            .sort(sortByOrder)
        );
        setMessage("Date mise à jour ✔");
      } else {
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
          Date de début *
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => onChangeStartDate(e.target.value)}
          />
        </label>

        <label>
          Date de fin (facultative)
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChangeEndDate(e.target.value)}
          />
        </label>

        {periodPreview && (
          <p className="admin-message admin-hint">
            Texte affiché : <em>{periodPreview}</em>
          </p>
        )}

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
          Lien billetterie (facultatif)
          <input
            type="url"
            placeholder="https://billetterie.exemple.com"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </label>

        <label>
          Affiche / image (AWS S3)
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        {imagePreview && (
          <div className="admin-image-preview">
            <p>Prévisualisation :</p>
            <img
              src={imagePreview}
              alt="Aperçu"
              style={{ maxWidth: "200px", borderRadius: "8px" }}
            />
          </div>
        )}

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
                <th>Date / Période</th>
                <th>Titre</th>
                <th>Lieu</th>
                <th>Billetterie</th>
                <th>Image</th>
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
                  <td>
                    {i.link ? (
                      <a
                        href={i.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Billetterie
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {i.imageUrl ? "✅" : "—"}
                  </td>
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
