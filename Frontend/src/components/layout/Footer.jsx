import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[#d5dfe5] bg-[#f3f5f6] px-[clamp(22px,5vw,76px)] py-8 text-[#182531] sm:py-10">
      <div className="mx-auto grid max-w-[1320px] gap-x-8 gap-y-7 pb-7 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="pr-4">
          <Link
            to="/"
            className="font-serif text-2xl tracking-tight text-[#182531]"
          >
            Heritage<span className="text-[#bf6548]">Verse</span>
          </Link>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#51697c]">
            A digital space to discover India's heritage, explore archival
            records and preserve cultural memory.
          </p>
        </div>

        <nav aria-label="Heritage discovery">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bf6548]">
            Discover
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[#182531]">
            <li><Link className="transition-colors hover:text-[#bf6548]" to="/monuments">Monuments</Link></li>
            <li><Link className="transition-colors hover:text-[#bf6548]" to="/archive/search">Archive search</Link></li>
            <li><a className="transition-colors hover:text-[#bf6548]" href="#walk">Explore the archive</a></li>
          </ul>
        </nav>

        <nav aria-label="Interactive experiences">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bf6548]">
            Experiences
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[#182531]">
            <li><a className="transition-colors hover:text-[#bf6548]" href="#see">Landing 3D experience</a></li>
            <li><Link className="transition-colors hover:text-[#bf6548]" to="/explorer">3D Explorer</Link></li>
            <li><Link className="transition-colors hover:text-[#bf6548]" to="/map">Heritage map</Link></li>
          </ul>
        </nav>
      </div>

      <div className="mx-auto flex max-w-[1320px] flex-col gap-1 border-t border-[#d5dfe5] pt-5 text-xs text-[#51697c] sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <span>© {new Date().getFullYear()} HeritageVerse</span>
        <span>HackCult ’26 · Problem statement HC26-CULT01</span>
      </div>
    </footer>
  );
}