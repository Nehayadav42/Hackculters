export default function EntryDetail({ entry }) {
  return (
    <div id="detail" aria-live="polite">
      {entry ? (
        <div className="entry-detail-content">
          <span className="archive-label">SELECTED FIELD RECORD</span>

          <h4>{entry.name}</h4>

          <p className="entry-detail-location">
            {entry.place}, {entry.state}
            <span> · </span>
            {entry.period}
          </p>

          <p className="entry-detail-description">{entry.text}</p>
        </div>
      ) : (
        <div className="entry-detail-empty">
          <span aria-hidden="true">↖</span>
          <p>Select a field record or a map marker to explore its details.</p>
        </div>
      )}
    </div>
  );
}