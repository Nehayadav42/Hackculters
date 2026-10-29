/**
 * Fits the SVG map to whichever entries are currently visible.
 * Returns grid lines, projected points and whether every label can stay visible.
 */
const LON_STRETCH = 0.91;
const GRID_STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2];
const LABEL_CLEARANCE = 90;

export function computeMapView(entries) {
  if (!entries.length) return null;

  const lons = entries.map((e) => e.lon);
  const lats = entries.map((e) => e.lat);
  const lonMin = Math.min(...lons), lonMax = Math.max(...lons);
  const latMin = Math.min(...lats), latMax = Math.max(...lats);
  const centerLon = (lonMin + lonMax) / 2;
  const centerLat = (latMin + latMax) / 2;

  const fitted = Math.min(
    460 / (Math.max(lonMax - lonMin, 0.04) * LON_STRETCH * 1.3),
    400 / (Math.max(latMax - latMin, 0.04) * 1.3)
  );
  const scale = Math.min(fitted, 9000);

  const projectX = (lon) => 300 + (lon - centerLon) * LON_STRETCH * scale;
  const projectY = (lat) => 260 - (lat - centerLat) * scale;

  const lonSpan = 540 / scale / LON_STRETCH;
  const latSpan = 460 / scale;
  const step = GRID_STEPS.find((s) => Math.max(lonSpan, latSpan) / s <= 6) || 2;
  const decimals = step < 0.1 ? 2 : step < 1 ? 1 : 0;

  const meridians = [];
  for (let x = Math.ceil((centerLon - lonSpan / 2) / step) * step; x <= centerLon + lonSpan / 2; x += step) {
    meridians.push({ px: projectX(x), label: `${x.toFixed(decimals)}°E` });
  }
  const parallels = [];
  for (let y = Math.ceil((centerLat - latSpan / 2) / step) * step; y <= centerLat + latSpan / 2; y += step) {
    parallels.push({ py: projectY(y), label: `${y.toFixed(decimals)}°N` });
  }

  const points = entries.map((entry) => ({ entry, x: projectX(entry.lon), y: projectY(entry.lat) }));

  const allLabelsFit = points.every((a, i) =>
    points.slice(i + 1).every((b) => Math.hypot(a.x - b.x, a.y - b.y) >= LABEL_CLEARANCE)
  );

  return { meridians, parallels, points, allLabelsFit };
}
