export default function MapPoint({ entry, x, y, selected, onSelect }) {
  const flip = x > 400;
  const activate = () => onSelect(entry.id);
  return (
    <g
      className={selected ? "pt on" : "pt"}
      tabIndex={0}
      role="button"
      aria-label={`${entry.name}, ${entry.place}`}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
    >
      <circle cx={x} cy={y} r="7" />
      <text x={x + (flip ? -14 : 14)} y={y + 4} textAnchor={flip ? "end" : "start"}>
        {entry.name}
      </text>
    </g>
  );
}
