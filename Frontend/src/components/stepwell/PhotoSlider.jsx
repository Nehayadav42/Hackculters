import { MAX_PHOTOS, MIN_PHOTOS } from "../../utils/stepwell.js";

export default function PhotoSlider({ value, onChange }) {
  return (
    <div className="ctl">
      <label htmlFor="ph">
        <span>Photos contributed</span>
        <b id="phv">{value}</b>
      </label>
      <input
        id="ph"
        type="range"
        min={MIN_PHOTOS}
        max={MAX_PHOTOS}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
