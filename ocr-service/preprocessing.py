
import cv2
import numpy as np


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Conservative preprocessing for printed and scanned documents.
    Preserves small Devanagari marks while improving image readability.
    """

    # Decode uploaded image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image file")

    height, width = img.shape[:2]

    # 1. Upscale small images to help OCR recognize fine characters
    if max(height, width) < 1600:
        scale = min(2.0, 1600 / max(height, width))
        img = cv2.resize(
            img,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC
        )

    # 2. Convert to LAB color space
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)

    # 3. Apply mild contrast enhancement
    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=1.5,
        tileGridSize=(8, 8)
    )

    enhanced_l = clahe.apply(l_channel)

    # 4. Merge channels and convert back to BGR
    enhanced_lab = cv2.merge((enhanced_l, a_channel, b_channel))
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    # 5. Return color image without aggressive thresholding or denoising
    return enhanced
