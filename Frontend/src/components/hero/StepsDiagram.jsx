export default function StepsDiagram({ style }) {
  return (
    <svg className="steps intro" style={style} viewBox="0 0 400 72" aria-hidden="true">
      <polyline
        points="0,6 60,6 60,17 120,17 120,28 180,28 180,39 240,39 240,50 300,50 300,61 400,61"
        fill="none"
        stroke="#17201F"
        strokeWidth="2"
      />
      <rect x="300" y="61" width="100" height="11" fill="#2D3A8C" />
    </svg>
  );
}
