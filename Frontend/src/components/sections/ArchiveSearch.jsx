import Section from "../layout/Section.jsx";
import SearchBar from "../archive/SearchBar.jsx";
import StateChips from "../archive/StateChips.jsx";
import EntryList from "../archive/EntryList.jsx";
import EntryDetail from "../archive/EntryDetail.jsx";
import EntryMap from "../archive/EntryMap.jsx";

export default function ArchiveSearch({ archive }) {
  const { groups, group, query, visible, selected, changeQuery, changeGroup, select } = archive;
  const selectedId = selected ? selected.id : null;

  return (
    <Section id="walk" tone="s1">
      <h2>Search by place, century or what someone noticed</h2>
      <p className="mute">
        Each result is a field entry pinned to where it was found. Try “mosque”, “queen” or “Bhopal”.
      </p>
      <SearchBar value={query} onChange={changeQuery} />
      <StateChips groups={groups} active={group} onSelect={changeGroup} />
      <div className="split">
        <div>
          <EntryList entries={visible} selectedId={selectedId} onSelect={select} />
          <div id="empty" hidden={visible.length > 0}>
            No entry matches. Try a place name or a shorter word.
          </div>
          <EntryDetail entry={selected} />
        </div>
        <EntryMap entries={visible} selectedId={selectedId} onSelect={select} />
      </div>
      <p className="mute" style={{ marginTop: 18, fontSize: 14 }}>
        Sample entries for illustration. The map fits itself to whatever your search returns.
      </p>
    </Section>
  );
}
