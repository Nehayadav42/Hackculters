import Section from "../layout/Section.jsx";
import StepsDiagram from "../hero/StepsDiagram.jsx";
import BhopalCollection from "../hero/BhopalCollection.jsx";

const delay = (seconds) => ({ animationDelay: seconds });

export default function Hero({ bhopalEntries, onOpenBhopal }) {
  return (
    <Section tone="s0" wrapped={false}>
      <div className="hero">
        <div>
          <h1 className="name intro" style={delay(".05s")}>Vav</h1>
          <StepsDiagram style={delay(".2s")} />
          <p className="lede intro" style={delay(".3s")}>
            India’s architecture, archived where you can walk into it.
          </p>
          <p className="mute intro" style={delay(".4s")}>
            Vav is a living archive for the heritage that Explorer Fellows document on the road. Search photos and field notes by place, read scanned regional manuscripts in translation, and turn a monument’s photographs into a 3D model you can turn around.
          </p>
          <div className="btns intro" style={delay(".5s")}>
            <a className="btn" href="#walk">Search the archive</a>
            <button className="btn alt" id="goBh" type="button" onClick={() => onOpenBhopal(null)}>
              Start with Bhopal
            </button>
          </div>
        </div>
        <BhopalCollection entries={bhopalEntries} onOpen={onOpenBhopal} style={delay(".45s")} />
      </div>
    </Section>
  );
}
