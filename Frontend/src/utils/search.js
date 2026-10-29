/** True when an entry belongs to the active group and matches the search text. */
export function matchesFilters(entry, group, query) {
  const q = query.trim().toLowerCase();
  const inGroup = group === "All" || entry.group === group;
  if (!inGroup) return false;
  if (!q) return true;
  const haystack = [entry.name, entry.place, entry.state, entry.period, entry.text].join(" ");
  return haystack.toLowerCase().includes(q);
}
