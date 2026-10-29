export default function WordButton({ text, lang, active, onSelect }) {
  return (
    <button type="button" className={active ? "w on" : "w"} lang={lang} onClick={onSelect}>
      {text}
    </button>
  );
}
