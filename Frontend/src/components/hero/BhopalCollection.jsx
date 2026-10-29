export default function BhopalCollection({ entries, onOpen, style }) {
  return (
    <aside className="bh intro" style={style} aria-label="Bhopal collection">
      <h2>From the Bhopal collection</h2>
      <p>Sample entries. Select one to open it on the map.</p>
      <ul id="bh">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button type="button" onClick={() => onOpen(entry.id)}>
              <span className="n">{entry.name}</span>
              <span className="c">{entry.period}</span>
              <span className="k">{entry.kind}, {entry.place}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
