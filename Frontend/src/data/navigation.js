export const NAV_LINKS = [
  { label: "Map", href: "#walk" },
  { label: "Manuscripts", href: "#read" },
  { label: "3D models", href: "#see" },
];

export const NAV_CTA = { label: "Search archive", href: "#walk" };

export const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(1));
