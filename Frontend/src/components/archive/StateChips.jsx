export default function StateChips({ groups, active, onSelect }) {
  return (
    <div className="chips" id="chips" role="group" aria-label="Filter by state">
      {groups.map((group) => (
        <button
          key={group}
          type="button"
          className="chip"
          aria-pressed={group === active}
          onClick={() => onSelect(group)}
        >
          {group}
        </button>
      ))}
    </div>
  );
}
