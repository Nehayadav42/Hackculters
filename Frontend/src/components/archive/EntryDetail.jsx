export default function EntryDetail({ entry }) {
  return (
    <div id="detail" aria-live="polite">
      {entry ? (
        <>
          <em>{entry.name}</em> in {entry.place}. {entry.text}
        </>
      ) : (
        <span className="mute">Select an entry or a point on the map.</span>
      )}
    </div>
  );
}
