export default function WordButton({
  text,
  lang,
  active,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`w${active ? " on" : ""}`}
      lang={lang}
      aria-pressed={active}
      onClick={onSelect}
    >
      {text}
    </button>
  );
}