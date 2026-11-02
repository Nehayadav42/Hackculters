
import { useCallback, useEffect, useMemo, useState } from "react";
import { ENTRIES } from "../data/entries.js";
import { matchesFilters } from "../utils/search.js";
import { getMonuments } from "../services/api.js";

const ALL = "All";

// Convert backend records into the format used by existing archive components.
function mapBackendMonument(monument) {
  return {
    id: monument.id,
    name: monument.name?.trim() || "Untitled monument",
    place: monument.city?.trim() || "Unknown location",
    state: monument.state?.trim() || "Unknown state",
    period: monument.architectural_period?.trim() || "Period unknown",
    lon: monument.longitude,
    lat: monument.latitude,
    text: monument.description?.trim() || "",
    kind: monument.category?.trim() || "Heritage",
    group: monument.state?.trim() || "Unknown state",
    historicalDetails: monument.historical_details,
    architecturalDetails: monument.architectural_details,
    timeline: monument.timeline || [],
    tags: monument.tags || [],
    isUnescoSite: monument.is_unesco_site,
    sourceUrl: monument.source_url?.trim() || "",
  };
}

export function useArchiveSearch(initialEntries = ENTRIES) {
  const [entries, setEntries] = useState(initialEntries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [group, setGroup] = useState(ALL);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMonuments() {
      try {
        setLoading(true);
        setError("");

        const response = await getMonuments();
        const backendEntries = response.data.map(mapBackendMonument);

        if (cancelled) return;

        // Backend records take priority over local records with the same name.
        const backendNames = new Set(
          backendEntries.map((entry) => entry.name.toLowerCase())
        );

        const localEntries = initialEntries.filter(
          (entry) => !backendNames.has(entry.name.trim().toLowerCase())
        );

        setEntries([...backendEntries, ...localEntries]);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load archive data.");
          setEntries(initialEntries);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMonuments();

    return () => {
      cancelled = true;
    };
  }, [initialEntries]);

  const groups = useMemo(
    () => [ALL, ...new Set(entries.map((entry) => entry.group))],
    [entries]
  );

  const visible = useMemo(
    () => entries.filter((entry) => matchesFilters(entry, group, query)),
    [entries, group, query]
  );

  const selected = useMemo(
    () => entries.find((entry) => entry.id === selectedId) ?? null,
    [entries, selectedId]
  );

  const keepIfVisible = useCallback(
    (nextGroup, nextQuery) =>
      setSelectedId((current) => {
        const entry = entries.find((item) => item.id === current);

        return entry && matchesFilters(entry, nextGroup, nextQuery)
          ? current
          : null;
      }),
    [entries]
  );

  const changeQuery = useCallback(
    (nextQuery) => {
      setQuery(nextQuery);
      keepIfVisible(group, nextQuery);
    },
    [group, keepIfVisible]
  );

  const changeGroup = useCallback(
    (nextGroup) => {
      setGroup(nextGroup);
      keepIfVisible(nextGroup, query);
    },
    [query, keepIfVisible]
  );

  const select = useCallback((id) => setSelectedId(id), []);

  const jumpToGroup = useCallback((nextGroup, id = null) => {
    setGroup(nextGroup);
    setQuery("");
    setSelectedId(id);
  }, []);

  return {
    groups,
    group,
    query,
    visible,
    selected,
    loading,
    error,
    changeQuery,
    changeGroup,
    select,
    jumpToGroup,
  };
}
