
import { useMemo, useState } from "react";
import { SORTED_STEPWELLS, STEPWELLS } from "../data/stepwells";

const states = [
  "All",
  ...[...new Set(STEPWELLS.map((item) => item.state))].sort((first, second) =>
    first.localeCompare(second)
  ),
];

export default function ExploreHeritage({ onBack, onSelectMonument }) {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All");

  const filteredMonuments = useMemo(() => {
    return SORTED_STEPWELLS.filter((monument) => {
      const query = search.toLowerCase();

      const matchesSearch =
        monument.name.toLowerCase().includes(query) ||
        monument.place.toLowerCase().includes(query) ||
        monument.state.toLowerCase().includes(query);

      const matchesState =
        selectedState === "All" || monument.state === selectedState;

      return matchesSearch && matchesState;
    });
  }, [search, selectedState]);

  return (
    <main className="min-h-screen bg-[#f3f5f6] text-[#1a2c3b]">
      <header className="sticky top-0 z-30 border-b border-[#ded8c9] bg-[#f3f5f6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-[#66727d] transition hover:text-[#bf6548]"
          >
            <span className="text-lg">←</span>
            Back to Dashboard
          </button>

          <h1 className="text-xl font-semibold tracking-tight">
            Heritage<span className="text-[#bf6548]">Verse</span>
          </h1>

          <span className="hidden text-xs uppercase tracking-[0.2em] text-[#8c887b] sm:block">
            Digital Archive
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#bf6548]">
            Discover India's Legacy
          </p>

          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            Explore the stories
            <br />
            <span className="italic text-[#bf6548]">etched in stone.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#66727d] sm:text-base">
            Discover India's remarkable stepwells, architectural wonders and
            historical landmarks. Every monument carries a story waiting to
            be explored.
          </p>
        </div>

        <div className="mb-8 grid gap-4 rounded-2xl border border-[#ded8c9] bg-white/60 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
          <div className="flex items-center gap-3 rounded-xl border border-[#e5dfd2] bg-[#f3f5f6] px-4">
            <span className="text-lg text-[#bf6548]">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search monuments, cities or states..."
              className="w-full bg-transparent py-4 text-sm text-[#1a2c3b] outline-none placeholder:text-[#aaa597]"
            />
          </div>

          <select
            value={selectedState}
            onChange={(event) => setSelectedState(event.target.value)}
            className="rounded-xl border border-[#e5dfd2] bg-[#f3f5f6] px-4 py-4 text-sm text-[#66727d] outline-none"
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state === "All" ? "All States" : state}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              Heritage Collection
              <span className="ml-2 font-normal text-[#969184]">
                ({filteredMonuments.length} monuments)
              </span>
            </p>
          </div>

          {(search || selectedState !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedState("All");
              }}
              className="text-xs font-semibold uppercase tracking-wider text-[#bf6548] hover:text-[#1a2c3b]"
            >
              Clear filters ×
            </button>
          )}
        </div>

        {filteredMonuments.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMonuments.map((monument, index) => (
              <article
                key={monument.name}
                className="group overflow-hidden rounded-2xl border border-[#ded8c9] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a2c3b]/10"
              >
                <div className="relative flex h-52 items-end overflow-hidden bg-[#1a2c3b] p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#bf6548_0%,_transparent_55%)] opacity-50 transition duration-500 group-hover:scale-110" />
                  <div className="absolute -right-3 -top-10 font-serif text-[190px] leading-none text-white/[0.06]">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="relative">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#e1a080]">
                      {monument.period}
                    </p>
                    <h3 className="font-serif text-3xl text-[#f3f5f6]">
                      {monument.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#d1d0c5]">
                      {monument.place}, {monument.state}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="min-h-[72px] text-sm leading-6 text-[#66727d]">
                    {monument.text}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-[#e8edf0] pt-4">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#bf6548]">
                      Historical Site
                    </span>

                    <button
                      onClick={() => onSelectMonument?.(monument)}
                      className="text-xs font-semibold text-[#1a2c3b] transition hover:text-[#bf6548]"
                    >
                      Explore details →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#cfc8b8] py-20 text-center">
            <p className="font-serif text-2xl">No monuments found</p>
            <p className="mt-2 text-sm text-[#888477]">
              Try another name, city or state.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedState("All");
              }}
              className="mt-5 text-sm font-semibold text-[#bf6548]"
            >
              Reset search
            </button>
          </div>
        )}
      </section>

      <footer className="border-t border-[#ded8c9] px-5 py-7 text-center text-xs tracking-wide text-[#969184]">
        HERITAGEVERSE · PRESERVING STORIES, CONNECTING GENERATIONS
      </footer>
    </main>
  );
}
