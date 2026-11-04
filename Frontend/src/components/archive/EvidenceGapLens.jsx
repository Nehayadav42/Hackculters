import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { getMonumentImages } from "../../services/api.js";

function hasCoordinates(monument) {
  const latitude = Number(monument.latitude);
  const longitude = Number(monument.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

export default function EvidenceGapLens({ monument, documents }) {
  const { user } = useAuth();
  const [photoCount, setPhotoCount] = useState(null);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    let active = true;

    getMonumentImages(monument.id)
      .then((response) => {
        if (!active) return;
        const records = Array.isArray(response.data) ? response.data : [];
        setPhotoCount(records.length);
        setPhotoError("");
      })
      .catch((error) => {
        if (active) {
          setPhotoError(
            error instanceof Error
              ? error.message
              : "Unable to check gallery coverage."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [monument.id]);

  const coverage = useMemo(() => {
    const records = Array.isArray(documents) ? documents : [];
    const sourceDocuments = records.filter(
      (document) => document.file_path || document.file_url
    );
    const transcribedDocuments = records.filter(
      (document) =>
        document.ocr_text ||
        document.original_text ||
        document.translated_text
    );
    const hasSource = Boolean(
      monument.source_url ||
        monument.source_name ||
        records.some(
          (document) =>
            document.source_url ||
            document.source_name ||
            document.provenance
        )
    );

    return [
      {
        label: "Mapped location",
        available: hasCoordinates(monument),
        detail: hasCoordinates(monument)
          ? "Coordinates are recorded"
          : "Coordinates are missing",
      },
      {
        label: "Visual evidence",
        available: photoCount === null ? null : photoCount > 0,
        detail:
          photoCount !== null
            ? photoCount
              ? `${photoCount} image${photoCount === 1 ? "" : "s"} in the gallery`
              : "No image is attached to the record"
            : photoError
              ? "Gallery inventory could not be loaded"
              : "Checking the gallery",
      },
      {
        label: "Source documents",
        available: sourceDocuments.length > 0,
        detail: sourceDocuments.length
          ? `${sourceDocuments.length} document file${sourceDocuments.length === 1 ? "" : "s"} linked`
          : "No document file is linked",
      },
      {
        label: "Searchable transcription",
        available: transcribedDocuments.length > 0,
        detail: transcribedDocuments.length
          ? "Extracted text is available"
          : "No extracted text is available",
      },
      {
        label: "Provenance",
        available: hasSource,
        detail: hasSource
          ? "A source reference is recorded"
          : "Source attribution is missing",
      },
    ];
  }, [documents, monument, photoCount, photoError]);

  const knownCoverage = coverage.filter((item) => item.available !== null);
  const availableCount = knownCoverage.filter((item) => item.available).length;
  const percentage = knownCoverage.length
    ? Math.round((availableCount / knownCoverage.length) * 100)
    : 0;
  const contributionPath = "/dashboard?section=contributions";

  return (
    <section
      aria-labelledby="evidence-gap-title"
      className="mb-8 rounded-2xl border border-[#c8d3db] bg-[#e8edf0] p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#bf6548]">
            COMMUNITY RESEARCH TOOL
          </p>
          <h2
            id="evidence-gap-title"
            className="mt-2 font-serif text-2xl text-[#1a2c3b]"
          >
            Evidence Gap Lens
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66727d]">
            See which archive layers are present and what would make this
            record easier to research. Coverage is based on available fields;
            it is not a measure of historical accuracy.
          </p>
        </div>
        <div className="min-w-24 rounded-xl border border-[#c8d3db] bg-[#f8f9fa] px-4 py-3 text-center">
          <p className="font-serif text-3xl text-[#1a2c3b]">{percentage}%</p>
          <p className="mt-1 text-[9px] font-semibold tracking-[0.12em] text-[#5e6b76]">
            AVAILABLE LAYERS
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {coverage.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#c8d3db] bg-[#f8f9fa] p-4"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`grid h-5 w-5 place-items-center rounded-full text-xs ${
                  item.available === true
                    ? "bg-[#2f4658] text-white"
                    : item.available === false
                      ? "bg-[#e6d6c6] text-[#8b5546]"
                      : "bg-[#c8d3db] text-[#5e6b76]"
                }`}
              >
                {item.available === true ? "✓" : item.available === false ? "–" : "·"}
              </span>
              <h3 className="text-xs font-semibold text-[#1a2c3b]">
                {item.label}
              </h3>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#66727d]">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      {coverage.some((item) => item.available === false) && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#c8d3db] pt-5">
          <p className="text-sm text-[#66727d]">
            Help close a documented gap with a sourced contribution.
          </p>
          <Link
            to={user ? contributionPath : "/auth"}
            state={
              user
                ? undefined
                : {
                    from: {
                      pathname: contributionPath.split("?")[0],
                      search: `?${contributionPath.split("?")[1]}`,
                    },
                  }
            }
            className="rounded-full bg-[#1a2c3b] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#344d61]"
          >
            Contribute evidence <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </section>
  );
}
