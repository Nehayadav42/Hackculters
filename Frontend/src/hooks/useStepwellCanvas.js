import { useEffect, useMemo, useRef } from "react";
import { CANVAS_SIZE, INITIAL_ANGLE, INITIAL_TILT, drawStepwell } from "../utils/stepwell.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

/** Animation loop plus drag-to-orbit pointer handlers for the stepwell canvas. */
export function useStepwellCanvas(photos) {
  const canvasRef = useRef(null);
  const photosRef = useRef(photos);
  const orbit = useRef({ angle: INITIAL_ANGLE, tilt: INITIAL_TILT, drag: null, idle: true });
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;
    const loop = () => {
      const o = orbit.current;
      if (o.idle && !reducedMotion) o.angle += 0.004;
      drawStepwell(ctx, CANVAS_SIZE, { angle: o.angle, tilt: o.tilt, photos: photosRef.current });
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const pointerHandlers = useMemo(
    () => ({
      onPointerDown: (e) => {
        const o = orbit.current;
        o.drag = [e.clientX, e.clientY];
        o.idle = false;
        e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove: (e) => {
        const o = orbit.current;
        if (!o.drag) return;
        o.angle += (e.clientX - o.drag[0]) * 0.01;
        o.tilt = Math.max(0.15, Math.min(1.3, o.tilt + (e.clientY - o.drag[1]) * 0.006));
        o.drag = [e.clientX, e.clientY];
      },
      onPointerUp: () => {
        orbit.current.drag = null;
      },
    }),
    []
  );

  return { canvasRef, pointerHandlers };
}
