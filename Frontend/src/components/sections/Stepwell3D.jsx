
import Section from "../layout/Section.jsx";
import StepwellCanvas from "../stepwell/StepwellCanvas.jsx";
import { STEPWELLS } from "../../data/stepwells.js";
import { lazy, Suspense, useState } from "react";

const CesiumCityViewer = lazy(() => import("../city/CesiumCityViewer.jsx"));

export default function Stepwell3D() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState("monument");

  const featuredSite = STEPWELLS[selectedIndex];
  const cityMode = mode === "city";

  return (
    <Section tone="s3" dark>
      <div className="stepwell-experience">
        <div className="stepwell-heading">
          <span className="eyebrow">
            DIGITAL HERITAGE LABORATORY
          </span>

          <h2>
            Architecture that
            <br />
            <span>comes alive.</span>
          </h2>

          <p>
            Explore different historic Indian water structures
            through interactive architectural visualizations.
          </p>
        </div>

        <div className="stepwell-mode-switch" role="group" aria-label="3D experience mode">
          <button
            type="button"
            aria-pressed={!cityMode}
            onClick={() => setMode("monument")}
          >
            Monument interpretation
          </button>
          <button
            type="button"
            aria-pressed={cityMode}
            onClick={() => setMode("city")}
          >
            Explore 3D City · Bhopal
          </button>
        </div>

        {cityMode ? (
          <div className="stepwell-layout">
            <div className="stepwell-viewer stepwell-city-viewer">
              <div className="viewer-topbar">
                <span>BHOPAL · CITY-SCALE VIEW</span>
                <span className="viewer-status">
                  <i />
                  CESIUM ION · OSM BUILDINGS
                </span>
              </div>
              <Suspense
                fallback={
                  <div className="cesium-city-loading" role="status">
                    Preparing the 3D city viewer...
                  </div>
                }
              >
                <CesiumCityViewer />
              </Suspense>
              <div className="viewer-caption">
                <span>Bhopal, Madhya Pradesh</span>
                <span>DRAG TO ORBIT · SCROLL TO ZOOM</span>
              </div>
            </div>

            <aside className="stepwell-info">
              <span className="info-label">CITY-SCALE EXPLORATION</span>
              <h3>Bhopal, Madhya Pradesh</h3>
              <p className="stepwell-description">
                Explore available OpenStreetMap building geometry around
                Bhopal in a globe-based 3D view.
              </p>
              <p className="stepwell-model-note">
                OSM Buildings are city-level map data, not verified or
                surveyed models of Gohar Mahal, Taj-ul-Masajid, or any other
                individual monument.
              </p>
            </aside>
          </div>
        ) : (
          <div className="stepwell-layout">
            <div className="stepwell-viewer">
              <div className="viewer-topbar">
                <span>SITE-SPECIFIC SCHEMATIC</span>
                <span className="viewer-status">
                  <i />
                  INTERPRETIVE MODEL
                </span>
              </div>

              <StepwellCanvas
                key={featuredSite.name}
                site={featuredSite}
              />

              <div className="viewer-caption">
                <span>{featuredSite.name}</span>
                <span>DRAG TO ROTATE · SCROLL TO ZOOM</span>
              </div>
            </div>

            <aside className="stepwell-info">
              <span className="info-label">EXPLORE HERITAGE</span>

              <label
                htmlFor="stepwell-select"
                className="mt-5 block text-xs text-white/85"
              >
                SELECT STRUCTURE
              </label>

              <select
                id="stepwell-select"
                value={selectedIndex}
                onChange={(event) =>
                  setSelectedIndex(Number(event.target.value))
                }
                className="mt-2 w-full rounded-lg border border-white/20 bg-[#2e4658] px-3 py-3 text-sm text-white outline-none focus:border-[#bf6548]"
              >
                {STEPWELLS.map((site, index) => (
                  <option
                    key={site.name}
                    value={index}
                    className="bg-[#1a2c3b] text-white"
                  >
                    {site.name}
                  </option>
                ))}
              </select>

              <h3>{featuredSite.name}</h3>
              <p className="stepwell-location">
                {featuredSite.place}, {featuredSite.state}
              </p>
              <div className="info-divider" />
              <div className="info-detail">
                <span>HISTORICAL PERIOD</span>
                <strong>{featuredSite.period}</strong>
              </div>
              <div className="info-detail">
                <span>ARCHITECTURAL FORM</span>
                <strong>{featuredSite.architecturalForm}</strong>
              </div>
              <p className="stepwell-description">{featuredSite.text}</p>
              <p className="stepwell-model-note">
                A navigable, geometry-based interpretation of the site's form.
                It is not a measured survey or a photogrammetry reconstruction.
              </p>
            </aside>
          </div>
        )}

        <div className="stepwell-controls">
          <div className="controls-heading">
            <div>
              <span className="info-label">MODEL INTERACTION</span>
              <h3>
                {cityMode
                  ? "Explore the Bhopal city model"
                  : "Explore the structure in three dimensions"}
              </h3>
            </div>
          </div>
          <p className="simulation-note">
            {cityMode
              ? "The city view uses Cesium ion OSM Buildings asset 96188 and OpenStreetMap imagery. Building coverage and geometry depend on source data and do not establish the accuracy of individual monuments."
              : "Rotate the model to inspect its stepped well, retaining courses, water basin, and colonnade. Model proportions are interpretive; verified site photographs and survey data are still needed for a faithful digital twin."}
          </p>
        </div>
      </div>
    </Section>
  );
}
