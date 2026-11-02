
import { useState } from "react";
import Section from "../layout/Section.jsx";
import StepwellCanvas from "../stepwell/StepwellCanvas.jsx";
import PhotoSlider from "../stepwell/PhotoSlider.jsx";
import { STEPWELLS } from "../../data/stepwells.js";
import {
  DEFAULT_PHOTOS,
  matchedPoints,
  LEVELS,
} from "../../utils/stepwell.js";

export default function Stepwell3D() {
  const [photos, setPhotos] = useState(DEFAULT_PHOTOS);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const featuredSite = STEPWELLS[selectedIndex];

  return (
    <Section id="see" tone="s3" dark>
      <div className="stepwell-experience">
        <div className="stepwell-heading">
          <span className="eyebrow">
            DIGITAL HERITAGE LABORATORY
          </span>

          <h2>
            Architecture that
            <br />
            <span>comes alive.</span>
          </h2>

          <p>
            Explore different historic Indian water structures
            through interactive architectural visualizations.
          </p>
        </div>

        <div className="stepwell-layout">
          <div className="stepwell-viewer">
            <div className="viewer-topbar">
              <span>INTERACTIVE VIEWER</span>

              <span className="viewer-status">
                <i />
                LIVE PREVIEW
              </span>
            </div>

            <StepwellCanvas
              photos={photos}
              site={featuredSite}
            />

            <div className="viewer-caption">
              <span>ARCHITECTURAL VISUALIZATION</span>
              <span>DRAG TO ROTATE · SCROLL TO ZOOM</span>
            </div>
          </div>

          <aside className="stepwell-info">
            <span className="info-label">
              EXPLORE HERITAGE
            </span>

            <label
              htmlFor="stepwell-select"
              className="mt-5 block text-xs text-white/60"
            >
              SELECT MONUMENT
            </label>

            <select
              id="stepwell-select"
              value={selectedIndex}
              onChange={(event) =>
                setSelectedIndex(Number(event.target.value))
              }
              className="mt-2 w-full rounded-lg border border-white/20 bg-[#24483e] px-3 py-3 text-sm text-white outline-none focus:border-[#c49a58]"
            >
              {STEPWELLS.map((site, index) => (
                <option
                  key={site.name}
                  value={index}
                  className="bg-[#183b32] text-white"
                >
                  {site.name}
                </option>
              ))}
            </select>

            <h3>{featuredSite.name}</h3>

            <p className="stepwell-location">
              {featuredSite.place}, {featuredSite.state}
            </p>

            <div className="info-divider" />

            <div className="info-detail">
              <span>HISTORICAL PERIOD</span>
              <strong>{featuredSite.period}</strong>
            </div>

            <div className="info-detail">
              <span>ARCHITECTURAL FORM</span>
              <strong>
                {featuredSite.name === "Surya Kund"
                  ? "Stepped ceremonial water tank"
                  : featuredSite.name === "Chand Baori"
                  ? "Symmetrical staircase baori"
                  : featuredSite.name === "Agrasen ki Baoli"
                  ? "Linear baoli"
                  : "Multi-level stepwell"}
              </strong>
            </div>

            <p className="stepwell-description">
              {featuredSite.text}
            </p>

            <div className="stepwell-metrics">
              <div>
                <strong>{LEVELS}</strong>
                <span>Illustrative levels</span>
              </div>

              <div>
                <strong>{matchedPoints(photos)}</strong>
                <span>Simulation points</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="stepwell-controls">
          <div className="controls-heading">
            <div>
              <span className="info-label">
                MODEL DETAIL
              </span>

              <h3>
                Adjust architectural detail
              </h3>
            </div>

            <span className="photo-count">
              {photos} photos
            </span>
          </div>

          <PhotoSlider
            value={photos}
            onChange={setPhotos}
          />

          <p className="simulation-note">
            Each monument has a distinct illustrative geometry
            inspired by its architectural form. These are
            procedural visualizations, not historically accurate
            3D scans or photogrammetric reconstructions.
          </p>
        </div>
      </div>
    </Section>
  );
}
