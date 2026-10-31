import { CANVAS_SIZE } from "../../utils/stepwell.js";
import { useStepwellCanvas } from "../../hooks/useStepwellCanvas.js";

export default function StepwellCanvas({ photos }) {
  const { canvasRef, pointerHandlers } = useStepwellCanvas(photos);

  return (
    <canvas
      className="stepwell-canvas"
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      role="img"
      aria-label="Illustrative rotating wireframe of a multi-level stepwell. Drag to rotate."
      {...pointerHandlers}
    />
  );
}