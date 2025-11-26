// components/Header.jsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <span className="logo" aria-hidden="true" />
          <h1>Compagnie MATHILDE</h1>
        </Link>

        <div className={`menu ${open ? "open" : ""}`} id="menu">
          <Link href="/spectacles">Spectacles</Link>
          <Link href="/compagnie">Compagnie</Link>
          <Link href="/agenda">Agenda</Link>
          <Link href="/medias">Médias</Link>
          <Link href="/presse">Presse</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <button
          className="burger"
          aria-label="Ouvrir le menu"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>
    </nav>
  );
}
