import { useLayoutEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { HOTSPOTS } from "./hotspots.js";

const MODEL_PROFILES = {
  "Rani ki Vav": {
    levels: 7,
    width: 5.6,
    depth: 9.6,
    plan: "axial",
    stairSides: ["front"],
    gallerySides: ["left", "right"],
    galleryCount: 6,
    arches: true,
  },
  "Adalaj Vav": {
    levels: 6,
    width: 7.6,
    depth: 7.6,
    plan: "octagonal",
    stairSides: ["front"],
    gallerySides: ["front", "back", "left", "right"],
    galleryCount: 4,
    arches: true,
  },
  "Dada Harir ni Vav": {
    levels: 8,
    width: 4.6,
    depth: 9.4,
    plan: "linear",
    stairSides: ["front"],
    gallerySides: ["left", "right"],
    galleryCount: 4,
    arches: true,
  },
  "Surya Kund": {
    levels: 4,
    width: 10.4,
    depth: 8.8,
    plan: "kund",
    stairSides: ["front", "back", "left", "right"],
    gallerySides: [],
    shrines: true,
    waterShape: "rectangular",
  },
  "Chand Baori": {
    levels: 10,
    width: 8.8,
    depth: 8.8,
    plan: "deep-square",
    stairSides: ["front", "left", "right"],
    gallerySides: ["back"],
    galleryCount: 7,
    arches: true,
  },
  "Agrasen ki Baoli": {
    levels: 8,
    width: 4.2,
    depth: 10.8,
    plan: "linear",
    stairSides: ["front"],
    gallerySides: ["left", "right", "back"],
    galleryCount: 4,
    arches: true,
  },
};

const STONE_TONES = ["#a58b68", "#947a5c", "#80684e", "#b39a77"];

function StoneBlock({
  position,
  scale,
  rotation = [0, 0, 0],
  color = "#b99b70",
  roughness = 0.88,
}) {
  return (
    <mesh
      position={position}
      scale={scale}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

function Tier({ level, width, depth, y, plan }) {
  const thickness = 0.22;
  const ledge = 0.28;
  const tone = STONE_TONES[level % STONE_TONES.length];
  const inset = level * 0.5;
  const tierWidth = Math.max(1.7, width - inset);
  const tierDepth = Math.max(1.7, depth - inset);

  if (plan === "octagonal") {
    const segmentLength = Math.min(tierWidth, tierDepth) * 0.77;

    return (
      <group>
        {Array.from({ length: 8 }, (_, index) => {
          const angle = (index * Math.PI) / 4;
          return (
            <StoneBlock
              key={index}
              position={[
                Math.cos(angle) * tierWidth * 0.42,
                y,
                Math.sin(angle) * tierDepth * 0.42,
              ]}
              rotation={[0, -angle + Math.PI / 2, 0]}
              scale={[segmentLength, thickness, ledge]}
              color={tone}
            />
          );
        })}
      </group>
    );
  }

  return (
    <group>
      <StoneBlock
        position={[0, y, -tierDepth / 2]}
        scale={[tierWidth, thickness, ledge]}
        color={tone}
      />
      <StoneBlock
        position={[0, y, tierDepth / 2]}
        scale={[tierWidth, thickness, ledge]}
        color={tone}
      />
      <StoneBlock
        position={[-tierWidth / 2, y, 0]}
        scale={[ledge, thickness, tierDepth]}
        color={tone}
      />
      <StoneBlock
        position={[tierWidth / 2, y, 0]}
        scale={[ledge, thickness, tierDepth]}
        color={tone}
      />
      <StoneBlock
        position={[0, y - 0.2, -tierDepth / 2 + 0.22]}
        scale={[tierWidth * 0.84, 0.12, 0.08]}
        color="#705c45"
      />
      {plan === "deep-square" && (
        <StoneBlock
          position={[0, y - 0.2, tierDepth / 2 - 0.22]}
          scale={[tierWidth * 0.84, 0.12, 0.08]}
          color="#705c45"
        />
      )}
    </group>
  );
}

function DescendingStairs({ side, width, depth, count }) {
  const steps = Array.from({ length: count }, (_, index) => {
    const y = 1.22 - index * 0.105;
    const inset = index * 0.14;
    const offset = side === "front" || side === "right" ? 1 : -1;
    const position =
      side === "front" || side === "back"
        ? [0, y, offset * (depth / 2 - 0.46 - inset)]
        : [offset * (width / 2 - 0.46 - inset), y, 0];
    const scale =
      side === "front" || side === "back"
        ? [Math.max(1.1, width * 0.28), 0.105, 0.23]
        : [0.23, 0.105, Math.max(1.1, depth * 0.28)];

    return (
      <StoneBlock
        key={`${side}-${index}`}
        position={position}
        scale={scale}
        color={STONE_TONES[index % STONE_TONES.length]}
      />
    );
  });

  return <group>{steps}</group>;
}

function Colonnade({
  width,
  depth,
  sides,
  count,
  arches,
}) {
  const bays = sides.flatMap((side) =>
    Array.from({ length: count }, (_, index) => {
      const progress = count === 1 ? 0.5 : index / (count - 1);
      const alongWidth = (progress - 0.5) * width * 0.72;
      const alongDepth = (progress - 0.5) * depth * 0.72;
      const isEnd = side === "front" || side === "back";
      const nextProgress = Math.min(
        1,
        progress + 1 / Math.max(1, count - 1)
      );

      return {
        side,
        index,
        x: isEnd ? alongWidth : (side === "right" ? 1 : -1) * width * 0.43,
        z: isEnd
          ? (side === "back" ? -1 : 1) * depth * 0.43
          : alongDepth,
        rotation: isEnd ? 0 : Math.PI / 2,
        archX: isEnd ? (nextProgress + progress - 1) * width * 0.36 : (side === "right" ? 1 : -1) * width * 0.43,
        archZ: isEnd
          ? (side === "back" ? -1 : 1) * depth * 0.43
          : (nextProgress + progress - 1) * depth * 0.36,
      };
    })
  );

  return (
    <group>
      {bays.map(({ side, index, x, z, rotation, archX, archZ }) => (
        <group key={`${side}-${index}`}>
          <mesh position={[x, 0.96, z]} castShadow receiveShadow>
            <cylinderGeometry args={[0.09, 0.14, 1.5, 12]} />
            <meshStandardMaterial color="#aa9271" roughness={0.88} />
          </mesh>
          <StoneBlock
            position={[x, 0.22, z]}
            scale={[0.32, 0.16, 0.32]}
            color="#705c45"
          />
          <mesh position={[x, 1.76, z]} castShadow>
            <cylinderGeometry args={[0.18, 0.13, 0.16, 8]} />
            <meshStandardMaterial color="#b39a77" roughness={0.88} />
          </mesh>
          <StoneBlock
            position={[x, 1.7, z]}
            scale={[0.3, 0.16, 0.3]}
            color="#d1bc98"
          />
          {arches && index < count - 1 && (
            <mesh
              position={[
                archX,
                1.55,
                archZ,
              ]}
              rotation={[0, rotation, 0]}
              castShadow
            >
              <torusGeometry args={[0.34, 0.055, 8, 20, Math.PI]} />
              <meshStandardMaterial color="#aa9271" roughness={0.88} />
            </mesh>
          )}
        </group>
      ))}
      {sides.map((side) => {
        const isEnd = side === "front" || side === "back";
        const z = isEnd
          ? (side === "back" ? -1 : 1) * depth * 0.43
          : 0;
        const x = isEnd
          ? 0
          : (side === "right" ? 1 : -1) * width * 0.43;

        return (
          <StoneBlock
            key={`beam-${side}`}
            position={[x, 1.82, z]}
            scale={isEnd ? [width * 0.78, 0.2, 0.38] : [0.38, 0.2, depth * 0.78]}
            color="#d1bc98"
          />
        );
      })}
    </group>
  );
}

function ShrinePavilions({ width, depth }) {
  const shrines = [
    [-width * 0.38, -depth * 0.38],
    [width * 0.38, -depth * 0.38],
    [-width * 0.38, depth * 0.38],
    [width * 0.38, depth * 0.38],
  ];

  return (
    <group>
      {shrines.map(([x, z], index) => (
        <group key={index} position={[x, -0.1, z]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.2, 0.8, 10]} />
            <meshStandardMaterial color="#aa9271" roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <coneGeometry args={[0.35, 0.34, 8]} />
            <meshStandardMaterial color="#80684e" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function StepwellModel({ site }) {
  const profile = MODEL_PROFILES[site?.name] || MODEL_PROFILES["Rani ki Vav"];
  const {
    levels,
    width,
    depth,
    plan,
    stairSides,
    gallerySides,
    galleryCount,
    arches,
    shrines,
    waterShape,
  } = profile;
  const tiers = Array.from({ length: levels }, (_, level) => (
    <Tier
      key={`tier-${level}`}
      level={level}
      width={width}
      depth={depth}
      y={1.35 - level * 0.28}
      plan={plan}
    />
  ));
  const stairRuns = stairSides.map((side) => (
      <DescendingStairs
        key={side}
        side={side}
        width={width}
        depth={depth}
        count={levels * 3}
      />
  ));

  return (
    <group>
      <StoneBlock
        position={[0, -1.58, 0]}
        scale={[width + 2.2, 0.32, depth + 2.2]}
        color="#6f614e"
      />
      {tiers}
      {stairRuns}
      {gallerySides.length > 0 && (
        <Colonnade
          width={width}
          depth={depth}
          sides={gallerySides}
          count={galleryCount}
          arches={arches}
        />
      )}
      {shrines && <ShrinePavilions width={width} depth={depth} />}

      {waterShape === "rectangular" ? (
        <mesh position={[0, -1.31, 0]} receiveShadow>
          <boxGeometry args={[width * 0.28, 0.08, depth * 0.25]} />
          <meshStandardMaterial color="#3f7781" roughness={0.24} metalness={0.12} />
        </mesh>
      ) : (
        <mesh
          position={[0, -1.31, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[0.82, 48]} />
          <meshStandardMaterial color="#3f7781" roughness={0.24} metalness={0.12} />
        </mesh>
      )}
      {waterShape !== "rectangular" && (
        <mesh
          position={[0, -1.29, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.9, 1.04, 48]} />
          <meshStandardMaterial color="#d0b48b" roughness={0.8} />
        </mesh>
      )}
    </group>
  );
}

function FitStepwellCamera({ site, controlsRef }) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (size.width <= 0 || size.height <= 0) return;

    const profile =
      MODEL_PROFILES[site?.name] || MODEL_PROFILES["Rani ki Vav"];
    const radius = Math.hypot(
      (profile.width + 2.2) / 2,
      (profile.depth + 2.2) / 2,
      1.9
    );
    const verticalHalfFov = MathUtils.degToRad(camera.fov / 2);
    const horizontalHalfFov = Math.atan(
      Math.tan(verticalHalfFov) * (size.width / size.height)
    );
    const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov);
    const distance = (radius / Math.sin(limitingHalfFov)) * 1.15;
    const target = new Vector3(0, -0.15, 0);
    const direction = new Vector3(0.62, 0.48, 0.62).normalize();

    camera.position.copy(target).addScaledVector(direction, distance);
    camera.lookAt(target);

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(target);
      controls.maxDistance = Math.max(40, distance * 1.5);
      controls.update();
      controls.saveState();
    }
  }, [camera, controlsRef, site?.name, size.height, size.width]);

  return null;
}

export default function StepwellCanvas({ site }) {
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

    const cameraOffset = controls.object.position.clone().sub(controls.target);
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
          ? "fixed inset-0 z-[999] flex flex-col bg-[#12202d]"
          : "stepwell-canvas relative"
      }
    >
      {expanded && (
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#bf6548]">
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
          camera={{ position: [9, 5, 11], fov: 40 }}
          shadows
          dpr={[1, 1.4]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#192b3a"]} />
          <fog attach="fog" args={["#192b3a", 38, 72]} />
          <ambientLight intensity={0.65} />
          <hemisphereLight args={["#e8e1d3", "#243748", 0.85]} />
          <directionalLight
            position={[7, 10, 6]}
            intensity={1.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-5, 4, -5]} intensity={0.8} />
          <StepwellModel site={site} />
          <FitStepwellCamera site={site} controlsRef={controlsRef} />
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.77, 0]}
            receiveShadow
          >
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial color="#192b3a" roughness={1} />
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
            maxDistance={48}
            minPolarAngle={0.35}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>

        {activeFeature && (
          <div className="pointer-events-none absolute inset-0 z-30">
            <div
              role="region"
              aria-label="Architectural detail"
              className="pointer-events-auto absolute bottom-14 right-4 w-[min(300px,calc(100%-32px))] rounded-xl border border-white/15 bg-[#12202d]/95 p-5 text-white shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[9px] font-semibold tracking-[0.2em] text-[#bf6548]">
                  ARCHITECTURAL DETAIL
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  aria-label="Close details"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xl text-white/90 hover:bg-white/10"
                >
                  ×
                </button>
              </div>
              <h3 className="mb-2 font-serif text-lg font-medium">
                {activeFeature.title}
              </h3>
              <p className="mb-3 text-xs leading-5 text-white/90">
                {activeFeature.description}
              </p>
              <span className="inline-flex rounded-full border border-[#bf6548]/40 bg-[#bf6548]/10 px-3 py-1 text-[9px] font-medium tracking-wide text-[#e2bd7f]">
                {activeFeature.category}
              </span>
            </div>
          </div>
        )}

        <div
          role="group"
          aria-label="Explore architectural details"
          className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#12202d]/85 p-1.5 shadow-lg backdrop-blur"
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
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                  isActive
                    ? "border-[#e8d2a5] bg-[#bf6548] text-white"
                    : "border-white/30 bg-[#a95037] text-white hover:bg-[#bf6548]"
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
            className="rounded-lg border border-white/15 bg-[#12202d]/90 px-4 py-2 text-xs text-white shadow-lg backdrop-blur transition hover:bg-[#2e4658]"
          >
            Reset view
          </button>
          <button
            type="button"
            onClick={() => adjustZoom("in")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#12202d]/90 text-lg text-white shadow-lg backdrop-blur transition hover:bg-[#2e4658]"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => adjustZoom("out")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#12202d]/90 text-lg text-white shadow-lg backdrop-blur transition hover:bg-[#2e4658]"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="absolute bottom-3 right-3 z-30 rounded-lg border border-white/15 bg-[#12202d]/90 px-4 py-2 text-xs text-white shadow-lg backdrop-blur transition hover:bg-[#2e4658]"
          >
            Full screen
          </button>
        )}
      </div>
    </div>
  );
}
