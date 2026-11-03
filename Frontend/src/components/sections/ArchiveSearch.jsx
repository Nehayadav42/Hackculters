import Section from "../layout/Section.jsx";
import SearchBar from "../archive/SearchBar.jsx";
import StateChips from "../archive/StateChips.jsx";
import EntryList from "../archive/EntryList.jsx";
import EntryDetail from "../archive/EntryDetail.jsx";
import OpenStreetMapFrame from "../archive/OpenStreetMapFrame.jsx";
import { Link } from "react-router-dom";

function hasCoordinates(entry) {
  const latitude = entry.lat ?? entry.latitude;
  const longitude = entry.lon ?? entry.longitude;
  return (
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Math.abs(Number(latitude)) <= 90 &&
    Math.abs(Number(longitude)) <= 180
  );
}

export default function ArchiveSearch({ archive }) {
  const {
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
} = archive;

  const selectedId = selected?.id ?? null;
  const mapEntry =
    selected && hasCoordinates(selected)
      ? selected
      : visible.find(hasCoordinates);
  const mapLatitude = mapEntry?.lat ?? mapEntry?.latitude;
  const mapLongitude = mapEntry?.lon ?? mapEntry?.longitude;

  return (
    <Section id="walk" tone="s1">
      <div className="archive-section">

        <div className="archive-heading">
          <div className="archive-eyebrow">
            <span>THE DIGITAL ARCHIVE</span>
            <span>02 / DISCOVER</span>
          </div>

          <h2>
            Discover stories
            <span> written in stone.</span>
          </h2>

          <p className="archive-intro mute">
            Explore architectural heritage, historical field records
            and cultural discoveries through a growing digital archive.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
  <Link
    to="/monuments"
    className="inline-flex items-center gap-3 bg-[#1a2c3b] px-5 py-3 text-xs font-semibold uppercase tracking-widest text-[#f3f5f6] transition hover:bg-[#344d61]"
  >
    Explore all monuments
    <span>↗</span>
  </Link>
</div>

        <div className="archive-search-panel">
          <div className="archive-search-heading">
            <div>
              <span className="archive-label">EXPLORE THE COLLECTION</span>
              <h3>What are you looking for?</h3>
            </div>

            <span className="archive-index">ARCHIVE / 001</span>
          </div>

          <SearchBar value={query} onChange={changeQuery} />

          <div className="archive-filter-heading">
            <span>FILTER BY REGION</span>
            <span>{visible.length} RECORDS FOUND</span>
          </div>

          <StateChips
            groups={groups}
            active={group}
            onSelect={changeGroup}
          />

          {loading && (
  <p className="archive-status" role="status">
    Loading heritage records...
  </p>
)}

{error && (
  <p className="archive-status archive-error" role="alert">
    Live archive unavailable: {error}
    Showing locally available records instead.
  </p>
)}
        </div>

        <div className="archive-workspace">

          <div className="archive-results">
            <div className="archive-results-heading">
              <div>
                <span className="archive-label">FIELD RECORDS</span>
                <h3>Discoveries</h3>
              </div>

              <span className="archive-count">
                {visible.length.toString().padStart(2, "0")}
              </span>
            </div>

            {visible.length > 0 ? (
              <EntryList
                entries={visible}
                selectedId={selectedId}
                onSelect={select}
              />
            ) : (
              <div className="archive-empty">
                <span aria-hidden="true">⌕</span>
                <h4>No records found</h4>
                <p>Try another keyword or select a different region.</p>
              </div>
            )}

            <EntryDetail entry={selected} />
          </div>

          <div className="archive-map-panel">
            <div className="archive-map-heading">
              <div>
                <span className="archive-label">RECORD LOCATION</span>
                <h3>{mapEntry?.name || "Map preview"}</h3>
              </div>

              <span className="map-indicator">OPENSTREETMAP</span>
            </div>

            <div className="archive-map">
              <OpenStreetMapFrame
                latitude={mapLatitude}
                longitude={mapLongitude}
                title={mapEntry?.name}
                height={390}
              />
            </div>

            <div className="archive-map-footer">
              <span>
                {mapEntry
                  ? `${mapEntry.place || mapEntry.state || "Heritage location"}`
                  : "Select a record with coordinates"}
              </span>
              <Link to="/map" className="font-semibold text-[#bf6548] hover:underline">
                Open full map ↗
              </Link>
            </div>
          </div>

        </div>
      </div>
    </Section>
  );
}