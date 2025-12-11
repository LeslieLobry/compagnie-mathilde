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

  // URL actuelle de l'image hero (depuis la BDD)
  const [heroImageUrl, setHeroImageUrl] = useState(
    settings?.heroImage || ""
  );

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

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST", // ou "PUT", les deux marchent avec la route ci-dessus
        body: formData,
      });

      if (!res.ok) {
        console.error("Erreur /api/admin/settings :", await res.text());
        setMessage("Erreur lors de l'enregistrement");
        return;
      }

      const updated = await res.json();
      setMessage("Enregistré ✔ (pense à rafraîchir la home)");

      if (updated?.heroImage) {
        setHeroImageUrl(updated.heroImage);
      }
      // optionnel : reset du fichier sélectionné
      setFile(null);
    } catch (error) {
      console.error("Erreur réseau settings :", error);
      setMessage("Erreur réseau lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
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

      {heroImageUrl && (
        <div style={{ marginTop: 10 }}>
          <p style={{ marginBottom: 6 }}>Aperçu de l&apos;image actuelle :</p>
          <div
            style={{
              maxWidth: "400px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #ddd",
            }}
          >
            <img
              src={heroImageUrl}
              alt="Image de couverture actuelle"
              style={{ width: "100%", display: "block" }}
            />
          </div>
        </div>
      )}

      <button className="btn primary" type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </form>
  );
}
