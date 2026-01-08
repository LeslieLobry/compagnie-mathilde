// components/Footer.jsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} Compagnie MATHILDE — Tous droits réservés ·{" "}
      <Link href="/mentions-legales">Mentions légales</Link> · Site réalisé par
      Laulie web
    </footer>
  );
}
