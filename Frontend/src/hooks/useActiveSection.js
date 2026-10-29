import { useEffect, useState } from "react";

/** Returns the id of the section crossing 40% of the viewport height. */
export function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.4;
      const hit = sectionIds.find((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < line && rect.bottom > line;
      });
      setActiveId(hit ?? null);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionIds]);

  return activeId;
}
