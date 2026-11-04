
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

export default function HeritageMap({
  sites = [],
  selectedSiteId = "",
  onSelectSite,
  height = 520,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const onSelectSiteRef = useRef(onSelectSite);
  const previousSelectedIdRef = useRef(null);
  const hasFitBoundsRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  // Keep the latest callback without reinitializing the map.
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

    map.addControl(
      new mapboxgl.FullscreenControl(),
      "top-right"
    );

    const handleMapLoad = () => {
      // Add the GeoJSON source for heritage locations.
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

      // Add the monument marker layer.
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

      // Handle marker clicks.
      map.on("click", "heritage-site-circles", (event) => {
        const feature = event.features?.[0];

        if (!feature) return;

        const siteId = feature.properties?.id;

        if (siteId) {
          onSelectSiteRef.current?.(String(siteId));
        }
      });

      // Change cursor when hovering over markers.
      map.on("mouseenter", "heritage-site-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "heritage-site-circles", () => {
        map.getCanvas().style.cursor = "";
      });

      // Wait until Mapbox has finished rendering and is idle.
      const handleIdle = () => {
        if (!map.isStyleLoaded()) return;

        setMapReady(true);
        map.off("idle", handleIdle);
      };

      map.on("idle", handleIdle);

      // In case the map is already idle.
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
      popupRef.current?.remove();
      popupRef.current = null;

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
      console.warn("Heritage sites GeoJSON source is not available.");
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

    // Fit all markers on the map only once.
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

  // 3. Move the map whenever the selected monument changes.
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) return;

    const moveToSelectedSite = () => {
      const selectedSite = sites.find(
        (site) => String(site.id) === String(selectedSiteId)
      );

      if (!selectedSite || !hasValidCoordinates(selectedSite)) {
        console.warn("Selected monument not found:", selectedSiteId);
        return;
      }

      const latitude = Number(selectedSite.latitude);
      const longitude = Number(selectedSite.longitude);

      console.log(
        "Moving map to selected monument:",
        selectedSite.name,
        latitude,
        longitude
      );

      // Remove the previous selected marker highlight.
      const previousId = previousSelectedIdRef.current;

      if (
        previousId &&
        map.getSource("heritage-sites")
      ) {
        map.setFeatureState(
          {
            source: "heritage-sites",
            id: String(previousId),
          },
          {
            selected: false,
          }
        );
      }

      // Move the map to the selected monument.
      map.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        duration: 1200,
        essential: true,
      });

      // Remove the previous popup.
      popupRef.current?.remove();

      // Create popup content safely.
      const popupContent = document.createElement("div");

      const heading = document.createElement("strong");
      heading.textContent =
        selectedSite.name ||
        selectedSite.title ||
        "Heritage site";

      popupContent.appendChild(heading);

      const location = document.createElement("p");
      location.textContent = [
        selectedSite.city,
        selectedSite.state,
      ]
        .filter(Boolean)
        .join(", ");

      popupContent.appendChild(location);

      // Display the selected monument popup.
      popupRef.current = new mapboxgl.Popup({
        offset: 18,
        closeButton: true,
      })
        .setLngLat([longitude, latitude])
        .setDOMContent(popupContent)
        .addTo(map);

      // Highlight the selected marker after the source data is rendered.
      const highlightSelectedMarker = () => {
        if (!map.getSource("heritage-sites")) return;

        map.setFeatureState(
          {
            source: "heritage-sites",
            id: String(selectedSite.id),
          },
          {
            selected: true,
          }
        );

        previousSelectedIdRef.current = String(selectedSite.id);
      };

      map.once("idle", highlightSelectedMarker);
    };

    // Wait for the map style if it is still loading.
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
    <div className="relative w-full overflow-hidden rounded-xl">
      {mapError && (
        <div
          role="alert"
          className="absolute inset-x-3 top-3 z-10 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {mapError}
        </div>
      )}

      {!mapReady && !mapError && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-[#eef1f3] text-sm text-[#66727d]"
        >
          Loading heritage map...
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: `${height}px`,
        }}
        className="bg-[#eef1f3]"
      />
    </div>
  );
}
