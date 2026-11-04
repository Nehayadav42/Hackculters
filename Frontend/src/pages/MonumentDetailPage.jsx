
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMonumentById } from "../services/api.js";
import MonumentMap from "../components/MonumentMap.jsx";
import MonumentGallery from "../components/MonumentGallery.jsx";
import ManuscriptReader from "../components/ManuscriptReader.jsx";
import EvidenceGapLens from "../components/archive/EvidenceGapLens.jsx";
import ArchiveAssistant from "../components/archive/ArchiveAssistant.jsx";
import { BHOPAL_COLLECTION } from "../data/bhopal.js";

function normalizeMonumentName(value) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function DetailSection({ title, children }) {
  return (
    <section className="border-b border-[#d2dce2] py-8">
      <h2 className="mb-5 font-serif text-2xl text-[#1a2c3b]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailText({ value }) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && !value.trim())
  ) {
    return (
      <p className="text-sm text-[#5e6b76]">
        Information is not available yet.
      </p>
    );
  }

  return (
    <p className="whitespace-pre-line text-sm leading-8 text-[#625f54] md:text-base">
      {value}
    </p>
  );
}

function getImages(monument) {
  const images = [
    ...(Array.isArray(monument.images) ? monument.images : []),
    ...(Array.isArray(monument.gallery_images)
      ? monument.gallery_images
      : []),
    monument.cover_image,
    monument.image_url,
    monument.thumbnail_url,
    monument.image,
  ];

  return [
    ...new Set(
      images.filter(
        (image) =>
          typeof image === "string" && image.trim().length > 0
      )
    ),
  ];
}

export default function MonumentDetailPage() {
  const { id } = useParams();

  const [monument, setMonument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMonument() {
      try {
        setLoading(true);
        setError("");

        const response = await getMonumentById(id);

        const data =
          response?.data?.data ||
          response?.data?.monument ||
          response?.data ||
          response?.monument ||
          response;

        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Monument details not found.");
        }

        if (active) {
          setMonument(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load monument details."
          );
          setMonument(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadMonument();
    }

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#f3f5f6]">
        <p className="text-sm tracking-widest text-[#bf6548]">
          EXPLORING HERITAGE...
        </p>
      </section>
    );
  }

  if (error || !monument) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-[#f3f5f6] px-6 text-center">
        <h1 className="font-serif text-3xl text-[#1a2c3b]">
          Monument unavailable
        </h1>

        <p className="mt-3 max-w-lg text-sm text-[#66727d]">
          {error || "The requested monument could not be found."}
        </p>

        <Link
          to="/monuments"
          className="mt-6 rounded-full bg-[#1a2c3b] px-6 py-3 text-sm text-white"
        >
          Explore Monuments
        </Link>
      </section>
    );
  }

  const name =
    monument.name ||
    monument.title ||
    "Untitled Monument";
  const external3dUrl = BHOPAL_COLLECTION.find(
    (entry) =>
      entry.external3dUrl &&
      normalizeMonumentName(entry.name) === normalizeMonumentName(name)
  )?.external3dUrl;

  const location =
    monument.location ||
    [monument.city, monument.state]
      .filter(Boolean)
      .join(", ");

  const category = monument.category || monument.type;

  const period =
    monument.architectural_period ||
    monument.period ||
    monument.era;

  const images = getImages(monument);

  const documents = Array.isArray(monument.documents)
    ? monument.documents
    : [];

  const tags = Array.isArray(monument.tags)
    ? monument.tags
    : [];

  const timeline = Array.isArray(monument.timeline)
    ? monument.timeline
    : [];

  const overview =
    monument.description ||
    monument.overview ||
    monument.summary;

  const history =
    monument.history ||
    monument.historical_significance;

  const architecture =
    monument.architecture ||
    monument.architectural_details;

  const hasCoordinates =
    monument.latitude != null &&
    monument.longitude != null;

  return (
    <div className="min-h-screen bg-[#f3f5f6] text-[#20384b]">
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-10 md:px-12 md:pt-16">
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {category && (
              <span className="rounded-full bg-[#e3e9ed] px-4 py-1.5 text-xs font-medium text-[#1a2c3b]">
                {category}
              </span>
            )}

            {period && (
              <span className="rounded-full bg-[#e3e9ed] px-4 py-1.5 text-xs font-medium text-[#1a2c3b]">
                {period}
              </span>
            )}

            {monument.is_unesco && (
              <span className="rounded-full bg-[#1a2c3b] px-4 py-1.5 text-xs text-white">
                UNESCO Heritage
              </span>
            )}
          </div>

          <h1 className="max-w-4xl font-serif text-4xl leading-tight text-[#1a2c3b] md:text-6xl">
            {name}
          </h1>

          {location && (
            <p className="mt-4 text-sm text-[#66727d]">
              <span className="mr-2">⌖</span>
              {location}
            </p>
          )}

          {external3dUrl && (
            <a
              href={external3dUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Explore ${name} in Bhopal 3D (opens in a new tab)`}
              className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-[#1a2c3b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#2f4658] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf6548]"
            >
              Explore in Bhopal 3D
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>

        {/* Monument image and full-screen preview */}
        <MonumentGallery
          monumentId={id}
          name={name}
          images={images}
        />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <EvidenceGapLens
              monument={monument}
              documents={documents}
            />

            <DetailSection title="Overview">
              <DetailText value={overview} />
            </DetailSection>

            {history && (
              <DetailSection title="Historical Significance">
                <DetailText value={history} />
              </DetailSection>
            )}

            <DetailSection title="Architecture">
              <DetailText value={architecture} />
            </DetailSection>

            {timeline.length > 0 && (
              <DetailSection title="Historical Timeline">
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="relative border-l-2 border-[#bf6548] pl-6"
                    >
                      <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-[#bf6548]" />

                      <p className="font-semibold text-[#1a2c3b]">
                        {item.year || item.date || "Historical period"}
                      </p>

                      <p className="mt-2 text-sm leading-7 text-[#66727d]">
                        {item.description || item.event || item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}

            <DetailSection title="Location">
              <MonumentMap
                latitude={monument.latitude}
                longitude={monument.longitude}
                name={name}
              />
            </DetailSection>

            <DetailSection title="Manuscripts & Digital Archives">
              <ManuscriptReader documents={documents} />
            </DetailSection>

            <DetailSection title="Ask about this record">
              <ArchiveAssistant monumentId={id} />
            </DetailSection>

            <DetailSection title="Related Documents">
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((document, index) => (
                    <div
                      key={document.id || index}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#d2dce2] bg-white/50 p-4"
                    >
                      <div>
                        <p className="font-medium text-[#1a2c3b]">
                          {document.title || "Untitled document"}
                        </p>

                        <p className="mt-1 text-xs text-[#66727d]">
                          {document.category || "Archive"}
                        </p>
                      </div>

                      {(document.file_url || document.file_path) && (
  <a
    href={document.file_url || document.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-[#bf6548] hover:underline"
                        >
                          View Document ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#66727d]">
                  No related documents are available yet.
                </p>
              )}
            </DetailSection>

            {tags.length > 0 && (
              <DetailSection title="Tags">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-[#cfc5b2] px-4 py-2 text-xs text-[#625f54]"
                    >
                      {typeof tag === "string" ? tag : tag.name}
                    </span>
                  ))}
                </div>
              </DetailSection>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-[#d2dce2] bg-[#e8edf0] p-6 lg:sticky lg:top-8">
            <h2 className="font-serif text-xl text-[#1a2c3b]">
              At a Glance
            </h2>

            <div className="mt-6 space-y-5">
              {[
                ["Location", location],
                ["Category", category],
                ["Period", period],
                ["Architect", monument.architect || monument.builder],
                [
                  "Built",
                  monument.construction_year || monument.year_built,
                ],
                [
                  "Coordinates",
                  hasCoordinates
                    ? `${monument.latitude}, ${monument.longitude}`
                    : null,
                ],
              ]
                .filter((item) => item[1])
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="border-b border-[#c8d3db] pb-4"
                  >
                    <p className="text-xs uppercase tracking-wider text-[#5e6b76]">
                      {label}
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#1a2c3b]">
                      {value}
                    </p>
                  </div>
                ))}
            </div>

            {monument.source_url && (
              <a
                href={monument.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block text-sm font-medium text-[#bf6548] hover:underline"
              >
                Explore Source ↗
              </a>
            )}
          </aside>
        </div>
      </section>

      <footer className="border-t border-[#d2dce2] px-5 py-8 text-center text-xs tracking-wide text-[#5e6b76]">
        HERITAGEVERSE · PRESERVING STORIES THROUGH TECHNOLOGY
      </footer>
    </div>
  );
}
