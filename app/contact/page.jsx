// app/contact/page.jsx
"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi.");
      }

      setStatus("success");
      setForm({ nom: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de l'envoi.");
      setStatus("error");
    }
  }

  return (
    <main className="page">
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <h2 className="sub-hero-title">Contact</h2>
          <p className="sub-hero-lead">
            Production, diffusion, presse : entrons en contact.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container cols">
          {/* Ton formulaire, mais branché sur l'API */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              required
              value={form.nom}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Votre message"
              rows={4}
              required
              value={form.message}
              onChange={handleChange}
            />
            <button
              className="btn primary"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Envoi..." : "Envoyer"}
            </button>

            {status === "success" && (
              <p className="form-status success">
                Merci, votre message a bien été envoyé.
              </p>
            )}
            {status === "error" && (
              <p className="form-status error">
                {error || "Une erreur est survenue, merci de réessayer."}
              </p>
            )}
          </form>

          <div className="panel">
            <p>
              <strong>Compagnie MATHILDE</strong>
              <br />
              56 rue Jacques-Yves Cousteau
              <br />
              50380 Saint-Pair-sur-Mer
            </p>
            <p>
              <strong>Administration / Production</strong>
              <br />
              Président : Bruno Benoiste-Pilloire
              <br />
              Trésorière : Solene Abboud
            </p>
            <dl>
              <dt>Contact</dt>
              <dd>compagniemathilde@gmail.com</dd>
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}
