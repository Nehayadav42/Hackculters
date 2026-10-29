/** Wireframe stepwell: geometry, projection and canvas drawing. */
export const CANVAS_SIZE = 760;
export const LEVELS = 7;
export const MIN_PHOTOS = 3;
export const MAX_PHOTOS = 48;
export const DEFAULT_PHOTOS = 12;
export const INITIAL_ANGLE = 0.6;
export const INITIAL_TILT = 0.55;

const subdivisions = (photos) => 1 + Math.floor(photos / 8);

export const matchedPoints = (photos) => LEVELS * 4 * subdivisions(photos) * 12;

const ring = (k) => {
  const h = 1 - k * 0.115;
  const y = 0.45 - k * 0.2;
  return [[-h, y, -h], [h, y, -h], [h, y, h], [-h, y, h]];
};

export function drawStepwell(ctx, size, { angle, tilt, photos }) {
  const R = size;
  const sub = subdivisions(photos);

  const project = (x, y, z) => {
    const c = Math.cos(angle), s = Math.sin(angle);
    const a = x * c - z * s, b = x * s + z * c;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const y2 = y * ct - b * st, z2 = y * st + b * ct;
    const f = 3.4 / (3.4 + z2 * 0.6);
    return [R / 2 + a * f * R * 0.3, R * 0.44 - y2 * f * R * 0.3, f];
  };

  ctx.clearRect(0, 0, R, R);
  ctx.lineWidth = 1.6;

  for (let k = 0; k < LEVELS; k++) {
    const corners = ring(k);
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const a = corners[i], b = corners[(i + 1) % 4];
      for (let j = 0; j < sub; j++) {
        const t = j / sub;
        pts.push([a[0] + (b[0] - a[0]) * t, a[1], a[2] + (b[2] - a[2]) * t]);
      }
    }
    const projected = pts.map((p) => project(...p));

    ctx.strokeStyle = `rgba(238,241,234,${0.9 - k * 0.08})`;
    ctx.beginPath();
    projected.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "#D9A21B";
    projected.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 1.4 + p[2] * 1.2, 0, 7);
      ctx.fill();
    });

    if (k < LEVELS - 1) {
      const lower = ring(k + 1);
      ctx.strokeStyle = "rgba(238,241,234,.35)";
      for (let i = 0; i < 4; i++) {
        const a = project(...corners[i]), b = project(...lower[i]);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
    }
  }
}
