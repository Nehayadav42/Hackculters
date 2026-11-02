
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMonuments } from "../services/api.js";

const getUniqueValues = (items, key) =>
  [...new Set(items.map((item) => item[key]).filter(Boolean))].sort();

export default function MonumentsPage() {
  const [monuments, setMonuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All States");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [periodFilter, setPeriodFilter] = useState("All Periods");

  useEffect(() => {
    let active = true;

    async function loadMonuments() {
      try {
        setLoading(true);
        setError("");

        const response = await getMonuments();

        if (active) {
          setMonuments(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load heritage records.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMonuments();

    return () => {
      active = false;
    };
  }, []);

  const states = useMemo(
    () => getUniqueValues(monuments, "state"),
    [monuments]
  );

  const categories = useMemo(
    () => getUniqueValues(monuments, "category"),
    [monuments]
  );

  const periods = useMemo(
    () => getUniqueValues(monuments, "architectural_period"),
    [monuments]
  );

  const filteredMonuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return monuments.filter((monument) => {
      const matchesSearch =
        !query ||
        [
          monument.name,
          monument.city,
          monument.state,
          monument.category,
          monument.architectural_period,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      const matchesState =
        stateFilter === "All States" || monument.state === stateFilter;

      const matchesCategory =
        categoryFilter === "All Categories" ||
        monument.category === categoryFilter;

      const matchesPeriod =
        periodFilter === "All Periods" ||
        monument.architectural_period === periodFilter;

      return (
        matchesSearch &&
        matchesState &&
        matchesCategory &&
        matchesPeriod
      );
    });
  }, [monuments, search, stateFilter, categoryFilter, periodFilter]);

  const clearFilters = () => {
    setSearch("");
    setStateFilter("All States");
    setCategoryFilter("All Categories");
    setPeriodFilter("All Periods");
  };

  return (
    <div className="min-h-screen bg-[#f5f2e9] text-[#252a24]">
      <header className="border-b border-[#ded8ca]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/dashboard"
            className="font-serif text-2xl font-semibold text-[#183b32]"
          >
            HeritageVerse
          </Link>

          <Link
            to="/dashboard"
            className="text-xs font-semibold uppercase tracking-widest text-[#55594f] transition hover:text-[#a17b43]"
          >
            ← Workspace
          </Link>
        </div>
      </header>

      <section className="bg-[#183b32] px-5 py-16 text-[#f5f2e9] sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#d5b77e]">
            THE DIGITAL HERITAGE ARCHIVE
          </p>

          <h1 className="max-w-4xl font-serif text-5xl leading-[1.08] sm:text-7xl">
            Explore India's
            <span className="block text-[#d5b77e]">
              living heritage.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-8 text-[#d9ded5] sm:text-base">
            Discover monuments, architectural traditions and historical
            records preserved across India's cultural landscape.
          </p>

          <div className="mt-12 flex flex-wrap gap-10 border-t border-white/15 pt-7">
            <div>
              <p className="font-serif text-3xl text-[#e5c78f]">
                {monuments.length.toString().padStart(2, "0")}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#c4c9bf]">
                Archive records
              </p>
            </div>

            <div>
              <p className="font-serif text-3xl text-[#e5c78f]">
                {states.length.toString().padStart(2, "0")}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#c4c9bf]">
                Regions represented
              </p>
            </div>

            <div>
              <p className="font-serif text-3xl text-[#e5c78f]">
                {categories.length.toString().padStart(2, "0")}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#c4c9bf]">
                Heritage categories
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a17b43]">
              BROWSE COLLECTION
            </p>
            <h2 className="mt-3 font-serif text-4xl text-[#183b32] sm:text-5xl">
              Heritage sites
            </h2>
          </div>

          <p className="text-sm text-[#77796f]">
            Showing {filteredMonuments.length} of {monuments.length} records
          </p>
        </div>

        <div className="mb-10 border border-[#ded8ca] bg-white/50 p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <label
                htmlFor="monument-search"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#62645c]"
              >
                Search archive
              </label>

              <input
                id="monument-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search monuments..."
                className="w-full border border-[#ded8ca] bg-[#f5f2e9] px-4 py-3 text-sm text-[#183b32] outline-none transition placeholder:text-[#62645c] focus:border-[#a17b43]"
              />
            </div>

            <div>
              <label
                htmlFor="state-filter"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#62645c]"
              >
                Region / State
              </label>

              <select
                id="state-filter"
                value={stateFilter}
                onChange={(event) => setStateFilter(event.target.value)}
                className="w-full border border-[#ded8ca] bg-[#f5f2e9] px-3 py-3 text-sm text-[#183b32] outline-none focus:border-[#a17b43]"
              >
                <option>All States</option>
                {states.map((state) => (
                  <option key={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#62645c]"
              >
                Category
              </label>

              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full border border-[#ded8ca] bg-[#f5f2e9] px-3 py-3 text-sm text-[#183b32] outline-none focus:border-[#a17b43]"
              >
                <option>All Categories</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="period-filter"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#62645c]"
              >
                Architectural period
              </label>

              <select
                id="period-filter"
                value={periodFilter}
                onChange={(event) => setPeriodFilter(event.target.value)}
                className="w-full border border-[#ded8ca] bg-[#f5f2e9] px-3 py-3 text-sm text-[#183b32] outline-none focus:border-[#a17b43]"
              >
                <option>All Periods</option>
                {periods.map((period) => (
                  <option key={period}>{period}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold uppercase tracking-widest text-[#a17b43] transition hover:text-[#183b32]"
            >
              Clear all filters ↗
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-[#183b32]">
              Loading heritage collection...
            </p>
          </div>
        ) : error ? (
          <div className="border border-[#d9b7a8] bg-[#fff8f4] px-6 py-10 text-center">
            <h3 className="font-serif text-2xl text-[#183b32]">
              Archive unavailable
            </h3>
            <p className="mt-3 text-sm text-[#8b5546]">{error}</p>
          </div>
        ) : filteredMonuments.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMonuments.map((monument, index) => {
              const image =
                monument.thumbnail_url ||
                monument.image_url ||
                monument.cover_image ||
                monument.image;

              const location = [monument.city, monument.state]
                .filter(Boolean)
                .join(", ");

              return (
                <Link
                  to={`/monuments/${monument.id}`}
                  key={monument.id}
                  className="group overflow-hidden border border-[#ded8ca] bg-white/50 transition duration-300 hover:-translate-y-1 hover:border-[#b9955b] hover:shadow-xl hover:shadow-[#183b32]/10"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#d9d5c8]">
                    {image ? (
                      <img
                        src={image}
                        alt={monument.name || "Heritage monument"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#d9d5c8] via-[#b8b5a5] to-[#8e9987]">
                        <span className="font-serif text-5xl text-[#183b32]/40">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    )}

                    <span className="absolute left-4 top-4 bg-[#f5f2e9] px-3 py-2 text-[9px] font-semibold uppercase tracking-widest text-[#183b32]">
                      {monument.category || "HERITAGE SITE"}
                    </span>

                    {monument.is_unesco_site && (
                      <span className="absolute bottom-4 left-4 bg-[#183b32] px-3 py-2 text-[9px] font-semibold uppercase tracking-widest text-[#e5c78f]">
                        UNESCO
                      </span>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a17b43]">
                      {monument.architectural_period || "HISTORICAL RECORD"}
                    </p>

                    <h3 className="mt-3 font-serif text-2xl leading-tight text-[#183b32] transition group-hover:text-[#a17b43]">
                      {monument.name || "Untitled monument"}
                    </h3>

                    <p className="mt-3 text-xs text-[#77796f]">
                      {location || "Location not available"}
                    </p>

                    <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#66695f]">
                      {monument.description ||
                        "Explore the historical and architectural record of this heritage site."}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-[#ded8ca] pt-4">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#55594f]">
                        Explore record
                      </span>

                      <span className="text-lg text-[#a17b43] transition group-hover:translate-x-1">
                        ↗
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="border border-[#ded8ca] py-20 text-center">
            <p className="font-serif text-3xl text-[#183b32]">
              No records found
            </p>
            <p className="mt-3 text-sm text-[#77796f]">
              Try changing your search or filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 bg-[#183b32] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#285548]"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      <footer className="border-t border-[#ded8ca] px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-[#62645c] sm:flex-row">
          <span>HERITAGEVERSE — A LIVING ARCHIVE</span>
          <Link to="/dashboard" className="transition hover:text-[#a17b43]">
            Return to workspace ↑
          </Link>
        </div>
      </footer>
    </div>
  );
}
