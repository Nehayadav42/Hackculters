
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getMonumentImages,
  uploadMonumentImage,
} from "../services/api.js";

function formatGalleryImages(response, images, name) {
  const databaseImages = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

  const formattedImages = databaseImages
    .filter((image) => image.image_url)
    .map((image) => ({
      id: image.id,
      url: image.image_url,
      title: image.title || name,
      created_at: image.created_at,
    }));

  const knownUrls = new Set(
    formattedImages.map((image) => image.url)
  );

  const existingImages = images
    .filter(
      (url) =>
        typeof url === "string" &&
        url.trim() &&
        !knownUrls.has(url)
    )
    .map((url, index) => ({
      id: `existing-${index}`,
      url,
      title: name,
    }));

  return [...formattedImages, ...existingImages];
}

export default function MonumentGallery({
  monumentId,
  name = "Monument",
  images = [],
}) {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(null);
  const [failedImages, setFailedImages] = useState([]);

  const fileInputRef = useRef(null);

  const fallbackImagesKey = JSON.stringify(images);

  // Fetch gallery images
  useEffect(() => {
    let cancelled = false;

    async function fetchGallery() {
      try {
        setLoading(true);

        const response = await getMonumentImages(monumentId);

        const fallbackImages = JSON.parse(fallbackImagesKey);

        const formattedImages = formatGalleryImages(
          response,
          fallbackImages,
          name
        );

        if (!cancelled) {
          setGalleryImages(formattedImages);
          setFailedImages([]);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load gallery images."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!monumentId) {
  cancelled = true;
  return;
}

    fetchGallery();

    return () => {
      cancelled = true;
    };
  }, [monumentId, name, fallbackImagesKey]);

  // Lock background scrolling while image viewer is open
  useEffect(() => {
    if (!activeImage) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow =
        previousHtmlOverflow;
    };
  }, [activeImage]);

  // Refresh gallery after upload
  const refreshGallery = async () => {
    try {
      const response = await getMonumentImages(monumentId);

      const formattedImages = formatGalleryImages(
        response,
        JSON.parse(fallbackImagesKey),
        name
      );

      setGalleryImages(formattedImages);
      setFailedImages([]);
      setError("");
    } catch (err) {
      setError(
        err.message || "Image uploaded, but gallery refresh failed."
      );
    }
  };

  // Upload image
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image size must be less than 8 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

      await uploadMonumentImage({
        monumentId,
        file,
        title: file.name,
      });

      await refreshGallery();
    } catch (err) {
      setError(err.message || "Unable to upload image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Open image viewer
  const openPreview = (image) => {
    setActiveImage(image);
  };

  // Close image viewer
  const closePreview = () => {
    setActiveImage(null);
  };

  const currentIndex = galleryImages.findIndex(
    (image) => image.id === activeImage?.id
  );

  // Previous image
  const showPrevious = () => {
    if (galleryImages.length < 2) return;

    const index =
      (currentIndex - 1 + galleryImages.length) %
      galleryImages.length;

    setActiveImage(galleryImages[index]);
  };

  // Next image
  const showNext = () => {
    if (galleryImages.length < 2) return;

    const index =
      (currentIndex + 1) % galleryImages.length;

    setActiveImage(galleryImages[index]);
  };

  // Keyboard controls
  useEffect(() => {
    if (!activeImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePreview();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage, galleryImages]);

  return (
    <>
      <section className="mt-12 border-t border-[#ded6c6] pt-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a17b43]">
              MONUMENT COLLECTION
            </p>

            <h2 className="mt-2 font-serif text-3xl text-[#183b32]">
              Image Gallery
            </h2>

            <p className="mt-2 text-sm text-[#77796f]">
              Photographs of {name}
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-[#183b32] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#285548] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "+ Add Image"}
            </button>
          </div>
        </div>

        <p className="mb-5 text-xs text-[#77796f]">
          JPG, PNG or WEBP · Maximum 8 MB per image
        </p>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-[#77796f]">
            Loading image gallery...
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#cfc5b2] bg-white/40 px-6 py-16 text-center">
            <p className="font-serif text-2xl text-[#183b32]">
              No photographs yet
            </p>

            <p className="mt-3 text-sm text-[#77796f]">
              Add the first photograph to this monument's gallery.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-xs text-[#77796f]">
              {galleryImages.length} photographs
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galleryImages.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => openPreview(image)}
                  className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-[#ded6c6] bg-[#e9e3d5]"
                >
                  {failedImages.includes(image.url) ? (
                    <div className="flex h-full items-center justify-center text-xs text-[#77796f]">
                      Image unavailable
                    </div>
                  ) : (
                    <img
                      src={image.url}
                      alt={image.title}
                      loading="lazy"
                      onError={() =>
                        setFailedImages((previous) =>
                          previous.includes(image.url)
                            ? previous
                            : [...previous, image.url]
                        )
                      }
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                    />
                  )}

                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-3 pt-8 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">
                    View image ↗
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Google-style image viewer rendered outside the page */}
      {activeImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:p-6"
            onClick={closePreview}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} image viewer`}
          >
            {/* Viewer controls */}
            <div
              className="relative flex max-h-[94vh] max-w-[94vw] flex-col items-center"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Top toolbar */}
              <div className="mb-3 flex w-full items-center justify-between gap-4 text-white">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {name}
                  </p>

                  <p className="mt-1 text-xs text-white/75">
                    {currentIndex + 1} of {galleryImages.length}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePreview}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition hover:bg-white/30"
                  aria-label="Close image"
                >
                  ×
                </button>
              </div>

              {/* Actual image - no oversized canvas */}
              <div className="flex max-h-[85vh] max-w-[94vw] items-center justify-center">
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  className="block max-h-[85vh] max-w-[94vw] rounded-lg object-contain shadow-2xl"
                />
              </div>

              {/* Image navigation */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-[#183b32] shadow-lg transition hover:bg-white sm:-left-14"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-[#183b32] shadow-lg transition hover:bg-white sm:-right-14"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
