export default function MapGrid({ meridians, parallels }) {
  return (
    <>
      {meridians.map(({ px, label }) => (
        <g key={`lon-${label}`}>
          <line className="g" x1={px} y1="20" x2={px} y2="500" />
          <text x={px + 4} y="510">{label}</text>
        </g>
      ))}
      {parallels.map(({ py, label }) => (
        <g key={`lat-${label}`}>
          <line className="g" y1={py} x1="20" y2={py} x2="580" />
          <text x="24" y={py - 4}>{label}</text>
        </g>
      ))}
    </>
  );
}
