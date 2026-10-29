import { useCallback, useMemo, useState } from "react";
import { ENTRIES } from "../data/entries.js";
import { matchesFilters } from "../utils/search.js";

const ALL = "All";

/** Search text, group filter and selection for the archive. */
export function useArchiveSearch(entries = ENTRIES) {
  const [group, setGroup] = useState(ALL);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const groups = useMemo(() => [ALL, ...new Set(entries.map((e) => e.group))], [entries]);

  const visible = useMemo(
    () => entries.filter((e) => matchesFilters(e, group, query)),
    [entries, group, query]
  );

  const selected = useMemo(
    () => entries.find((e) => e.id === selectedId) ?? null,
    [entries, selectedId]
  );

  // Keep the selection only if it survives the new filters.
  const keepIfVisible = useCallback(
    (nextGroup, nextQuery) =>
      setSelectedId((current) => {
        const entry = entries.find((e) => e.id === current);
        return entry && matchesFilters(entry, nextGroup, nextQuery) ? current : null;
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

  return { groups, group, query, visible, selected, changeQuery, changeGroup, select, jumpToGroup };
}
