
import { Billboard } from "@react-three/drei";
import { HOTSPOTS } from "./hotspots.js";

const MARKER_SEGMENTS = {
  1: [
    [0.06, 0.045, 0.02, 0.08],
    [0.06, -0.045, 0.02, 0.08],
  ],
  2: [
    [0, 0.09, 0.14, 0.02],
    [0.06, 0.045, 0.02, 0.08],
    [0, 0, 0.14, 0.02],
    [-0.06, -0.045, 0.02, 0.08],
    [0, -0.09, 0.14, 0.02],
  ],
  3: [
    [0, 0.09, 0.14, 0.02],
    [0.06, 0.045, 0.02, 0.08],
    [0, 0, 0.14, 0.02],
    [0.06, -0.045, 0.02, 0.08],
    [0, -0.09, 0.14, 0.02],
  ],
  4: [
    [-0.06, 0.045, 0.02, 0.08],
    [0, 0, 0.14, 0.02],
    [0.06, 0.045, 0.02, 0.08],
    [0.06, -0.045, 0.02, 0.08],
  ],
};

function NumberMarker({ number, position, active, onClick }) {
  const handlePointerDown = (event) => {
    event.stopPropagation();
    onClick();
  };

  return (
    <Billboard position={position}>
      <group scale={active ? 1.12 : 1}>
        <mesh
          onPointerDown={handlePointerDown}
          renderOrder={9}
        >
          <sphereGeometry args={[0.28, 12, 12]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            colorWrite={false}
            depthWrite={false}
          />
        </mesh>
        <mesh renderOrder={10}>
          <circleGeometry args={[0.23, 32]} />
          <meshBasicMaterial color="#ffffff" depthTest={false} />
        </mesh>
        <mesh
          position={[0, 0, 0.003]}
          renderOrder={11}
        >
          <circleGeometry args={[0.205, 32]} />
          <meshBasicMaterial
            color={active ? "#bf6548" : "#a95037"}
            depthTest={false}
          />
        </mesh>
        {MARKER_SEGMENTS[number].map(([x, y, width, height], index) => (
          <mesh
            key={index}
            position={[x, y, 0.01]}
            renderOrder={12}
          >
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial color="#ffffff" depthTest={false} />
          </mesh>
        ))}
      </group>
    </Billboard>
  );
}

export default function ArchitecturalHotspots({
  site,
  selectedFeature,
  onSelectFeature,
}) {
  const items = HOTSPOTS[site?.name] || HOTSPOTS["Rani ki Vav"];
  const markerItems = [
    ...items.slice(1).map((item, index) => ({ item, number: index + 2 })),
    { item: items[0], number: 1 },
  ];

  return (
    <group>
      {markerItems.map(({ item, number }) => (
        <NumberMarker
          key={`${site?.name}-${item.title}`}
          number={number}
          position={item.position}
          active={
            selectedFeature &&
            selectedFeature.siteName === site?.name &&
            selectedFeature.item.title === item.title
          }
          onClick={() => {
            const isSelected =
              selectedFeature &&
              selectedFeature.siteName === site?.name &&
              selectedFeature.item.title === item.title;
            onSelectFeature(
              isSelected ? null : { item, siteName: site?.name }
            );
          }}
        />
      ))}
    </group>
  );
}
