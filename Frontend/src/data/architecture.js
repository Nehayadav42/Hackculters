export const ARCHITECTURE = [
  { title: "Ingest", text: "Decks, PDFs and photo folders are split into images, text and notes, each kept with its source file and fellow." },
  { title: "Read", text: "A vision transformer reads regional scripts. Transcriptions go into a vector index so a search finds meaning, not only spelling." },
  { title: "Place", text: "Every entry carries coordinates in PostgreSQL with PostGIS, so routes, folklore and monuments share one map." },
  { title: "Rebuild", text: "Photos of one monument are matched and reconstructed in Python, then served to the browser through Three.js." },
];
