
import cv2
from paddleocr import PaddleOCR

# Initialize Hindi OCR model
print("Loading Hindi OCR model...")

hindi_ocr = PaddleOCR(
    use_angle_cls=True,
    lang="hi",
    use_gpu=False,
    show_log=False
)

print("Hindi OCR model loaded!")

# Read Hindi document image
image_path = "test-hindi.png"
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(
        "Please add a Hindi image named test-hindi.png "
        "inside the ocr-service folder."
    )

# Extract text
results = hindi_ocr.ocr(image, cls=True)

print("\n--- HINDI OCR RESULT ---")

extracted_lines = []

if results and results[0]:
    for line in results[0]:
        text = line[1][0]
        confidence = float(line[1][1])

        extracted_lines.append(text)

        print("Confidence:", round(confidence, 4))

    final_text = "\n".join(extracted_lines)

    with open("hindi_ocr_output.txt", "w", encoding="utf-8") as file:
        file.write(final_text)

    print("\nHindi OCR output saved successfully!")
else:
    print("No text detected.")