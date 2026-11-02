
import { useState } from "react";

export default function MonumentGallery({ images = [], name = "Monument" }) {
  const validImages = images.filter(
    (image) => typeof image === "string" && image.trim() !== ""
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (validImages.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-2xl bg-[#e9e3d5] text-[#777365]">
        No images available for this monument.
      </div>
    );
  }

  const activeImage = validImages[activeIndex];

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="group relative block h-[320px] w-full overflow-hidden rounded-2xl bg-[#e9e3d5] md:h-[440px]"
        >
          <img
            src={activeImage}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-4 py-2 text-xs text-white">
            View full image
          </span>
        </button>

        {validImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {validImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  activeIndex === index
                    ? "border-[#a17b43]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image}
                  alt={`${name} view ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsPreviewOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20"
          >
            Close ✕
          </button>

          <img
            src={activeImage}
            alt={name}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
