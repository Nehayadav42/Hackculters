import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "./cesium-city.css";

const OSM_BUILDINGS_ASSET_ID = 96188;

export default function CesiumCityViewer() {
  const containerRef = useRef(null);
  const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN?.trim() || "";
  const [status, setStatus] = useState(
    ionToken ? "loading" : "missing-token"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ionToken) return undefined;

    let disposed = false;
    let viewer;
    let reportedImageryError = false;
    let reportedTilesetError = false;

    async function initializeCity() {
      try {
        if (disposed || !containerRef.current) return;

        Cesium.Ion.defaultAccessToken = ionToken;

        const imageryProvider = new Cesium.OpenStreetMapImageryProvider({
          url: "https://tile.openstreetmap.org/",
          credit: new Cesium.Credit(
            "© OpenStreetMap contributors",
            true,
            "https://www.openstreetmap.org/copyright"
          ),
          enablePickFeatures: false,
        });

        viewer = new Cesium.Viewer(containerRef.current, {
          animation: false,
          baseLayer: new Cesium.ImageryLayer(imageryProvider),
          baseLayerPicker: false,
          fullscreenButton: true,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          navigationHelpButton: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          vrButton: false,
          scene3DOnly: true,
        });

        imageryProvider.errorEvent.addEventListener(() => {
          if (disposed || reportedImageryError) return;
          reportedImageryError = true;
          setError("OpenStreetMap background tiles are temporarily unavailable.");
        });

        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(77.4126, 23.2599, 6500),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-42),
            roll: 0,
          },
        });

        const buildings = await Cesium.Cesium3DTileset.fromIonAssetId(
          OSM_BUILDINGS_ASSET_ID
        );

        if (disposed) {
          buildings.destroy();
          return;
        }

        buildings.tileFailed.addEventListener(() => {
          if (disposed || reportedTilesetError) return;
          reportedTilesetError = true;
          setError("Some Cesium ion building tiles could not be loaded.");
        });

        viewer.scene.primitives.add(buildings);
        setStatus("ready");
      } catch {
        if (disposed) return;
        setError(
          "Cesium ion could not load OSM Buildings. Check the browser token, asset access, and network connection."
        );
        setStatus("error");
      }
    }

    void initializeCity();

    return () => {
      disposed = true;
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, [ionToken]);

  return (
    <div className="cesium-city-shell">
      <div
        ref={containerRef}
        className="cesium-city-map"
        aria-label="Interactive Bhopal 3D city map"
      />

      {status === "missing-token" && (
        <div className="cesium-city-message" role="status">
          <strong>Cesium ion token required</strong>
          <p>
            Add <code>VITE_CESIUM_ION_TOKEN</code> to{" "}
            <code>Frontend/.env.local</code>, then restart the frontend.
          </p>
          <a href="https://ion.cesium.com/" target="_blank" rel="noreferrer">
            Manage a restricted browser token
          </a>
        </div>
      )}

      {status === "loading" && (
        <p className="cesium-city-message" role="status">
          Loading Bhopal imagery and city buildings...
        </p>
      )}

      {status === "error" && (
        <p className="cesium-city-message" role="alert">
          {error}
        </p>
      )}

      {status === "ready" && error && (
        <p className="cesium-city-message" role="status">
          {error}
        </p>
      )}

      <p className="cesium-city-attribution">
        3D buildings:{" "}
        <a
          href="https://ion.cesium.com/assets/96188"
          target="_blank"
          rel="noreferrer"
        >
          Cesium ion OSM Buildings
        </a>{" "}
        · Map data ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}
