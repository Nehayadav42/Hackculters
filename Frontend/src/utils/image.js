export function getImageObjectFit(image) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const containerRatio = image.clientWidth / image.clientHeight;

  if (
    !Number.isFinite(imageRatio) ||
    !Number.isFinite(containerRatio) ||
    imageRatio <= 0 ||
    containerRatio <= 0
  ) {
    return "cover";
  }

  const aspectMismatch = Math.max(
    imageRatio / containerRatio,
    containerRatio / imageRatio
  );

  return aspectMismatch > 1.5 ? "contain" : "cover";
}
