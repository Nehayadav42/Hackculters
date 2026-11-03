
from pathlib import Path
from ocr_engine import process_image_ocr

image_path = Path("test-document.png")

if not image_path.exists():
    raise FileNotFoundError(
        "Place an English printed test image named test-document.png "
        "inside ocr-service."
    )

image_bytes = image_path.read_bytes()

result = process_image_ocr(
    image_bytes,
    doc_type="printed"
)

print("\nOCR RESULT")
print("Engine:", result["engine"])
print("Confidence:", result["confidence"])
print("Extracted text:")
print(result["text"])
