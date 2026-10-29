import { useCallback } from "react";
import DepthGauge from "./components/layout/DepthGauge.jsx";
import Header from "./components/layout/Header.jsx";
import Hero from "./components/sections/Hero.jsx";
import ArchiveSearch from "./components/sections/ArchiveSearch.jsx";
import Manuscripts from "./components/sections/Manuscripts.jsx";
import Stepwell3D from "./components/sections/Stepwell3D.jsx";
import Architecture from "./components/sections/Architecture.jsx";
import { useArchiveSearch } from "./hooks/useArchiveSearch.js";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion.js";
import { BHOPAL_ENTRIES } from "./data/entries.js";
import { BHOPAL_GROUP } from "./data/bhopal.js";

export default function App() {
  const archive = useArchiveSearch();
  const reducedMotion = usePrefersReducedMotion();
  const { jumpToGroup } = archive;

  const openBhopal = useCallback(
    (entryId = null) => {
      jumpToGroup(BHOPAL_GROUP, entryId);
      document.getElementById("walk")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    },
    [jumpToGroup, reducedMotion]
  );

  return (
    <>
      <DepthGauge />
      <main>
        <Header />
        <Hero bhopalEntries={BHOPAL_ENTRIES} onOpenBhopal={openBhopal} />
        <ArchiveSearch archive={archive} />
        <Manuscripts />
        <Stepwell3D />
        <Architecture />
      </main>
    </>
  );
}
