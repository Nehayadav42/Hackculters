
export default function MonumentMap({ latitude, longitude, name }) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  const hasCoordinates =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;

  if (!hasCoordinates) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[#d8cfbd] bg-[#eee9dc] p-6 text-center">
        <div>
          <p className="text-lg font-semibold text-[#183b32]">
            Location unavailable
          </p>
          <p className="mt-2 text-sm text-[#5e625a]">
            Coordinates are not available for this monument yet.
          </p>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8cfbd] bg-[#f5f2e9]">
      <iframe
        title={`Map showing ${name || "monument"} location`}
        src={mapUrl}
        width="100%"
        height="350"
        loading="lazy"
        className="block border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="font-semibold text-[#183b32]">
            {name || "Monument location"}
          </p>
          <p className="mt-1 text-xs text-[#5e625a]">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#183b32] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#285548]"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}
