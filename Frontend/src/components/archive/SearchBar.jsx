export default function SearchBar({ value, onChange }) {
  return (
    <div className="find">
      <input
        id="q"
        type="search"
        placeholder="Search the archive"
        aria-label="Search the archive"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
