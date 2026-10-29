import Section from "../layout/Section.jsx";
import Footer from "../layout/Footer.jsx";
import { ARCHITECTURE } from "../../data/architecture.js";

export default function Architecture() {
  return (
    <Section tone="s4" dark>
      <h2>What sits under the surface</h2>
      <dl className="stack">
        {ARCHITECTURE.map(({ title, text }) => (
          <div key={title}>
            <dt>{title}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
      <Footer />
    </Section>
  );
}
