import {
  MANUSCRIPT_LAYERS,
  MANUSCRIPT_WORDS,
} from "../../data/manuscript.js";

import WordButton from "./WordButton.jsx";

export default function Folio({ activeIndex, onSelect }) {
  return (
    <div className="folio">
      {MANUSCRIPT_LAYERS.map((layer, layerIndex) => (
        <div className="layer" key={layer.id}>

          <div className="layer-heading">
            <span className="layer-number">
              0{layerIndex + 1}
            </span>

            <h3>{layer.title}</h3>
          </div>

          <div className={layer.className} id={layer.id}>
            {MANUSCRIPT_WORDS.map((word, index) => (
              <WordButton
                key={`${layer.id}-${index}`}
                text={word[layer.field]}
                lang={layer.lang}
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