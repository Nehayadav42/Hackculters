import Section from "../layout/Section.jsx";
import SearchBar from "../archive/SearchBar.jsx";
import StateChips from "../archive/StateChips.jsx";
import EntryList from "../archive/EntryList.jsx";
import EntryDetail from "../archive/EntryDetail.jsx";
import EntryMap from "../archive/EntryMap.jsx";
import { Link } from "react-router-dom";

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
    className="inline-flex items-center gap-3 bg-[#183b32] px-5 py-3 text-xs font-semibold uppercase tracking-widest text-[#f5f2e9] transition hover:bg-[#285548]"
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
                <span className="archive-label">GEOGRAPHICAL INDEX</span>
                <h3>Explore by location</h3>
              </div>

              <span className="map-indicator">● LIVE INDEX</span>
            </div>

            <div className="archive-map">
              <EntryMap
                entries={visible}
                selectedId={selectedId}
                onSelect={select}
              />
            </div>

            <div className="archive-map-footer">
              <span>Select a point to explore its record</span>
              <span>INTERACTIVE MAP</span>
            </div>
          </div>

        </div>
      </div>
    </Section>
  );
}