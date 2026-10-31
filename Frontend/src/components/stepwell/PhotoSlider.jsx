import { MAX_PHOTOS, MIN_PHOTOS } from "../../utils/stepwell.js";

export default function PhotoSlider({ value, onChange }) {
  return (
    <div className="photo-control">
      <label htmlFor="photo-range">
        <span>Photographs in simulation</span>
        <strong>{value}</strong>
      </label>

      <input
        id="photo-range"
        type="range"
        min={MIN_PHOTOS}
        max={MAX_PHOTOS}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />

      <div className="slider-limits">
        <span>{MIN_PHOTOS} photos</span>
        <span>{MAX_PHOTOS} photos</span>
      </div>
    </div>
  );
}