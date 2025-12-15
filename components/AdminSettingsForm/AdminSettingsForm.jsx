// components/AdminSettingsForm.jsx
"use client";

import { useState } from "react";

export default function AdminSettingsForm({ settings }) {
  // ✅ nouveau champ : kicker
  const [heroKicker, setHeroKicker] = useState(settings?.heroKicker || "");

  const [heroTitle, setHeroTitle] = useState(settings?.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState(settings?.heroSubtitle || "");
  const [heroText, setHeroText] = useState(settings?.heroText || "");

  // ✅ texte de présentation
  const [aboutText, setAboutText] = useState(settings?.aboutText || "");

  const [file, setFile] = useState(null);

  // URL actuelle de l'image hero (depuis la BDD)
  const [heroImageUrl, setHeroImageUrl] = useState(settings?.heroImage || "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData();

    // ✅ kicker envoyé
    formData.append("heroKicker", heroKicker);

    formData.append("heroTitle", heroTitle);
    formData.append("heroSubtitle", heroSubtitle);
    formData.append("heroText", heroText);
    formData.append("aboutText", aboutText);

    if (file) {
      formData.append("heroImage", file);
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST", // ou "PUT" selon ta route
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
      {/* BLOC HERO */}
      <h4 className="section-title">Bloc hero</h4>
      <p className="section-lead">
        Kicker, titre, sous-titre et texte qui s&apos;affichent sur la grande
        image de la page d&apos;accueil.
      </p>

      {/* ✅ KICKER */}
      <label>
        Kicker (petit texte au-dessus du titre)
        <input
          type="text"
          value={heroKicker}
          onChange={(e) => setHeroKicker(e.target.value)}
          placeholder='Ex : "Théâtre & cabaret"'
        />
      </label>

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

      <hr style={{ margin: "2rem 0" }} />

      {/* Présentation compagnie */}
      <h4 className="section-title">Présentation de la compagnie</h4>
      <p className="section-lead">
        Ce texte apparaît dans le bloc de présentation à gauche sur la page
        d&apos;accueil. Tu peux utiliser des retours à la ligne pour créer
        plusieurs paragraphes.
      </p>

      <label>
        Texte de présentation
        <textarea
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          rows={8}
          placeholder="Texte de présentation de la Compagnie MATHILDE..."
        />
      </label>

      <button className="btn primary" type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </form>
  );
}
