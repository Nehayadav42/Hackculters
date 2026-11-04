
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function hasValidCoordinates(site) {
  if (
    site.latitude === null ||
    site.latitude === undefined ||
    site.longitude === null ||
    site.longitude === undefined ||
    site.latitude === "" ||
    site.longitude === ""
  ) {
    return false;
  }

  const latitude = Number(site.latitude);
  const longitude = Number(site.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-3 border-t border-[#e5e9ed] py-2 text-xs">
      <span className="shrink-0 text-[#66727d]">{label}</span>
      <span className="text-right font-semibold text-[#20384b]">
        {value}
      </span>
    </div>
  );
}

function MonumentInfoPanel({ site, onClose }) {
  if (!site) return null;

  return (
    <div
      className="absolute left-3 top-3 z-20 flex w-[min(290px,calc(100%-24px))] flex-col overflow-hidden rounded-xl border border-[#d2dce2] bg-white shadow-xl"
      style={{
        maxHeight: "calc(100% - 24px)",
      }}
    >
      {/* Panel header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#e5e9ed] px-3 py-2">
        <span className="text-[10px] font-semibold tracking-wider text-[#bf6548]">
          HERITAGE DETAILS
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close monument information"
          className="rounded-md px-2 py-1 text-lg leading-none text-[#66727d] hover:bg-[#eef1f3]"
        >
          ×
        </button>
      </div>

      {/* Scrollable information */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {/* Monument image */}
        <div className="mb-3 h-[125px] overflow-hidden rounded-lg bg-[#e8edf0]">
          {site.thumbnail_url ? (
            <img
              src={site.thumbnail_url}
              alt={site.name || "Heritage monument"}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#66727d]">
              🏛️ Heritage monument
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold leading-snug text-[#1a2c3b]">
          {site.name || site.title || "Heritage site"}
        </h3>

        {/* Location */}
        <p className="mt-1 text-xs leading-relaxed text-[#66727d]">
          📍{" "}
          {[site.city, site.state, site.country]
            .filter(Boolean)
            .join(", ")}
        </p>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {site.is_unesco_site === true && (
            <span className="rounded-full bg-[#e5f3e9] px-2.5 py-1 text-[10px] font-semibold text-[#26733d]">
              UNESCO Site
            </span>
          )}

          {site.is_featured === true && (
            <span className="rounded-full bg-[#fff0df] px-2.5 py-1 text-[10px] font-semibold text-[#a65b23]">
              Featured Heritage
            </span>
          )}

          {site.category && (
            <span className="rounded-full bg-[#edf1f4] px-2.5 py-1 text-[10px] font-semibold text-[#435465]">
              {site.category}
            </span>
          )}
        </div>

        {/* Description */}
        {site.description && (
          <section className="mt-3">
            <h4 className="mb-1 text-xs font-bold text-[#1a2c3b]">
              About this monument
            </h4>
            <p className="text-xs leading-relaxed text-[#526273]">
              {site.description}
            </p>
          </section>
        )}

        {/* Historical information */}
        {site.historical_details && (
          <section className="mt-4 border-t border-[#e5e9ed] pt-3">
            <h4 className="mb-1 text-xs font-bold text-[#1a2c3b]">
              Historical significance
            </h4>
            <p className="text-xs leading-relaxed text-[#526273]">
              {site.historical_details}
            </p>
          </section>
        )}

        {/* Architectural information */}
        {site.architectural_details && (
          <section className="mt-4 border-t border-[#e5e9ed] pt-3">
            <h4 className="mb-1 text-xs font-bold text-[#1a2c3b]">
              Architectural details
            </h4>
            <p className="text-xs leading-relaxed text-[#526273]">
              {site.architectural_details}
            </p>
          </section>
        )}

        <div className="mt-3">
          <InfoRow
            label="Period"
            value={site.architectural_period}
          />

          <InfoRow
            label="Style"
            value={site.architectural_style}
          />

          <InfoRow
            label="Dynasty"
            value={site.dynasty}
          />
        </div>

        {/* Tags */}
        {site.tags?.length > 0 && (
          <section className="mt-3 border-t border-[#e5e9ed] pt-3">
            <h4 className="mb-2 text-xs font-bold text-[#1a2c3b]">
              Tags
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {site.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="rounded-md bg-[#f0f2f4] px-2 py-1 text-[10px] text-[#526273]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fixed action button */}
      {site.id && (
        <div className="shrink-0 border-t border-[#e5e9ed] bg-white p-3">
          <a
            href={`/monuments/${encodeURIComponent(site.id)}`}
            className="block rounded-lg bg-[#bf6548] px-3 py-3 text-center text-xs font-semibold text-white transition hover:bg-[#a95338]"
          >
            View full monument details →
          </a>
        </div>
      )}
    </div>
  );
}

export default function HeritageMap({
  sites = [],
  selectedSiteId = "",
  onSelectSite,
  height = 520,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const onSelectSiteRef = useRef(onSelectSite);
  const previousSelectedIdRef = useRef(null);
  const hasFitBoundsRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);

  // Keep the latest callback.
  useEffect(() => {
    onSelectSiteRef.current = onSelectSite;
  }, [onSelectSite]);

  // 1. Initialize Mapbox.
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!MAPBOX_TOKEN) {
      setMapError(
        "Mapbox access token is missing. Please check VITE_MAPBOX_ACCESS_TOKEN."
      );
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.4126, 23.2599],
      zoom: 4.5,
    });

    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    // Fullscreen includes the information panel too.
    const mapWrapper = mapContainerRef.current.parentElement;

    map.addControl(
      new mapboxgl.FullscreenControl({
        container: mapWrapper,
      }),
      "top-right"
    );

    const handleMapLoad = () => {
      if (!map.getSource("heritage-sites")) {
        map.addSource("heritage-sites", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
          promoteId: "id",
        });
      }

      if (!map.getLayer("heritage-site-circles")) {
        map.addLayer({
          id: "heritage-site-circles",
          type: "circle",
          source: "heritage-sites",
          paint: {
            "circle-radius": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              11,
              7,
            ],
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#bf6548",
              "#2563eb",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.95,
          },
        });
      }

      // Marker click.
      map.on("click", "heritage-site-circles", (event) => {
        const feature = event.features?.[0];

        if (!feature) return;

        const siteId = feature.properties?.id;

        if (siteId) {
          onSelectSiteRef.current?.(String(siteId));
        }
      });

      map.on("mouseenter", "heritage-site-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "heritage-site-circles", () => {
        map.getCanvas().style.cursor = "";
      });

      // Wait until map is fully ready.
      const handleIdle = () => {
        if (!map.isStyleLoaded()) return;

        setMapReady(true);
        map.off("idle", handleIdle);
      };

      map.on("idle", handleIdle);

      if (map.loaded() && map.isStyleLoaded()) {
        setMapReady(true);
        map.off("idle", handleIdle);
      }
    };

    const handleMapError = (event) => {
      console.error("Mapbox error:", event.error || event);

      setMapError(
        event.error?.message || "Unable to load the Mapbox map."
      );
    };

    map.on("load", handleMapLoad);
    map.on("error", handleMapError);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // 2. Send monument data to Mapbox.
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) return;

    const source = map.getSource("heritage-sites");

    if (!source) {
      console.warn("Heritage sites source is not available.");
      return;
    }

    const validSites = sites.filter(hasValidCoordinates);

    const features = validSites.map((site) => ({
      type: "Feature",
      id: String(site.id),
      properties: {
        id: String(site.id),
        name: site.name || site.title || "Heritage site",
        city: site.city || "",
        state: site.state || "",
      },
      geometry: {
        type: "Point",
        coordinates: [
          Number(site.longitude),
          Number(site.latitude),
        ],
      },
    }));

    source.setData({
      type: "FeatureCollection",
      features,
    });

    // Fit all markers once.
    if (features.length > 0 && !hasFitBoundsRef.current) {
      const bounds = new mapboxgl.LngLatBounds();

      features.forEach((feature) => {
        bounds.extend(feature.geometry.coordinates);
      });

      map.fitBounds(bounds, {
        padding: 70,
        maxZoom: 7,
        duration: 1000,
      });

      hasFitBoundsRef.current = true;
    }
  }, [sites, mapReady]);

  // 3. Select monument, move map and update the information panel.
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) return;

    const moveToSelectedSite = () => {
      const site = sites.find(
        (item) => String(item.id) === String(selectedSiteId)
      );

      if (!site || !hasValidCoordinates(site)) {
        console.warn("Selected monument not found:", selectedSiteId);
        return;
      }

      const latitude = Number(site.latitude);
      const longitude = Number(site.longitude);

      console.log(
        "Moving map to selected monument:",
        site.name,
        latitude,
        longitude
      );

      // Update the React information panel.
      setSelectedSite(site);

      // Remove previous marker highlight.
      const previousId = previousSelectedIdRef.current;

      if (previousId && map.getSource("heritage-sites")) {
        map.setFeatureState(
          {
            source: "heritage-sites",
            id: String(previousId),
          },
          { selected: false }
        );
      }

      // Move map to selected monument.
      map.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        duration: 1200,
        essential: true,
      });

      // Highlight selected marker.
      const highlightSelectedMarker = () => {
        if (!map.getSource("heritage-sites")) return;

        map.setFeatureState(
          {
            source: "heritage-sites",
            id: String(site.id),
          },
          { selected: true }
        );

        previousSelectedIdRef.current = String(site.id);
      };

      map.once("idle", highlightSelectedMarker);
    };

    if (map.isStyleLoaded()) {
      moveToSelectedSite();
    } else {
      const handleIdle = () => {
        if (!map.isStyleLoaded()) return;

        map.off("idle", handleIdle);
        moveToSelectedSite();
      };

      map.on("idle", handleIdle);

      return () => {
        map.off("idle", handleIdle);
      };
    }
  }, [selectedSiteId, sites, mapReady]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{ height: `${height}px` }}
    >
      {/* Map error */}
      {mapError && (
        <div
          role="alert"
          className="absolute inset-x-3 top-3 z-30 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {mapError}
        </div>
      )}

      {/* Loading state */}
      {!mapReady && !mapError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#eef1f3] text-sm text-[#66727d]">
          Loading heritage map...
        </div>
      )}

      {/* Mapbox container */}
      <div
  ref={mapContainerRef}
  className="w-full h-full bg-[#eef1f3]"
  style={{
    width: "100%",
    height: "100%",
  }}
/>

      {/* Fixed React information panel */}
      {mapReady && selectedSite && (
        <MonumentInfoPanel
          site={selectedSite}
          onClose={() => setSelectedSite(null)}
        />
      )}
    </div>
  );
}
