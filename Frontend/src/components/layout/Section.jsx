const WRAP_STYLE = { maxWidth: 1000 };

/** Page band. `tone` is s0..s4; `dark` switches to light text. */
export default function Section({ id, tone, dark = false, wrapped = true, children }) {
  const className = [tone, dark && "dark"].filter(Boolean).join(" ");
  return (
    <section id={id} className={className}>
      {wrapped ? (
        <div className="wrap" style={WRAP_STYLE}>
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
