
import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ArchitecturalHotspots from "./ArchitecturalHotspots.jsx";
import { HOTSPOTS } from "./hotspots.js";

function Stone({ position, scale, color = "#b99b70" }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function Platform({ position, size, color = "#b99b70" }) {
  return (
    <Stone position={position} scale={[size[0], 0.2, size[1]]} color={color} />
  );
}

function OpenPlatform({ position, size, color = "#b99b70" }) {
  const [width, depth] = size;
  const thickness = 0.22;

  return (
    <group position={position}>
      <Stone position={[0, 0, depth / 2]} scale={[width, thickness, thickness]} color={color} />
      <Stone position={[0, 0, -depth / 2]} scale={[width, thickness, thickness]} color={color} />
      <Stone position={[width / 2, 0, 0]} scale={[thickness, thickness, depth]} color={color} />
      <Stone position={[-width / 2, 0, 0]} scale={[thickness, thickness, depth]} color={color} />
    </group>
  );
}

function Pillar({ position, height = 2, color = "#c7a77d" }) {
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]} castShadow>
      <cylinderGeometry args={[0.12, 0.16, height, 8]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function Water({ position, size }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#477d82" roughness={0.2} metalness={0.3} />
    </mesh>
  );
}

function RaniKiVav({ photos }) {
  const levels = Math.max(4, Math.floor(photos / 3));

  return (
    <group>
      {Array.from({ length: levels }, (_, i) => {
        const size = 7 - i * (5.5 / levels);
        const y = 1.8 - i * (3.2 / levels);

        return (
          <group key={i}>
            <OpenPlatform position={[0, y, 0]} size={[size, size]} />
            <OpenPlatform
              position={[0, y - 0.1, 0]}
              size={[size * 0.45, size * 0.45]}
              color="#8f7659"
            />
          </group>
        );
      })}

      {Array.from({ length: 4 }, (_, side) =>
        Array.from({ length: 7 }, (_, i) => {
          const offset = -2.4 + i * 0.8;

          return (
            <Pillar
              key={`${side}-${i}`}
              position={[
                side === 0 ? offset : side === 1 ? 3 : side === 2 ? -offset : -3,
                -0.5,
                side === 0 ? 3 : side === 1 ? offset : side === 2 ? -3 : -offset
              ]}
              height={1.2 + (i % 3) * 0.25}
            />
          );
        })
      )}

      <Water position={[0, -1.05, 0]} size={[1.5, 1.5]} />
    </group>
  );
}

function AdalajVav() {
  return (
    <group>
      {[3.2, 2.5, 1.8].map((radius, i) => (
        <mesh key={i} position={[0, 1.2 - i * 0.9, 0]}>
          <cylinderGeometry args={[radius, radius, 0.2, 8]} />
          <meshStandardMaterial color={i === 0 ? "#b99b70" : "#9c8060"} />
        </mesh>
      ))}

      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI) / 4;

        return (
          <group key={i}>
            <Pillar
              position={[Math.cos(angle) * 2.65, -0.7, Math.sin(angle) * 2.65]}
              height={2.3}
            />
            <Pillar
              position={[Math.cos(angle) * 1.85, -0.8, Math.sin(angle) * 1.85]}
              height={1.8}
              color="#d0b48b"
            />
          </group>
        );
      })}

      <Water position={[0, -1.1, 0]} size={[1.8, 1.8]} />
    </group>
  );
}

function DadaHarirVav({ photos }) {
  const levels = Math.max(4, Math.floor(photos / 4));

  return (
    <group>
      {Array.from({ length: levels }, (_, i) => (
        <mesh key={i} position={[0, 1.4 - i * 0.65, 0]}>
          <cylinderGeometry args={[3.5 - i * 0.55, 3.5 - i * 0.55, 0.18, 8]} />
          <meshStandardMaterial color="#b99b70" />
        </mesh>
      ))}

      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI) / 4;

        return (
          <Pillar
            key={i}
            position={[Math.cos(angle) * 2.7, -1, Math.sin(angle) * 2.7]}
            height={3}
          />
        );
      })}

      <Water position={[0, -1.25, 0]} size={[1.3, 1.3]} />
    </group>
  );
}

function SuryaKund() {
  return (
    <group>
      {[6, 5, 4, 3].map((size, i) => (
        <Platform
          key={i}
          position={[0, 1.1 - i * 0.55, 0]}
          size={[size, size * 0.85]}
          color={i % 2 === 0 ? "#b99b70" : "#a78a66"}
        />
      ))}

      {Array.from({ length: 4 }, (_, side) =>
        Array.from({ length: 7 }, (_, i) => {
          const offset = -2.7 + i * 0.9;

          return (
            <Stone
              key={`${side}-${i}`}
              position={[
                side === 0 ? offset : side === 1 ? 2.5 : side === 2 ? offset : -2.5,
                -0.1,
                side === 0 ? 2.2 : side === 1 ? offset : side === 2 ? -2.2 : offset
              ]}
              scale={[0.48, 0.35, 0.48]}
            />
          );
        })
      )}

      <Water position={[0, -0.8, 0]} size={[2.2, 1.7]} />
    </group>
  );
}

function ChandBaori() {
  return (
    <group>
      <Platform position={[0, 1.4, 0]} size={[7, 7]} />

      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 13 }, (_, col) => {
          const side = col < 6 ? -1 : 1;
          const x = -3 + col * 0.5;
          const z = side * (2.8 - row * 0.27);
          const y = 1.1 - row * 0.32;

          return (
            <Stone
              key={`${row}-${col}`}
              position={[x, y, z]}
              scale={[0.38, 0.22, 0.32]}
              color={(row + col) % 2 === 0 ? "#c7a77d" : "#a98c68"}
            />
          );
        })
      )}

      {Array.from({ length: 4 }, (_, i) => (
        <Pillar
          key={i}
          position={[-2.4 + i * 1.6, -0.6, -2.1]}
          height={1.8}
        />
      ))}

      <Water position={[0, -1.15, 0]} size={[2.2, 1.8]} />
    </group>
  );
}

function AgrasenBaoli() {
  return (
    <group>
      <Platform position={[0, 1.2, 0]} size={[3.5, 8]} />

      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i}>
          <Platform
            position={[0, 0.8 - i * 0.55, 0]}
            size={[3.1 - i * 0.35, 7 - i * 0.65]}
            color="#ad8e68"
          />

          {[-1, 1].map((side) => (
            <Pillar
              key={side}
              position={[side * (1.35 - i * 0.13), -0.8, -2.5 + i * 0.3]}
              height={2 - i * 0.15}
            />
          ))}
        </group>
      ))}

      {Array.from({ length: 7 }, (_, i) => (
        <Stone
          key={i}
          position={[-1.2 + i * 0.4, -0.3, 2.7]}
          scale={[0.35, 0.2, 0.35]}
          color="#d0b48b"
        />
      ))}

      <Water position={[0, -1.15, 0]} size={[1.3, 2.2]} />
    </group>
  );
}

function MonumentModel({
  site,
  photos,
  selectedFeature,
  onSelectFeature,
}) {
  let model;

  switch (site?.name) {
    case "Adalaj Vav":
      model = <AdalajVav />;
      break;
    case "Dada Harir ni Vav":
      model = <DadaHarirVav photos={photos} />;
      break;
    case "Surya Kund":
      model = <SuryaKund />;
      break;
    case "Chand Baori":
      model = <ChandBaori />;
      break;
    case "Agrasen ki Baoli":
      model = <AgrasenBaoli />;
      break;
    default:
      model = <RaniKiVav photos={photos} />;
  }

  return (
    <group>
      {model}
      <ArchitecturalHotspots
        site={site}
        selectedFeature={selectedFeature}
        onSelectFeature={onSelectFeature}
      />
    </group>
  );
}

export default function StepwellCanvas({ photos = 12, site }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const controlsRef = useRef(null);
  const activeFeature =
    selectedFeature && selectedFeature.siteName === site?.name
      ? selectedFeature.item
      : null;
  const featureItems = HOTSPOTS[site?.name] || HOTSPOTS["Rani ki Vav"];

  const selectFeature = (item) => {
    setSelectedFeature((current) =>
      current?.siteName === site?.name && current.item.title === item.title
        ? null
        : { item, siteName: site?.name }
    );
  };

  const resetView = () => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.reset();
    controls.update();
  };

  const adjustZoom = (direction) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const cameraOffset = controls.object.position
      .clone()
      .sub(controls.target);
    const distance = cameraOffset.length();
    const nextDistance = Math.min(
      controls.maxDistance,
      Math.max(
        controls.minDistance,
        distance * (direction === "in" ? 0.8 : 1.25)
      )
    );

    cameraOffset.setLength(nextDistance);
    controls.object.position.copy(controls.target).add(cameraOffset);
    controls.update();
  };

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-[999] flex flex-col bg-[#102d26]"
          : "stepwell-canvas relative"
      }
    >
      {expanded && (
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#c49a58]">
              HERITAGEVERSE 3D EXPLORER
            </p>
            <h2 className="mt-1 font-serif text-2xl text-white">
              {site?.name || "Monument Explorer"}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded-full border border-white/30 px-5 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Close ×
          </button>
        </div>
      )}

      <div className={`relative min-h-0 flex-1 ${expanded ? "" : "h-full w-full"}`}>
        <Canvas
          camera={{ position: [9, 7, 10], fov: 38 }}
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#173b32"]} />
          <ambientLight intensity={1.7} />
          <directionalLight position={[7, 10, 6]} intensity={2.5} castShadow />
          <directionalLight position={[-5, 4, -5]} intensity={1} />

          <MonumentModel
            site={site}
            photos={photos}
            selectedFeature={selectedFeature}
            onSelectFeature={setSelectedFeature}
          />

          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.55, 0]}
            receiveShadow
          >
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#173b32" roughness={1} />
          </mesh>

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableRotate
            enableZoom
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.7}
            minDistance={6}
            maxDistance={17}
            minPolarAngle={0.35}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>

        {activeFeature && (
          <div className="pointer-events-none absolute inset-0 z-30">
            <div
              role="region"
              aria-label="Architectural detail"
              className="pointer-events-auto absolute bottom-14 right-4 w-[min(300px,calc(100%-32px))] rounded-xl border border-white/15 bg-[#102d26]/95 p-5 text-white shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[9px] font-semibold tracking-[0.2em] text-[#c49a58]">
                  ARCHITECTURAL DETAIL
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  aria-label="Close details"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xl text-white/70 hover:bg-white/10"
                >
                  ×
                </button>
              </div>

              <h3 className="mb-2 font-serif text-lg font-medium">
                {activeFeature.title}
              </h3>
              <p className="mb-3 text-xs leading-5 text-white/75">
                {activeFeature.description}
              </p>
              <span className="inline-flex rounded-full border border-[#c49a58]/40 bg-[#c49a58]/10 px-3 py-1 text-[9px] font-medium tracking-wide text-[#e2bd7f]">
                {activeFeature.category}
              </span>
            </div>
          </div>
        )}

        <div
          role="group"
          aria-label="Explore architectural details"
          className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#102d26]/85 p-1.5 shadow-lg backdrop-blur"
        >
          {featureItems.map((item, index) => {
            const number = index + 1;
            const isActive = activeFeature?.title === item.title;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => selectFeature(item)}
                aria-label={`Explore feature ${number}: ${item.title}`}
                title={item.title}
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition ${
                  isActive
                    ? "border-[#e8d2a5] bg-[#c49a58] text-white"
                    : "border-white/30 bg-[#98713e] text-white hover:bg-[#c49a58]"
                }`}
              >
                {number}
              </button>
            );
          })}
        </div>

        <div className="absolute left-3 top-3 z-30 flex gap-2">
          <button
            type="button"
            onClick={resetView}
            className="rounded-lg border border-white/15 bg-[#102d26]/90 px-4 py-2 text-xs text-white shadow-lg backdrop-blur transition hover:bg-[#24483d]"
          >
            Reset View
          </button>

          <button
            type="button"
            onClick={() => adjustZoom("in")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#102d26]/90 text-lg text-white shadow-lg backdrop-blur transition hover:bg-[#24483d]"
            aria-label="Zoom in"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => adjustZoom("out")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#102d26]/90 text-lg text-white shadow-lg backdrop-blur transition hover:bg-[#24483d]"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="absolute bottom-4 right-4 z-30 rounded-full border border-white/25 bg-[#102d26]/90 px-4 py-2 text-xs text-white shadow-lg backdrop-blur transition hover:bg-[#24483d]"
          >
            ⛶ Expand Viewer
          </button>
        )}

        <div className="pointer-events-none absolute bottom-4 left-4 z-10 text-[10px] tracking-wide text-white/55">
          DRAG TO ROTATE · SCROLL TO ZOOM · SELECT A MARKER
        </div>
      </div>
    </div>
  );
}
