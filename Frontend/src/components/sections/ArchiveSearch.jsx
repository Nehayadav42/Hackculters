import Section from "../layout/Section.jsx";
import SearchBar from "../archive/SearchBar.jsx";
import StateChips from "../archive/StateChips.jsx";
import EntryList from "../archive/EntryList.jsx";
import EntryDetail from "../archive/EntryDetail.jsx";
import EntryMap from "../archive/EntryMap.jsx";

export default function ArchiveSearch({ archive }) {
  const {
    groups,
    group,
    query,
    visible,
    selected,
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