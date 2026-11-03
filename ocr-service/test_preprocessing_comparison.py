
import cv2
import numpy as np
from pathlib import Path
from paddleocr import PaddleOCR

from preprocessing import preprocess_image


# Use the exact same image used in the API test
image_path = Path("test-hindi.png")

if not image_path.exists():
    raise FileNotFoundError("test-hindi.png not found")

image_bytes = image_path.read_bytes()

original_image = cv2.imdecode(
    np.frombuffer(image_bytes, np.uint8),
    cv2.IMREAD_COLOR
)

# Apply our preprocessing
processed_image = preprocess_image(image_bytes)

# Initialize the same Hindi OCR model
print("Loading Hindi OCR model...")

hindi_ocr = PaddleOCR(
    use_angle_cls=True,
    lang="hi",
    use_gpu=False,
    show_log=False
)


def display_results(label, image):
    print(f"\n--- {label} ---")

    results = hindi_ocr.ocr(image, cls=True)

    if results and results[0]:
        for item in results[0]:
            print(
                "Text:",
                item[1][0],
                "| Confidence:",
                round(float(item[1][1]), 4)
            )
    else:
        print("No text detected.")


# Test A: Original image without preprocessing
display_results("ORIGINAL IMAGE", original_image)

# Test B: Image after preprocessing
display_results("PREPROCESSED IMAGE", processed_image)

# Save processed image for visual inspection
cv2.imwrite("test-hindi-preprocessed.png", processed_image)

print("\nComparison completed.")
