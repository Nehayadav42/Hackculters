import { useState } from "react";
import Section from "../layout/Section.jsx";
import Folio from "../manuscript/Folio.jsx";
import Gloss from "../manuscript/Gloss.jsx";
import { MANUSCRIPT_WORDS } from "../../data/manuscript.js";

export default function Manuscripts() {
  const [activeIndex, setActiveIndex] = useState(null);
  const word = activeIndex === null ? null : MANUSCRIPT_WORDS[activeIndex];

  return (
    <Section id="read" tone="s2">
      <h2>A page of Devanagari, read word by word</h2>
      <p className="mute">
        Scanned text becomes a transcription and a translation, and every word stays tied to where it sits on the page. Select a word.
      </p>
      <Folio activeIndex={activeIndex} onSelect={setActiveIndex} />
      <Gloss word={word} />
    </Section>
  );
}
