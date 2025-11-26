// components/AdminSettingsForm.jsx
"use client";

import { useState } from "react";

export default function AdminSettingsForm({ settings }) {
  const [heroTitle, setHeroTitle] = useState(settings?.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState(
    settings?.heroSubtitle || ""
  );
  const [heroText, setHeroText] = useState(settings?.heroText || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("heroTitle", heroTitle);
    formData.append("heroSubtitle", heroSubtitle);
    formData.append("heroText", heroText);
    if (file) {
      formData.append("heroImage", file);
    }

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      body: formData,
    });

    setSaving(false);

    if (!res.ok) {
      setMessage("Erreur lors de l'enregistrement");
      return;
    }

    setMessage("Enregistré ✔ (pense à rafraîchir la home)");
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <label>
        Titre principal
        <textarea
          value={heroTitle}
          onChange={(e) => setHeroTitle(e.target.value)}
          rows={2}
        />
      </label>

      <label>
        Sous-titre
        <textarea
          value={heroSubtitle}
          onChange={(e) => setHeroSubtitle(e.target.value)}
          rows={2}
        />
      </label>

      <label>
        Texte complémentaire
        <textarea
          value={heroText}
          onChange={(e) => setHeroText(e.target.value)}
          rows={3}
        />
      </label>

      <label>
        Photo de couverture (jpg / png)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      <button className="btn primary" type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </form>
  );
}
