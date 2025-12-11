// components/admin/AdminBackButton.jsx
"use client";
import "./AdminBackButton.css"
import Link from "next/link";

export default function AdminBackButton({ label = "Retour admin" }) {
  return (
    <div className="admin-back">
      <Link href="/admin" className="admin-back-btn">
        {label}
      </Link>
    </div>
  );
}
