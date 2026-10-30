export default function EntryList({ entries, selectedId, onSelect }) {
  return (
    <ul id="list">
      {entries.map((entry, index) => {
        const isSelected = entry.id === selectedId;

        return (
          <li key={entry.id}>
            <button
              type="button"
              className={isSelected ? "entry-selected" : ""}
              aria-current={isSelected ? "true" : undefined}
              onClick={() => onSelect(entry.id)}
            >
              <span className="entry-index">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="n">{entry.name}</span>

              <span className="c">{entry.period}</span>

              <span className="m">
                {entry.place}, {entry.state}
              </span>

              <span className="entry-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}