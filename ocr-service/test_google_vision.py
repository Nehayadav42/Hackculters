
import os
from dotenv import load_dotenv
from google.cloud import vision

load_dotenv()

credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if not credentials_path or not os.path.exists(credentials_path):
    raise FileNotFoundError(
        "Google credentials file not found. Check your .env file."
    )

client = vision.ImageAnnotatorClient()

print("Google Vision client initialized successfully!")

# Load the same test image
image_path = "test-document.png"

with open(image_path, "rb") as image_file:
    content = image_file.read()

image = vision.Image(content=content)

# Perform Hindi OCR
response = client.document_text_detection(
    image=image,
    image_context=vision.ImageContext(language_hints=["hi"])
)

if response.error.message:
    raise RuntimeError(response.error.message)

if response.full_text_annotation:
    print("\n========== GOOGLE VISION OCR OUTPUT ==========")
    print(response.full_text_annotation.text)
    print("==============================================")
else:
    print("No text detected.")
