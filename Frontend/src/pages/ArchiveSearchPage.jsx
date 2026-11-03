import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchArchives } from "../services/api.js";

function getMonumentName(monument) {
  return monument.name || monument.title || "Untitled heritage site";
}

export default function ArchiveSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({
    query: "",
    monuments: [],
    documents: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      return undefined;
    }

    let active = true;

    async function loadResults() {
      setLoading(true);
      setError("");
      try {
        const response = await searchArchives(query.trim());
        if (!active) return;
        const data = response.results || {};
        setResults({
          query,
          monuments: Array.isArray(data.monuments) ? data.monuments : [],
          documents: Array.isArray(data.documents) ? data.documents : [],
        });
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Archive search is unavailable."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResults();

    return () => {
      active = false;
    };
  }, [query]);

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextQuery = String(formData.get("q") || "").trim();
    setSearchParams(nextQuery ? { q: nextQuery } : {});
  }

  const queryResults =
    results.query === query ? results : { monuments: [], documents: [] };

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#bf6548]">
          SOURCE-BASED ARCHIVE LOOKUP
        </p>
        <h1 className="mt-2 font-serif text-3xl text-[#1a2c3b] sm:text-4xl">
          Search the archive
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66727d]">
          Search currently indexed monument names, descriptions, document
          titles, and extracted text. This is the backend&apos;s text-match
          search, not semantic search or an AI answer.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-xl border border-[#d2dce2] bg-[#f8f9fa] p-4 sm:flex-row sm:p-5"
      >
        <label className="sr-only" htmlFor="archive-search-input">
          Search monuments and documents
        </label>
        <input
          key={query}
          id="archive-search-input"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Try a monument, place, or document term"
          className="min-w-0 flex-1 rounded-lg border border-[#d2dce2] bg-[#f8f9fa] px-4 py-3 text-sm text-[#20384b] outline-none focus:border-[#bf6548]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#1a2c3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#344d61] disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search archive"}
        </button>
      </form>

      {error && query.trim() && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Search failed: {error}
        </div>
      )}

      {!query.trim() && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-[#c8d3db] p-8 text-center text-sm text-[#66727d]">
          Enter a keyword to search indexed monuments and documents.
        </p>
      )}

      {query.trim() && !loading && !error && (
        <div className="mt-8 space-y-10">
          <section aria-labelledby="monument-results-heading">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2
                id="monument-results-heading"
                className="font-serif text-2xl text-[#1a2c3b]"
              >
                Monuments
              </h2>
              <span className="text-xs text-[#66727d]">
                {queryResults.monuments.length} result
                {queryResults.monuments.length === 1 ? "" : "s"}
              </span>
            </div>
            {queryResults.monuments.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {queryResults.monuments.map((monument) => (
                  <Link
                    key={monument.id}
                    to={`/monuments/${monument.id}`}
                    className="rounded-xl border border-[#d2dce2] bg-[#f8f9fa] p-5 transition hover:border-[#bf6548] hover:shadow-md"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#bf6548]">
                      {monument.category || "MONUMENT"}
                    </p>
                    <h3 className="mt-2 font-serif text-xl text-[#1a2c3b]">
                      {getMonumentName(monument)}
                    </h3>
                    <p className="mt-2 text-sm text-[#66727d]">
                      {[monument.state].filter(Boolean).join(", ") ||
                        "Location not provided"}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-white/80 p-5 text-sm text-[#66727d]">
                No monument matches were returned.
              </p>
            )}
          </section>

          <section aria-labelledby="document-results-heading">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2
                id="document-results-heading"
                className="font-serif text-2xl text-[#1a2c3b]"
              >
                Documents
              </h2>
              <span className="text-xs text-[#66727d]">
                {queryResults.documents.length} result
                {queryResults.documents.length === 1 ? "" : "s"}
              </span>
            </div>
            {queryResults.documents.length ? (
              <div className="space-y-3">
                {queryResults.documents.map((document) => (
                  <article
                    key={document.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#d2dce2] bg-[#f8f9fa] p-5"
                  >
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-[#bf6548]">
                        {document.category || "DOCUMENT"}
                      </p>
                      <h3 className="mt-2 font-serif text-xl text-[#1a2c3b]">
                        {document.title || "Untitled document"}
                      </h3>
                    </div>
                    {document.monument_id ? (
                      <Link
                        to={`/monuments/${document.monument_id}`}
                        className="text-sm font-semibold text-[#bf6548] hover:underline"
                      >
                        Open associated record →
                      </Link>
                    ) : document.file_url ? (
                      <a
                        href={document.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-[#bf6548] hover:underline"
                      >
                        Open source file ↗
                      </a>
                    ) : (
                      <span className="text-xs text-[#66727d]">
                        No linked monument or file
                      </span>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-white/80 p-5 text-sm text-[#66727d]">
                No document matches were returned.
              </p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
