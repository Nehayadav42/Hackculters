export default function EntryList({ entries, selectedId, onSelect }) {
  return (
    <ul id="list">
      {entries.map((entry) => (
        <li key={entry.id}>
          <button type="button" aria-current={entry.id === selectedId} onClick={() => onSelect(entry.id)}>
            <span className="n">{entry.name}</span>
            <span className="c">{entry.period}</span>
            <span className="m">{entry.place}, {entry.state}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
