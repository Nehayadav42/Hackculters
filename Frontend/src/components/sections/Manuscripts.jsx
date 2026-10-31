import { useState } from "react";

import Section from "../layout/Section.jsx";
import Folio from "../manuscript/Folio.jsx";
import Gloss from "../manuscript/Gloss.jsx";

import { MANUSCRIPT_WORDS } from "../../data/manuscript.js";

export default function Manuscripts() {
  const [activeIndex, setActiveIndex] = useState(null);

  const selectedWord =
    activeIndex === null ? null : MANUSCRIPT_WORDS[activeIndex];

  return (
    <Section id="read" tone="s2">
      <div className="manuscript-section">

        <div className="manuscript-heading">
          <div className="manuscript-eyebrow">
            <span>THE MANUSCRIPT COLLECTION</span>
            <span>03 / READ</span>
          </div>

          <h2>
            Every word holds
            <span> a piece of history.</span>
          </h2>

          <p className="manuscript-intro mute">
            Explore historical scripts through their original
            language, transliteration and English meaning.
            Select individual words to discover their context.
          </p>
        </div>

        <div className="manuscript-reader">

          <div className="reader-toolbar">
            <div>
              <span className="reader-label">DIGITAL FOLIO</span>
              <h3>A verse of devotion</h3>
            </div>

            <span className="reader-status">
              INTERACTIVE TRANSCRIPTION
            </span>
          </div>

          <div className="reader-instruction">
            Select any word to explore its meaning and interpretation.
          </div>

          <Folio
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />

          <Gloss word={selectedWord} />

          <div className="reader-footer">
            <span>ORIGINAL SCRIPT · TRANSLITERATION · TRANSLATION</span>
            <span>DEMO TRANSCRIPTION</span>
          </div>

        </div>
      </div>
    </Section>
  );
}