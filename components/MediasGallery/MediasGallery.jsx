// components/MediasGallery.jsx
"use client";

import { useState, useEffect } from "react";

export default function MediasGallery({ medias }) {
  const [active, setActive] = useState(null);

  // Fermer avec Echap
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setActive(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  if (!medias || medias.length === 0) {
    return <p>Aucune photo pour l&apos;instant.</p>;
  }

  return (
    <>
      {/* GALERIE DE VIGNETTES */}
      <div className="gallery">
        {medias.map((m) => (
          <figure key={m.id} className="gallery-item">
            <button
              type="button"
              className="gallery-thumb"
              onClick={() => setActive(m)}
            >
              <img
                src={m.imagePath}
                alt={m.legend || m.title || "Photo de spectacle"}
              />
            </button>

            {(m.title || m.legend) && (
              <figcaption className="gallery-caption">
                {m.title && <strong>{m.title}</strong>}
                {m.title && m.legend && " — "}
                {m.legend}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* LIGHTBOX (AGRANDISSEMENT) */}
      {active && (
        <div
          className="gallery-lightbox"
          onClick={() => setActive(null)}
        >
          <div
            className="gallery-lightbox-inner"
            onClick={(e) => e.stopPropagation()} // évite de fermer si on clique sur l'image
          >
            <button
              type="button"
              className="gallery-lightbox-close"
              onClick={() => setActive(null)}
              aria-label="Fermer"
            >
              ×
            </button>

            <img
              className="gallery-lightbox-image"
              src={active.imagePath}
              alt={active.legend || active.title || "Photo de spectacle"}
            />

            {(active.title || active.legend) && (
              <p className="gallery-lightbox-caption">
                {active.title && <strong>{active.title}</strong>}
                {active.title && active.legend && " — "}
                {active.legend}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
