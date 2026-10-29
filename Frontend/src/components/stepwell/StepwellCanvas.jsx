import { CANVAS_SIZE } from "../../utils/stepwell.js";
import { useStepwellCanvas } from "../../hooks/useStepwellCanvas.js";

export default function StepwellCanvas({ photos }) {
  const { canvasRef, pointerHandlers } = useStepwellCanvas(photos);
  return (
    <canvas
      id="cv"
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      role="img"
      aria-label="Rotating wireframe of a stepwell, built from contributed photographs"
      {...pointerHandlers}
    />
  );
}
