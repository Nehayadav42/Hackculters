import { useState } from "react";
import Section from "../layout/Section.jsx";
import StepwellCanvas from "../stepwell/StepwellCanvas.jsx";
import PhotoSlider from "../stepwell/PhotoSlider.jsx";
import { DEFAULT_PHOTOS, matchedPoints } from "../../utils/stepwell.js";

export default function Stepwell3D() {
  const [photos, setPhotos] = useState(DEFAULT_PHOTOS);

  return (
    <Section id="see" tone="s3" dark>
      <h2>Turn photographs into a structure you can turn around</h2>
      <p className="mute">More photos give a denser model. Drag the stepwell to look at it from any side.</p>
      <div className="stage">
        <StepwellCanvas photos={photos} />
        <div>
          <PhotoSlider value={photos} onChange={setPhotos} />
          <p className="mute" style={{ marginTop: 18 }} id="mdl">
            {photos} photographs give about {matchedPoints(photos)} matched points on this model. The reconstruction runs offline; the browser only receives the finished mesh.
          </p>
        </div>
      </div>
    </Section>
  );
}
