/** Wireframe stepwell: geometry, projection and canvas drawing. */

export const CANVAS_SIZE = 760;
export const LEVELS = 7;

export const MIN_PHOTOS = 3;
export const MAX_PHOTOS = 48;
export const DEFAULT_PHOTOS = 12;

export const INITIAL_ANGLE = 0.6;
export const INITIAL_TILT = 0.55;

// More photographs add more subdivisions to the illustrative wireframe.
const subdivisions = (photos) => 1 + Math.floor(photos / 8);

// Estimated points for the visual simulation.
export const matchedPoints = (photos) =>
  LEVELS * 4 * subdivisions(photos) * 12;

// Coordinates for each horizontal level.
const ring = (k) => {
  const h = 1 - k * 0.115;
  const y = 0.45 - k * 0.2;

  return [
    [-h, y, -h],
    [h, y, -h],
    [h, y, h],
    [-h, y, h],
  ];
};

export function drawStepwell(ctx, size, { angle, tilt, photos }) {
  const R = size;
  const sub = subdivisions(photos);

  // Convert 3D coordinates into 2D canvas coordinates.
  const project = (x, y, z) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const a = x * c - z * s;
    const b = x * s + z * c;

    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);

    const y2 = y * ct - b * st;
    const z2 = y * st + b * ct;

    const f = 3.4 / (3.4 + z2 * 0.6);

    return [
      R / 2 + a * f * R * 0.3,
      R * 0.44 - y2 * f * R * 0.3,
      f,
    ];
  };

  ctx.clearRect(0, 0, R, R);

  // Background
  const background = ctx.createLinearGradient(0, 0, R, R);
  background.addColorStop(0, "#21463b");
  background.addColorStop(1, "#102d26");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, R, R);

  // Circular guide
  ctx.beginPath();
  ctx.arc(R / 2, R / 2, R * 0.37, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(250, 248, 242, 0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ground reference
  ctx.beginPath();
  ctx.ellipse(
    R / 2,
    R * 0.76,
    R * 0.32,
    R * 0.07,
    0,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle = "rgba(216, 180, 123, 0.2)";
  ctx.stroke();

  // Draw all seven levels.
  for (let k = 0; k < LEVELS; k++) {
    const corners = ring(k);
    const points = [];

    for (let i = 0; i < 4; i++) {
      const start = corners[i];
      const end = corners[(i + 1) % 4];

      for (let j = 0; j < sub; j++) {
        const t = j / sub;

        points.push([
          start[0] + (end[0] - start[0]) * t,
          start[1],
          start[2] + (end[2] - start[2]) * t,
        ]);
      }
    }

    const projected = points.map((point) => project(...point));

    // Horizontal level
    ctx.beginPath();

    projected.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    });

    ctx.closePath();

    ctx.strokeStyle = `rgba(250, 248, 242, ${0.85 - k * 0.07})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Detail points
    ctx.fillStyle = "#d8b47b";

    projected.forEach((point) => {
      ctx.beginPath();
      ctx.arc(
        point[0],
        point[1],
        1.5 + point[2] * 1.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Vertical structural connections
    if (k < LEVELS - 1) {
      const lower = ring(k + 1);

      for (let i = 0; i < 4; i++) {
        const start = project(...corners[i]);
        const end = project(...lower[i]);

        ctx.beginPath();
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);

        ctx.strokeStyle = "rgba(216, 180, 123, 0.45)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }
  }

  // Centre marker
  ctx.beginPath();
  ctx.arc(R / 2, R * 0.48, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#d8b47b";
  ctx.fill();
}