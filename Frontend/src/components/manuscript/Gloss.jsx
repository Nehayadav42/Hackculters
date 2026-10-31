export default function Gloss({ word }) {
  return (
    <div id="gloss" aria-live="polite">

      {word ? (
        <div className="gloss-content">

          <div className="gloss-word">
            <span className="gloss-label">SELECTED WORD</span>

            <h3 lang="hi">{word.devanagari}</h3>

            <span className="gloss-roman">
              {word.roman}
            </span>
          </div>

          <div className="gloss-meaning">
            <span className="gloss-label">ENGLISH MEANING</span>

            <h4>{word.meaning}</h4>

            <p>{word.gloss}</p>
          </div>

        </div>
      ) : (
        <div className="gloss-empty">
          <span aria-hidden="true">↖</span>

          <p>
            Select a word from the manuscript to explore its
            transliteration, meaning and linguistic context.
          </p>
        </div>
      )}

    </div>
  );
}