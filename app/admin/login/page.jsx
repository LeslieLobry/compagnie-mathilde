// app/admin/login/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Mot de passe incorrect");
      return;
    }

    router.push("/admin");
  };

  return (
    <main className="page">
      <section className="section">
        <div className="container cols">
          <form onSubmit={handleSubmit}>
            <h2 className="section-title">Administration</h2>
            <input
              type="password"
              placeholder="Mot de passe admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
            <button className="btn primary" type="submit">
              Se connecter
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
