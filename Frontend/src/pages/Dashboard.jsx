import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { getMonuments, uploadArchiveFile } from "../services/api.js";
import "../styles/dashboard.css";
import OcrViewer from "../components/OcrViewer.jsx";

const FEATURED = [
  {
    number: "01",
    title: "Explore Monuments",
    description: "Discover India's architectural treasures and historical landmarks.",
    action: "Explore collection",
    target: "explore",
    icon: "⌖",
  },
  {
    number: "02",
    title: "Read Manuscripts",
    description: "Open digitized texts attached to individual monument records.",
    action: "Browse monument records",
    target: "explore",
    icon: "▤",
  },
  {
    number: "03",
    title: "3D Heritage Explorer",
    description: "Explore the interactive architectural visualization inside your workspace.",
    action: "Open the experience",
    target: "3d",
    icon: "◈",
  },
];

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-[#a17b43]">
          {eyebrow}
        </p>

        <h2 className="font-serif text-3xl text-[#263b30] sm:text-4xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5e655d]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function MonumentCard({ monument, index }) {
  const image =
    monument.thumbnail_url ||
    monument.image_url ||
    monument.cover_image ||
    monument.image;
  const location = [monument.city, monument.state].filter(Boolean).join(", ");

  return (
    <Link
      to={`/monuments/${monument.id}`}
      className="dashboard-card group block overflow-hidden rounded-xl border border-[#e5dfd1] bg-[#fffdf7] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#d8d0bd]">
        {image ? (
          <img
            src={image}
            alt={monument.name || "Heritage site"}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#31594b] via-[#9b8968] to-[#d4c19b]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#142b25]/75 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[9px] tracking-[0.16em] text-white backdrop-blur">
          {monument.category || "HERITAGE SITE"}
        </span>
        {!image && (
          <span className="absolute right-4 top-1 font-serif text-6xl text-white/30">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-[#a17b43]">
          {monument.architectural_period || "HISTORICAL RECORD"}
        </p>

        <h3 className="mt-2 font-serif text-xl text-[#263b30]">
          {monument.name}
        </h3>

        <p className="mt-1 text-xs text-[#5f6259]">
          {location || "Location not available"}
        </p>

        <p className="mt-4 line-clamp-3 text-xs leading-6 text-[#5e655d]">
          {monument.description ||
            "Explore the historical and architectural record of this heritage site."}
        </p>

        <div className="mt-4 border-t border-[#e9e3d7] pt-4">
          <span className="text-xs font-semibold text-[#98713e]">
            Explore details ↗
          </span>
        </div>
      </div>
    </Link>
  );
}

function Overview({
  user,
  onNavigate,
  monuments,
  monumentsLoading,
  monumentsError,
}) {
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Explorer";

  return (
    <>
      <section className="relative mb-9 overflow-hidden rounded-2xl bg-[#1d4034] px-6 py-9 text-white sm:px-10 sm:py-12">
        <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -right-2 -top-12 h-56 w-56 rounded-full border border-white/10" />
        <div className="absolute -bottom-24 right-32 h-64 w-64 rounded-full border border-white/10" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-[10px] font-semibold tracking-[0.25em] text-[#d5b77c]">
            YOUR HERITAGE JOURNEY BEGINS HERE
          </p>

          <h2 className="font-serif text-3xl leading-tight sm:text-5xl">
            Welcome back,
            <br />
            <span className="italic text-[#d5b77c]">
              {displayName}.
            </span>
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-7 text-white/85">
            Discover the stories, architecture and knowledge that shaped
            our history. Your personal space to explore India's cultural heritage.
          </p>

          <button
            type="button"
            onClick={() => onNavigate("explore")}
            className="mt-7 rounded-full bg-[#d2b477] px-6 py-3 text-xs font-bold tracking-wide text-[#19251d] transition hover:bg-[#e2c991]"
          >
            Start Exploring <span className="ml-2">↗</span>
          </button>
        </div>
      </section>

      <section className="mb-10">
        <SectionHeading
          eyebrow="YOUR WORKSPACE"
          title="Discover more."
          description="Everything you need to explore, understand and engage with cultural heritage."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURED.map((item) => (
            <button
              key={item.number}
              type="button"
              onClick={() => onNavigate(item.target)}
              className="group rounded-xl border border-[#e5dfd1] bg-[#fffdf7] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-[#c4a36b] hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-3xl text-[#b79b6c]">
                  {item.icon}
                </span>

                <span className="text-[10px] tracking-widest text-[#5f6259]">
                  {item.number}
                </span>
              </div>

              <h3 className="mt-6 font-serif text-xl text-[#263b30]">
                {item.title}
              </h3>

              <p className="mt-2 min-h-[48px] text-xs leading-6 text-[#5e655d]">
                {item.description}
              </p>

              <p className="mt-5 text-xs font-semibold text-[#98713e]">
                {item.action}{" "}
                <span className="ml-1 transition group-hover:ml-2">
                  →
                </span>
              </p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="FROM THE ARCHIVE"
          title="Featured heritage."
          description="A few live records from the HeritageVerse collection."
          action={
            <button
              type="button"
              onClick={() => onNavigate("explore")}
              className="text-xs font-semibold text-[#98713e] hover:text-[#263b30]"
            >
              View all monuments →
            </button>
          }
        />

        {monumentsLoading ? (
          <div
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Loading featured heritage records"
          >
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-xl border border-[#e5dfd1] bg-[#fffdf7]"
              >
                <div className="aspect-[16/10] bg-[#e8e1d2]" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 rounded bg-[#e8e1d2]" />
                  <div className="h-5 w-2/3 rounded bg-[#e8e1d2]" />
                  <div className="h-3 w-1/2 rounded bg-[#e8e1d2]" />
                </div>
              </div>
            ))}
          </div>
        ) : monumentsError ? (
          <div
            role="alert"
            className="rounded-xl border border-[#e5c9bb] bg-[#fff8f4] p-6 text-sm text-[#8b5546]"
          >
            <p className="font-semibold">The live archive could not be loaded.</p>
            <p className="mt-2">{monumentsError}</p>
            <p className="mt-2 text-xs">
              This collection is connected to the heritage archive service; no
              sample records are shown when the service is unavailable.
            </p>
          </div>
        ) : monuments.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {monuments.slice(0, 3).map((monument, index) => (
              <MonumentCard
                key={monument.id}
                monument={monument}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#d9d0bf] bg-[#fffdf7] p-8 text-center">
            <p className="font-serif text-xl text-[#263b30]">
              The collection is waiting for its first records.
            </p>
            <p className="mt-2 text-sm text-[#5e655d]">
              There are no heritage sites available from the archive yet.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function EmptySection({ type, onNavigate }) {
  const content = {
    saved: {
      eyebrow: "YOUR COLLECTION",
      title: "Saved discoveries.",
      description: "A personal bookmark collection is not connected to the current account database yet.",
      action: "Browse the archive",
      target: "explore",
    },
    manuscripts: {
      eyebrow: "DIGITAL ARCHIVE",
      title: "Manuscript library.",
      description: "Archive documents are available from each monument record. There is no separate manuscript listing endpoint in the current API.",
      action: "Find manuscripts",
      target: "explore",
    },
  };

  const item = content[type];

  return (
    <div className="max-w-2xl">
      <SectionHeading
        eyebrow={item.eyebrow}
        title={item.title}
        description={item.description}
      />

      <div className="rounded-2xl border border-dashed border-[#d9d0bf] bg-[#fffdf7] px-6 py-14 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eee7d8] font-serif text-2xl text-[#98713e]">
          {type === "saved"
            ? "♡"
            : type === "manuscripts"
              ? "▤"
              : "✧"}
        </div>

        <h3 className="mt-5 font-serif text-2xl text-[#263b30]">
          {type === "saved" ? "Not available yet." : "Start with a monument."}
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#5e655d]">
          {type === "saved"
            ? "Saved discoveries need a user-specific storage endpoint before this can persist between visits."
            : "Open a monument record to explore its related digitized documents."}
        </p>

        <button
          type="button"
          onClick={() => onNavigate(item.target)}
          className="mt-6 rounded-full bg-[#1d4034] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#2b5947]"
        >
          {item.action} →
        </button>
      </div>
    </div>
  );
}

function Contributions({ monuments, loading, error }) {
  const formRef = useRef(null);
  const [monumentId, setMonumentId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Manuscript");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setUploadError("");
    setUploadMessage("");

    if (!file || !monumentId) {
      setUploadError("Choose a monument and a file before submitting.");
      return;
    }

    const supportedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (
      (file.type && !supportedTypes.includes(file.type)) ||
      !/\.(jpe?g|png|pdf)$/i.test(file.name)
    ) {
      setUploadError("Choose a JPG, PNG, or PDF file.");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadArchiveFile({
        file,
        monumentId,
        title: title.trim() || file.name,
        category,
      });
      const savedTitle = result.document?.title || title.trim() || file.name;
      setUploadMessage(
        `"${savedTitle}" was uploaded and linked to the selected monument. OCR is not reliable yet: the current worker stores fixed sample text, so no transcription is being presented as extracted content.`
      );
      setTitle("");
      setFile(null);
      formRef.current?.reset();
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Unable to submit this archive item."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <SectionHeading
        eyebrow="COMMUNITY ARCHIVE"
        title="Contribute a record."
        description="Upload a JPG, PNG, or PDF and associate it with an existing monument record. The current backend stores the file and document metadata, but its OCR worker writes fixed sample text rather than extracting your file."
      />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-2xl border border-[#e5dfd1] bg-[#fffdf7] p-6 shadow-sm sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[#53675d]">
            Associated monument
            <select
              value={monumentId}
              onChange={(event) => setMonumentId(event.target.value)}
              required
              disabled={loading || monuments.length === 0}
              className="mt-2 h-12 w-full rounded-lg border border-[#e1dacb] bg-[#faf8f2] px-3 text-sm font-normal text-[#263b30] outline-none focus:border-[#a17b43] disabled:opacity-60"
            >
              <option value="">
                {loading ? "Loading archive..." : "Select a monument"}
              </option>
              {monuments.map((monument) => (
                <option key={monument.id} value={monument.id}>
                  {monument.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-[#53675d]">
            Archive item type
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-[#e1dacb] bg-[#faf8f2] px-3 text-sm font-normal text-[#263b30] outline-none focus:border-[#a17b43]"
            >
              <option>Manuscript</option>
              <option>Document</option>
              <option>Photograph</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-[#53675d] sm:col-span-2">
            Title <span className="font-normal text-[#5f6259]">(optional)</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              type="text"
              maxLength={160}
              placeholder="Give this archive item a title"
              className="mt-2 h-12 w-full rounded-lg border border-[#e1dacb] bg-[#faf8f2] px-3 text-sm font-normal text-[#263b30] outline-none placeholder:text-[#5f6259] focus:border-[#a17b43]"
            />
          </label>

          <label className="text-xs font-semibold text-[#53675d] sm:col-span-2">
            File
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              required
              className="mt-2 block w-full rounded-lg border border-dashed border-[#cfc5b2] bg-[#faf8f2] px-3 py-4 text-sm font-normal text-[#53675d] file:mr-4 file:rounded-full file:border-0 file:bg-[#183b32] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
            />
            <span className="mt-2 block font-normal text-[#5f6259]">
              Supported by the current upload service: JPG, PNG, and PDF. No
              extracted text, translation, or processing progress is returned.
            </span>
          </label>
        </div>

        <p className="mt-5 rounded-lg border border-[#e5dfd1] bg-[#f7f3e8] px-4 py-3 text-xs leading-5 text-[#5e655d]">
          Source/provenance notes are not accepted or stored by the current
          upload endpoint. Keep a note of your source until the backend adds
          provenance fields.
        </p>

        {error && (
          <p role="alert" className="mt-5 text-sm text-[#8b5546]">
            Monument records could not be loaded: {error}
          </p>
        )}
        {uploadError && (
          <p role="alert" className="mt-5 text-sm text-[#8b5546]">
            {uploadError}
          </p>
        )}
        {uploadMessage && (
          <p role="status" className="mt-5 text-sm text-[#31594b]">
            {uploadMessage}
          </p>
        )}
        {uploading && (
          <p role="status" className="mt-5 text-sm text-[#5e655d]">
            Uploading file... Keep this page open until the server responds.
          </p>
        )}

        <button
          type="submit"
          disabled={uploading || loading || monuments.length === 0}
          className="mt-6 rounded-full bg-[#183b32] px-6 py-3 text-xs font-semibold tracking-wide text-white transition hover:bg-[#285548] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Submitting archive item..." : "Submit contribution"}
        </button>
      </form>
    </>
  );
}

function Profile({ user }) {
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Explorer";

  return (
    <>
      <SectionHeading
        eyebrow="ACCOUNT SETTINGS"
        title="Your profile."
        description="Your account information and personal details."
      />

      <div className="max-w-2xl rounded-2xl border border-[#e5dfd1] bg-[#fffdf7] p-6 sm:p-8">
        <div className="flex items-center gap-4 border-b border-[#e9e3d7] pb-6">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#1d4034] font-serif text-3xl text-[#d5b77c]">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-serif text-2xl text-[#263b30]">
              {displayName}
            </h3>
            <p className="mt-1 text-xs text-[#5f6259]">
              HeritageVerse Explorer
            </p>
          </div>
        </div>

        <div className="space-y-5 pt-6">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-[#a17b43]">
              FULL NAME
            </p>
            <p className="mt-2 text-sm text-[#263b30]">
              {displayName}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-widest text-[#a17b43]">
              EMAIL ADDRESS
            </p>
            <p className="mt-2 break-all text-sm text-[#263b30]">
              {user?.email || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-widest text-[#a17b43]">
              ACCOUNT CREATED
            </p>
            <p className="mt-2 text-sm text-[#263b30]">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Not available"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const active = searchParams.get("section") || "overview";
  const [monuments, setMonuments] = useState([]);
  const [monumentsLoading, setMonumentsLoading] = useState(true);
  const [monumentsError, setMonumentsError] = useState("");

  useEffect(() => {
    let activeRequest = true;

    async function loadMonuments() {
      try {
        const response = await getMonuments();

        if (activeRequest) {
          setMonuments(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (activeRequest) {
          setMonumentsError(
            error instanceof Error
              ? error.message
              : "Unable to load heritage records."
          );
        }
      } finally {
        if (activeRequest) setMonumentsLoading(false);
      }
    }

    loadMonuments();

    return () => {
      activeRequest = false;
    };
  }, []);

  const handleNavigate = (section) => {
    if (section === "explore") {
      navigate("/monuments");
      return;
    }

    if (section === "3d") {
      navigate("/explorer");
      return;
    }

    if (section === "search") {
      navigate("/archive/search");
      return;
    }

    if (section === "map") {
      navigate("/map");
      return;
    }

    navigate(
      section === "overview" ? "/dashboard" : `/dashboard?section=${section}`
    );
  };

  return (
    <>
      {active === "overview" && (
        <Overview
          user={user}
          onNavigate={handleNavigate}
          monuments={monuments}
          monumentsLoading={monumentsLoading}
          monumentsError={monumentsError}
        />
      )}

      {active === "saved" && (
        <EmptySection type="saved" onNavigate={handleNavigate} />
      )}

      {active === "manuscripts" && (
        <div className="w-full">
          <SectionHeading
            eyebrow="DIGITAL ARCHIVE INTELLIGENCE"
            title="Manuscript OCR & Translation Hub."
            description="Upload historical images, scanned PDFs, or text documents to run local PaddleOCR text extraction, deep translation, and Roman transliteration independently."
          />
          <div className="mt-6 w-full">
            <OcrViewer />
          </div>
        </div>
      )}

      {active === "contributions" && (
        <Contributions
          monuments={monuments}
          loading={monumentsLoading}
          error={monumentsError}
        />
      )}

      {active === "profile" && <Profile user={user} />}
    </>
  );
}