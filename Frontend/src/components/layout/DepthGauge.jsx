import { useScrollProgress } from "../../hooks/useScrollProgress.js";

const MAX_DEPTH_METRES = 14;

export default function DepthGauge() {
  const progress = useScrollProgress();
  return (
    <div id="gauge" aria-hidden="true">
      <div id="tick" style={{ top: `${progress * 100}%` }} />
      <b id="m">{Math.round(progress * MAX_DEPTH_METRES)}</b>m<span>depth of descent</span>
    </div>
  );
}
