import Section from "../layout/Section.jsx";
import StepsDiagram from "../hero/StepsDiagram.jsx";
import BhopalCollection from "../hero/BhopalCollection.jsx";

const delay = (seconds) => ({ animationDelay: seconds });

export default function Hero({ bhopalEntries, onOpenBhopal }) {
  return (
    <Section tone="s0" wrapped={false}>
      <div className="hero">

        {/* Hero introduction */}
        <div className="hero-content">

          <div className="hero-eyebrow intro" style={delay(".05s")}>
            <span className="eyebrow-line" />
            <span>Preserving India's cultural memory</span>
          </div>

          <h1 className="name intro" style={delay(".1s")}>
            Heritage
            <span className="name-accent">, reimagined.</span>
          </h1>

          <StepsDiagram style={delay(".2s")} />

          <h2 className="lede intro" style={delay(".3s")}>
            India's stories are written in its architecture.
            <span> It's time to explore them.</span>
          </h2>

          <p className="hero-description intro" style={delay(".4s")}>
            Discover historic places, explore digitised manuscripts,
            uncover architectural details and experience cultural
            heritage through interactive digital reconstructions.
          </p>

          <div className="btns intro" style={delay(".5s")}>
            <a className="btn" href="#walk">
              Explore heritage
              <span aria-hidden="true">↗</span>
            </a>

            <button
              className="btn alt"
              type="button"
              onClick={() => onOpenBhopal(null)}
            >
              Discover Bhopal
            </button>
          </div>

          <div className="hero-note intro" style={delay(".6s")}>
            <span className="hero-note-dot" />
            <span>A growing digital archive of India's heritage</span>
          </div>
        </div>

        {/* Featured heritage collection */}
        <div className="hero-feature">
          <div className="hero-feature-label">
            <span>01 / Featured collection</span>
            <span>Bhopal, Madhya Pradesh</span>
          </div>

          <BhopalCollection
            entries={bhopalEntries}
            onOpen={onOpenBhopal}
            style={delay(".45s")}
          />

          <div className="hero-feature-footer">
            <span>Explore historical records</span>
            <span aria-hidden="true">↓</span>
          </div>
        </div>

      </div>
    </Section>
  );
}