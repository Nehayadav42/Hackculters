function buildMapUrl(latitude, longitude, span) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const params = new URLSearchParams({
    bbox: [
      lon - span,
      lat - span,
      lon + span,
      lat + span,
    ].join(","),
    layer: "mapnik",
    marker: `${lat},${lon}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params}`;
}

export default function OpenStreetMapFrame({
  latitude,
  longitude,
  title,
  height = 420,
  className = "",
}) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const validCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    latitude !== "" &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180;

  if (!validCoordinates) {
    return (
      <div
        className={`flex items-center justify-center bg-[#e7ecef] p-6 text-center text-sm text-[#66727d] ${className}`}
        style={{ minHeight: height }}
        role="status"
      >
        No coordinates are available for this record.
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <iframe
        title={`OpenStreetMap location for ${title || "heritage site"}`}
        src={buildMapUrl(lat, lon, 0.018)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block w-full border-0"
        style={{ height }}
      />
      <p className="border-t border-[#d2dce2] px-3 py-1.5 text-right text-[10px] text-[#66727d]">
        Map data ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}
