export default function SearchBar({ value, onChange }) {
  return (
    <div className="find">
      <span className="search-icon" aria-hidden="true">
        ⌕
      </span>

      <input
        id="q"
        type="search"
        placeholder="Search monuments, places, periods or keywords..."
        aria-label="Search the heritage archive"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      <span className="search-hint" aria-hidden="true">
        SEARCH
      </span>
    </div>
  );
}