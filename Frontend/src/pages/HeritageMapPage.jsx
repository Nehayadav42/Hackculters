import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMapData } from "../services/api.js";
import HeritageMap from "../components/map/HeritageMap.jsx";

function hasValidCoordinates(site) {
  if (
    site.latitude === null ||
    site.latitude === undefined ||
    site.longitude === null ||
    site.longitude === undefined ||
    site.latitude === "" ||
    site.longitude === ""
  ) {
    return false;
  }

  const latitude = Number(site.latitude);
  const longitude = Number(site.longitude);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

export default function HeritageMapPage() {
  const [sites, setSites] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("site") || "";
  const stateFilter = searchParams.get("state") || "";
  const [listOpen, setListOpen] = useState(true);
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
        const selectedOnLoad = new URLSearchParams(window.location.search).get("site");
        if (!selectedOnLoad && firstLocated?.id) {
          setSearchParams({ site: String(firstLocated.id) }, { replace: true });
        }
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
  }, [setSearchParams]);

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

  function updateMapSelection(siteId, state = stateFilter) {
    const nextParams = new URLSearchParams();
    if (state) nextParams.set("state", state);
    if (siteId) nextParams.set("site", String(siteId));
    setSearchParams(nextParams, { replace: true });
  }

  function selectState(value) {
    const nextSite = sites.find(
      (site) =>
        (!value || site.state === value) && hasValidCoordinates(site)
    );
    updateMapSelection(nextSite?.id, value);
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#bf6548]">
            VERIFIED RECORD LOCATIONS
          </p>
          <h1 className="mt-2 font-serif text-3xl text-[#1a2c3b] sm:text-4xl">
            Heritage map
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66727d]">
            Locations are shown only when the backend record supplies valid
            coordinates. Coverage reflects the current archive, not nationwide
            completeness.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-[#66727d]">
            Filter by state
            <select
              value={stateFilter}
              onChange={(event) => selectState(event.target.value)}
              disabled={loading || states.length === 0}
              className="mt-2 block min-w-48 rounded-lg border border-[#d2dce2] bg-[#f8f9fa] px-3 py-2.5 text-sm font-normal text-[#20384b]"
            >
              <option value="">All available states</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setListOpen((open) => !open)}
            aria-expanded={listOpen}
            className="min-h-10 rounded-lg border border-[#cbd4da] bg-white/70 px-4 py-2 text-sm font-medium text-[#344656] transition hover:border-[#bf6548]"
          >
            {listOpen ? "Hide location list" : "Show location list"}
          </button>
        </div>
      </div>

      {loading && (
        <p role="status" className="rounded-xl bg-white/85 p-6 text-sm text-[#66727d]">
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
          <p className="mb-4 text-xs text-[#66727d]">
            {locatedSites.length} of {filteredSites.length} records have valid
            coordinates in this view.
          </p>
          {selectedSite ? (
            <div
              className={`grid gap-5 ${
                listOpen ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]" : ""
              }`}
            >
              <div className="overflow-hidden rounded-xl border border-[#d2dce2] bg-[#f8f9fa]">
              <HeritageMap
                  sites={locatedSites}
                  selectedSiteId={selectedSite.id}
                   onSelectSite={(siteId) => updateMapSelection(siteId)}
                   height={520}
              />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d2dce2] p-4">
                  <div>
                    <h2 className="font-serif text-xl text-[#1a2c3b]">
                      {selectedSite.name || selectedSite.title || "Heritage site"}
                    </h2>
                    <p className="mt-1 text-xs text-[#66727d]">
                      {selectedSite.latitude}, {selectedSite.longitude}
                    </p>
                  </div>
                  {selectedSite.id && (
                    <Link
                      to={`/monuments/${selectedSite.id}`}
                      state={{
                        from: `${window.location.pathname}${window.location.search}`,
                      }}
                      className="text-sm font-semibold text-[#bf6548] hover:underline"
                    >
                      Open record →
                    </Link>
                  )}
                </div>
              </div>

              {listOpen && (
                <div className="max-h-[520px] space-y-2 overflow-y-auto">
                  {locatedSites.map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => updateMapSelection(site.id)}
                      aria-pressed={String(selectedSite.id) === String(site.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        String(selectedSite.id) === String(site.id)
                          ? "border-[#bf6548] bg-[#e8edf0]"
                          : "border-[#d2dce2] bg-[#f8f9fa] hover:border-[#bf6548]"
                      }`}
                    >
                      <span className="block font-medium text-[#1a2c3b]">
                        {site.name || site.title || "Untitled heritage site"}
                      </span>
                      <span className="mt-1 block text-xs text-[#66727d]">
                        {[site.city, site.state].filter(Boolean).join(", ") ||
                          "Location name unavailable"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#c8d3db] p-8 text-center">
              <h2 className="font-serif text-2xl text-[#1a2c3b]">
                No mapped records in this view
              </h2>
              <p className="mt-2 text-sm text-[#66727d]">
                The current API returned no records with valid coordinates.
              </p>
              {filteredSites.length > 0 && (
                <div className="mt-5 space-y-2">
                  {filteredSites.map((site) => (
                    <p key={site.id} className="text-sm text-[#66727d]">
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
