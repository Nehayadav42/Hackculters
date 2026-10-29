import { useMemo } from "react";
import { computeMapView } from "../../utils/mapProjection.js";
import MapGrid from "./MapGrid.jsx";
import MapPoint from "./MapPoint.jsx";

export default function EntryMap({ entries, selectedId, onSelect }) {
  const view = useMemo(() => computeMapView(entries), [entries]);

  return (
    <svg
      id="map"
      className={view?.allLabelsFit ? "all" : undefined}
      viewBox="0 0 600 520"
      role="img"
      aria-label="Map of field entries across Gujarat, Rajasthan and Delhi"
    >
      {view && (
        <>
          <MapGrid meridians={view.meridians} parallels={view.parallels} />
          {view.points.map(({ entry, x, y }) => (
            <MapPoint
              key={entry.id}
              entry={entry}
              x={x}
              y={y}
              selected={entry.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </>
      )}
    </svg>
  );
}
