import Section from "../layout/Section.jsx";
import Footer from "../layout/Footer.jsx";
import { ARCHITECTURE } from "../../data/architecture.js";

export default function Architecture() {
  return (
    <Section tone="s4" dark>
      <div className="architecture">
        <div className="architecture-heading">
          <span className="eyebrow">
            THE TECHNOLOGY BEHIND THE HERITAGE
          </span>

          <h2>
            From forgotten archives
            <br />
            <span>to living knowledge.</span>
          </h2>

          <p className="architecture-intro">
            HeritageVerse AI brings together archival processing,
            artificial intelligence and spatial data to make
            cultural heritage easier to preserve, understand and explore.
          </p>
        </div>

        <div className="architecture-flow">
          {ARCHITECTURE.map((stage, index) => (
            <article className="architecture-card" key={stage.id}>
              <div className="architecture-card-top">
                <span className="architecture-number">{stage.id}</span>

                {index !== ARCHITECTURE.length - 1 && (
                  <span className="architecture-connector" aria-hidden="true">
                    →
                  </span>
                )}
              </div>

              <span className="architecture-subtitle">
                {stage.subtitle}
              </span>

              <h3>{stage.title}</h3>

              <p>{stage.text}</p>

              <div className="architecture-technologies">
                {stage.technologies.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="architecture-note">
          <span className="architecture-note-mark">✳</span>
          <p>
            One connected ecosystem. Multiple ways to experience
            and preserve our cultural memory.
          </p>
        </div>
      </div>

      <Footer />
    </Section>
  );
}