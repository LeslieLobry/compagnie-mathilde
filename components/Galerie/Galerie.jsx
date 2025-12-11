"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import "./Galerie.css";

export default function Galerie({ photos }) {
  const validPhotos = Array.isArray(photos) ? photos : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const viewportRef = useRef(null);

  if (!validPhotos || validPhotos.length === 0) return null;

  /* ----------- Carousel: navigation ----------- */

  const scrollToIndex = useCallback(
    (index) => {
      const node = viewportRef.current;
      if (!node) return;

      const total = validPhotos.length;
      if (total === 0) return;

      // on boucle (carousel infini)
      const normalizedIndex = ((index % total) + total) % total;

      const width = node.clientWidth;
      node.scrollTo({
        left: normalizedIndex * width,
        behavior: "smooth",
      });

      setCurrentIndex(normalizedIndex);
    },
    [validPhotos.length]
  );

  const handlePrev = () => {
    scrollToIndex(currentIndex - 1);
  };

  const handleNext = () => {
    scrollToIndex(currentIndex + 1);
  };

  const handleDotClick = (index) => {
    scrollToIndex(index);
  };

  /* ----------- Lightbox: ouverture / fermeture ----------- */

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleLightboxPrev = (event) => {
    event.stopPropagation();
    const total = validPhotos.length;
    if (!total) return;
    const newIndex = ((lightboxIndex - 1) % total + total) % total;
    setLightboxIndex(newIndex);
    scrollToIndex(newIndex); // on garde le carousel sync
  };

  const handleLightboxNext = (event) => {
    event.stopPropagation();
    const total = validPhotos.length;
    if (!total) return;
    const newIndex = ((lightboxIndex + 1) % total + total) % total;
    setLightboxIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const handleLightboxClick = () => {
    // clic sur le fond = fermer
    closeLightbox();
  };

  const handleLightboxContentClick = (event) => {
    // on ne ferme pas si on clique sur l'image ou le contenu
    event.stopPropagation();
  };

  /* ----------- Lightbox: gestion ESC + scroll body ----------- */

  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen]);

  const currentPhoto = validPhotos[lightboxIndex];

  return (
    <section className="section section-gallery">
      <div className="container">
        <h3 className="section-title">Galerie</h3>
        <p className="section-lead">
          Quelques images des spectacles de la Compagnie MATHILDE.
        </p>

        {/* -------- Carousel -------- */}
        <div className="gallery-carousel">
          <div className="gallery-carousel-viewport" ref={viewportRef}>
            <div className="gallery-carousel-track">
              {validPhotos.map((photo, index) => (
                <figure
                  key={photo.id || index}
                  className="gallery-item"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.alt || photo.title || "Photo de spectacle"}
                  />
                  {(photo.title || photo.alt) && (
                    <figcaption className="gallery-caption">
                      {photo.title || photo.alt}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>

          {validPhotos.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-arrow gallery-arrow--prev"
                onClick={handlePrev}
                aria-label="Photo précédente"
              >
                ‹
              </button>
              <button
                type="button"
                className="gallery-arrow gallery-arrow--next"
                onClick={handleNext}
                aria-label="Photo suivante"
              >
                ›
              </button>
            </>
          )}
        </div>

        {validPhotos.length > 1 && (
          <div className="gallery-dots">
            {validPhotos.map((photo, index) => (
              <button
                key={photo.id || index}
                type="button"
                className={
                  index === currentIndex
                    ? "gallery-dot is-active"
                    : "gallery-dot"
                }
                onClick={() => handleDotClick(index)}
                aria-label={`Aller à la photo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* -------- Lightbox plein écran -------- */}
      {isLightboxOpen && currentPhoto && (
        <div
          className="gallery-lightbox"
          onClick={handleLightboxClick}
        >
          <div
            className="gallery-lightbox-inner"
            onClick={handleLightboxContentClick}
          >
            <button
              type="button"
              className="gallery-lightbox-close"
              onClick={closeLightbox}
              aria-label="Fermer la photo"
            >
              ×
            </button>

            {validPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-lightbox-arrow gallery-lightbox-arrow--prev"
                  onClick={handleLightboxPrev}
                  aria-label="Photo précédente"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="gallery-lightbox-arrow gallery-lightbox-arrow--next"
                  onClick={handleLightboxNext}
                  aria-label="Photo suivante"
                >
                  ›
                </button>
              </>
            )}

            <div className="gallery-lightbox-image-wrapper">
              <img
                src={currentPhoto.imageUrl}
                alt={
                  currentPhoto.alt ||
                  currentPhoto.title ||
                  "Photo de spectacle en grand"
                }
              />
            </div>

            {(currentPhoto.title || currentPhoto.alt) && (
              <div className="gallery-lightbox-caption">
                {currentPhoto.title || currentPhoto.alt}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
