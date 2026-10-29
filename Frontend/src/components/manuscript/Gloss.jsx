export default function Gloss({ word }) {
  return (
    <p id="gloss" className="mute">
      {word ? (
        <>
          <b style={{ color: "var(--ink)" }}>{word.roman}</b>, “{word.meaning}”. {word.gloss}
        </>
      ) : (
        "Select a word to see what it means and how it was read."
      )}
    </p>
  );
}
