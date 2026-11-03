
import cv2
import numpy as np


def preprocess_image(image_bytes: bytes) -> np.ndarray:

    # Decode image
    image_array = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image file")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Detect background using border pixels
    border = np.concatenate([
        gray[0, :],
        gray[-1, :],
        gray[:, 0],
        gray[:, -1]
    ])

    # Invert white text on black background
    if np.median(border) < 127:
        gray = cv2.bitwise_not(gray)

    # Enlarge without changing character structure
    height, width = gray.shape

    if max(height, width) < 1600:
        scale = min(4.0, 1600 / max(height, width))

        gray = cv2.resize(
            gray,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC
        )

    # Convert to 3-channel BGR
    processed = cv2.cvtColor(
        gray,
        cv2.COLOR_GRAY2BGR
    )

    # Save processed image for debugging
    cv2.imwrite("debug_preprocessed.png", processed)

    return processed
