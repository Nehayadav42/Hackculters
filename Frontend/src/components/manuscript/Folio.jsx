import { MANUSCRIPT_LAYERS, MANUSCRIPT_WORDS } from "../../data/manuscript.js";
import WordButton from "./WordButton.jsx";

export default function Folio({ activeIndex, onSelect }) {
  return (
    <div className="folio">
      {MANUSCRIPT_LAYERS.map(({ id, title, field, className, lang }) => (
        <div className="layer" key={id}>
          <h3>{title}</h3>
          <div className={className} id={id}>
            {MANUSCRIPT_WORDS.map((word, index) => (
              <WordButton
                key={index}
                text={word[field]}
                lang={lang}
                active={index === activeIndex}
                onSelect={() => onSelect(index)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
