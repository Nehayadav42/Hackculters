export const MANUSCRIPT_WORDS = [
  { devanagari: "श्री", roman: "śrī", meaning: "auspicious",
    gloss: "A word of blessing placed at the head of a text. Read with high confidence; it is one of the most common openings in manuscripts." },
  { devanagari: "गणेशाय", roman: "gaṇeśāya", meaning: "to Ganesha",
    gloss: "Ganesha in the dative case: an invocation addressed to him. The ending -āya marks “to”." },
  { devanagari: "नमः", roman: "namaḥ", meaning: "salutations",
    gloss: "A formula of respect. The final visarga (ः) is a faint mark, so it is the part most often misread in a worn scan." },
];

/** The three stacked readings of the folio, left to right. */
export const MANUSCRIPT_LAYERS = [
  { id: "L1", title: "Scan", field: "devanagari", className: "ln dv", lang: "hi" },
  { id: "L2", title: "Transliteration", field: "roman", className: "ln" },
  { id: "L3", title: "English", field: "meaning", className: "ln" },
];
