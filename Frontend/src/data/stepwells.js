export const STEPWELLS = [
  { name: "Rani ki Vav", place: "Patan", state: "Gujarat", period: "11th c.", architecturalForm: "Axial, seven-level stepwell with pillared galleries", lon: 72.10, lat: 23.86,
    text: "A stepwell built as an inverted temple. Sculpted panels line seven levels of stairs." },
  { name: "Adalaj Vav", place: "Adalaj", state: "Gujarat", period: "15th c.", architecturalForm: "Octagonal pavilion and stepped well", lon: 72.58, lat: 23.17,
    text: "Five storeys of octagonal landings. Carvings blend Hindu and Islamic motifs. Commissioned by a queen." },
  { name: "Dada Harir ni Vav", place: "Ahmedabad", state: "Gujarat", period: "15th c.", architecturalForm: "Narrow, multi-storey stepwell with a deep axial stair", lon: 72.67, lat: 23.01,
    text: "Built by a woman of the sultan’s household. The wall inscriptions are in Sanskrit and Arabic." },
  { name: "Surya Kund", place: "Modhera", state: "Gujarat", period: "11th c.", architecturalForm: "Open rectangular stepped tank with shrine niches", lon: 72.13, lat: 23.58,
    text: "A rectangular tank with hundreds of small shrines set into its steps, facing the Sun Temple." },
  { name: "Chand Baori", place: "Abhaneri", state: "Rajasthan", period: "9th c.", architecturalForm: "Deep square baori with dense stair flights on three sides", lon: 76.61, lat: 27.00,
    text: "Thousands of steps in precise triangles on three sides, descending many storeys to the water." },
  { name: "Agrasen ki Baoli", place: "New Delhi", state: "Delhi", period: "14th c.", architecturalForm: "Long, narrow baoli framed by arched galleries", lon: 77.22, lat: 28.63,
    text: "A long, narrow stepwell in the middle of the city. Arched niches flank the stairs." },
];

export const SORTED_STEPWELLS = [...STEPWELLS].sort((first, second) =>
  first.name.localeCompare(second.name)
);
