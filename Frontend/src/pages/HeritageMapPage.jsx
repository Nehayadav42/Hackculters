import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMapData } from "../services/api.js";

function hasValidCoordinates(site) {
  const latitude = Number(site.latitude);
  const longitude = Number(site.longitude);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

function mapEmbedUrl(site) {
  const latitude = Number(site.latitude);
  const longitude = Number(site.longitude);
  const span = 0.02;
  const bounds = [
    longitude - span,
    latitude - span,
    longitude + span,
    latitude + span,
  ]
    .map((value) => value.toFixed(5))
    .join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bounds}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

export default function HeritageMapPage() {
  const [sites, setSites] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getMapData()
      .then((response) => {
        if (!active) return;
        const records = Array.isArray(response.data) ? response.data : [];
        setSites(records);
        const firstLocated = records.find(hasValidCoordinates);
        setSelectedId(firstLocated?.id || "");
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load monument locations."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const states = useMemo(
    () =>
      [...new Set(sites.map((site) => site.state).filter(Boolean))].sort(),
    [sites]
  );
  const filteredSites = useMemo(
    () =>
      sites.filter(
        (site) => !stateFilter || site.state === stateFilter
      ),
    [sites, stateFilter]
  );
  const locatedSites = filteredSites.filter(hasValidCoordinates);
  const selectedSite =
    locatedSites.find((site) => String(site.id) === String(selectedId)) ||
    locatedSites[0];

  function selectState(value) {
    setStateFilter(value);
    const nextSite = sites.find(
      (site) =>
        (!value || site.state === value) && hasValidCoordinates(site)
    );
    setSelectedId(nextSite?.id || "");
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#a17b43]">
            VERIFIED RECORD LOCATIONS
          </p>
          <h1 className="mt-2 font-serif text-3xl text-[#183b32] sm:text-4xl">
            Heritage map
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5e655d]">
            Locations are shown only when the backend record supplies valid
            coordinates. Coverage reflects the current archive, not nationwide
            completeness.
          </p>
        </div>
        <label className="text-xs font-semibold text-[#53675d]">
          Filter by state
          <select
            value={stateFilter}
            onChange={(event) => selectState(event.target.value)}
            disabled={loading || states.length === 0}
            className="mt-2 block min-w-48 rounded-lg border border-[#e1dacb] bg-[#fffdf7] px-3 py-2.5 text-sm font-normal text-[#263b30]"
          >
            <option value="">All available states</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <p role="status" className="rounded-xl bg-white/85 p-6 text-sm text-[#5e655d]">
          Loading monument locations...
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          The map data could not be loaded: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <p className="mb-4 text-xs text-[#5e655d]">
            {locatedSites.length} of {filteredSites.length} records have valid
            coordinates in this view.
          </p>
          {selectedSite ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
              <div className="overflow-hidden rounded-xl border border-[#e5dfd1] bg-[#fffdf7]">
                <iframe
                  title={`Map location for ${selectedSite.name || "heritage site"}`}
                  src={mapEmbedUrl(selectedSite)}
                  loading="lazy"
                  className="h-[420px] w-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5dfd1] p-4">
                  <div>
                    <h2 className="font-serif text-xl text-[#183b32]">
                      {selectedSite.name || selectedSite.title || "Heritage site"}
                    </h2>
                    <p className="mt-1 text-xs text-[#5e655d]">
                      {selectedSite.latitude}, {selectedSite.longitude}
                    </p>
                  </div>
                  {selectedSite.id && (
                    <Link
                      to={`/monuments/${selectedSite.id}`}
                      className="text-sm font-semibold text-[#a17b43] hover:underline"
                    >
                      Open record →
                    </Link>
                  )}
                </div>
              </div>

              <div className="max-h-[500px] space-y-2 overflow-y-auto">
                {locatedSites.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setSelectedId(site.id)}
                    aria-pressed={String(selectedSite.id) === String(site.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      String(selectedSite.id) === String(site.id)
                        ? "border-[#a17b43] bg-[#efe8d8]"
                        : "border-[#e5dfd1] bg-[#fffdf7] hover:border-[#c49a58]"
                    }`}
                  >
                    <span className="block font-medium text-[#183b32]">
                      {site.name || site.title || "Untitled heritage site"}
                    </span>
                    <span className="mt-1 block text-xs text-[#5e655d]">
                      {[site.city, site.state].filter(Boolean).join(", ") ||
                        "Location name unavailable"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#d8cfbd] p-8 text-center">
              <h2 className="font-serif text-2xl text-[#183b32]">
                No mapped records in this view
              </h2>
              <p className="mt-2 text-sm text-[#5e655d]">
                The current API returned no records with valid coordinates.
              </p>
              {filteredSites.length > 0 && (
                <div className="mt-5 space-y-2">
                  {filteredSites.map((site) => (
                    <p key={site.id} className="text-sm text-[#5e655d]">
                      {site.name || site.title || "Untitled record"} — location
                      coordinates unavailable
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
