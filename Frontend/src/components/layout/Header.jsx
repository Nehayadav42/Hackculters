import { useEffect, useState } from "react";

import {
  NAV_CTA,
  NAV_LINKS,
  SECTION_IDS,
} from "../../data/navigation.js";

import { useActiveSection } from "../../hooks/useActiveSection.js";

export default function Header() {
  const activeId = useActiveSection(SECTION_IDS);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
  const handleEscape = (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  };

  window.addEventListener("keydown", handleEscape);

  return () => {
    window.removeEventListener("keydown", handleEscape);
  };
}, []);

  return (
    <header className="top">
      <div className="header-inner">
        <a
          className="mark"
          href="#home"
          aria-label="HeritageVerse home"
          onClick={closeMenu}
        >
          <span className="mark-symbol">H</span>

          <span className="mark-text">
            Heritage<span>Verse</span>
            <small lang="hi">विरासत का डिजिटल अभिलेख</small>
          </span>
        </a>

        <button
          className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <nav
          id="primary-navigation"
          className={`nav ${menuOpen ? "nav-open" : ""}`}
          aria-label="Main navigation"
        >
          <div className="nav-links">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className={activeId === href.slice(1) ? "active" : ""}
                aria-current={
                  activeId === href.slice(1) ? "location" : undefined
                }
                onClick={closeMenu}
              >
                {label}
              </a>
            ))}
          </div>

          <a
            className="go"
            href={NAV_CTA.href}
            onClick={closeMenu}
          >
            {NAV_CTA.label}
            <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}