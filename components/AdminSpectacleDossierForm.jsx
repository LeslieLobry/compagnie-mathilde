// components/AdminSpectacleDossierForm.jsx
"use client";

import { useState } from "react";

export default function AdminSpectacleDossierForm({
  spectacleId,
  currentPath,
}) {
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Merci de choisir un fichier PDF.");
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append("dossier", file);

    const res = await fetch(`/api/admin/spectacles/${spectacleId}/dossier`, {
      method: "POST",
      body: formData,
    });

    setSaving(false);

    if (!res.ok) {
      setMessage("Erreur lors de l'enregistrement du dossier.");
      return;
    }

    setMessage("Dossier mis à jour ✔");
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <h3>Dossier PDF</h3>

      {currentPath && (
        <p style={{ fontSize: 14 }}>
          Dossier actuel :{" "}
          <a
            href={currentPath}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
          >
            ouvrir le PDF
          </a>
        </p>
      )}

      <label>
        Nouveau fichier PDF
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      <button className="btn primary" type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer le dossier"}
      </button>

      {message && <p className="admin-message">{message}</p>}
    </form>
  );
}
