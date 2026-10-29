import { NAV_CTA, NAV_LINKS, SECTION_IDS } from "../../data/navigation.js";
import { useActiveSection } from "../../hooks/useActiveSection.js";

export default function Header() {
  const activeId = useActiveSection(SECTION_IDS);
  return (
    <header className="top">
      <a className="mark" href="#" aria-label="Vav, home">
        Vav <small lang="hi">वाव</small>
      </a>
      <nav aria-label="Sections">
        {NAV_LINKS.map(({ label, href }) => (
          <a key={href} href={href} aria-current={activeId === href.slice(1)}>
            {label}
          </a>
        ))}
        <a className="go" href={NAV_CTA.href}>
          {NAV_CTA.label}
        </a>
      </nav>
    </header>
  );
}
