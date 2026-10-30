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

  const featuredSite = STEPWELLS[0];

  return (
    <Section id="see" tone="s3" dark>
      <div className="stepwell-experience">
        <div className="stepwell-heading">
          <span className="eyebrow">DIGITAL HERITAGE LABORATORY</span>

          <h2>
            Architecture that
            <br />
            <span>comes alive.</span>
          </h2>

          <p>
            Explore how photographs and architectural references
            can help create interactive digital representations
            of India's historic stepwells.
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

            <StepwellCanvas photos={photos} />

            <div className="viewer-caption">
              <span>ILLUSTRATIVE GEOMETRY</span>
              <span>DRAG TO ROTATE</span>
            </div>
          </div>

          <aside className="stepwell-info">
            <span className="info-label">FEATURED HERITAGE</span>

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
              <strong>Multi-level stepwell</strong>
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
                <span>Demo geometry points</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="stepwell-controls">
          <div className="controls-heading">
            <div>
              <span className="info-label">RECONSTRUCTION SIMULATOR</span>
              <h3>Explore the effect of more photographs</h3>
            </div>

            <span className="photo-count">{photos} photos</span>
          </div>

          <PhotoSlider value={photos} onChange={setPhotos} />

          <p className="simulation-note">
            This is an illustrative simulation. Changing the photo count
            adjusts the wireframe detail; it does not perform actual
            photogrammetry or reconstruct a real monument.
          </p>
        </div>
      </div>
    </Section>
  );
}