
import os
from pathlib import Path
from functools import lru_cache

import cv2
import numpy as np

from dotenv import load_dotenv
from paddleocr import PaddleOCR
from google.cloud import vision
from langdetect import detect, LangDetectException

from preprocessing import preprocess_image


# =========================================================
# 1. LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv(Path(__file__).parent / ".env")


# =========================================================
# 2. CONFIGURE GOOGLE CLOUD CREDENTIALS
# =========================================================

credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if credentials_path:

    credentials_path = Path(credentials_path)

    if not credentials_path.is_absolute():
        credentials_path = Path(__file__).parent / credentials_path

    if credentials_path.exists():

        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(
            credentials_path.resolve()
        )


# =========================================================
# 3. LOAD PADDLE OCR MODEL
# =========================================================

@lru_cache(maxsize=2)
def get_paddle_ocr(language: str):

    print(f"Loading PaddleOCR model: {language}")

    return PaddleOCR(
        use_angle_cls=True,
        lang=language,
        use_gpu=False,
        show_log=False
    )


# =========================================================
# 4. NORMALIZE SOURCE LANGUAGE
# =========================================================

def normalize_ocr_language(source_language: str) -> str:

    language = (source_language or "en").lower().strip()

    language_map = {
        "english": "en",
        "en": "en",
        "hindi": "hi",
        "hi": "hi"
    }

    return language_map.get(language, "en")


# =========================================================
# 5. DETECT LANGUAGE
# =========================================================

def detect_language(text: str) -> str:

    if not text or not text.strip():
        return "unknown"

    try:
        return detect(text)

    except LangDetectException:
        return "unknown"


# =========================================================
# 6. TEMPORARY TRANSLATION PLACEHOLDER
# =========================================================

def translate_text(text: str, target_language: str) -> str:

    """
    Translation is handled separately by nlp_engine.py.
    """

    return text


# =========================================================
# 7. RECONSTRUCT OCR TEXT
# =========================================================

def reconstruct_text(results):

    """
    Group detected text regions into lines
    and sort each line from left to right.
    """

    detected_words = []

    if not results or not results[0]:
        return "", []

    for item in results[0]:

        if not item or len(item) < 2:
            continue

        box = item[0]

        recognized_text = item[1][0]
        confidence = float(item[1][1])

        x_positions = [point[0] for point in box]
        y_positions = [point[1] for point in box]

        x_center = sum(x_positions) / len(x_positions)
        y_center = sum(y_positions) / len(y_positions)

        box_height = max(y_positions) - min(y_positions)

        detected_words.append({
            "text": recognized_text,
            "confidence": confidence,
            "x": x_center,
            "y": y_center,
            "height": box_height
        })

    # Sort detected regions from top to bottom

    detected_words.sort(
        key=lambda word: word["y"]
    )

    rows = []

    for word in detected_words:

        matching_row = None

        for row in rows:

            row_y = np.mean([
                item["y"] for item in row
            ])

            tolerance = max(
                10,
                word["height"] * 0.6
            )

            if abs(word["y"] - row_y) <= tolerance:

                matching_row = row
                break

        if matching_row is None:

            rows.append([word])

        else:

            matching_row.append(word)

    # Sort each row from left to right

    lines = []

    for row in rows:

        row.sort(
            key=lambda word: word["x"]
        )

        lines.append(
            " ".join(word["text"] for word in row)
        )

    full_text = "\n".join(lines)

    confidences = [
        word["confidence"]
        for word in detected_words
    ]

    return full_text, confidences


# =========================================================
# 8. RUN PADDLE OCR
# =========================================================

def run_paddle_ocr(
    img_array: np.ndarray,
    source_language: str = "en"
) -> dict:

    if img_array is None:
        raise ValueError("Could not decode the uploaded image.")

    # Normalize selected language

    language = normalize_ocr_language(source_language)

    # Load the appropriate OCR model

    ocr_model = get_paddle_ocr(language)

    # Run OCR

    results = ocr_model.ocr(
        img_array,
        cls=True
    )

    # DEBUG: Display raw PaddleOCR recognition

    print("\n========== RAW PADDLE OCR OUTPUT ==========")

    if results and results[0]:

        for item in results[0]:

            print(
                "Recognized:",
                repr(item[1][0]),
                "| Confidence:",
                item[1][1]
            )

    else:

        print("No text detected.")

    print("===========================================\n")

    # Reconstruct recognized text

    full_text, confidences = reconstruct_text(results)

    average_confidence = (
        float(np.mean(confidences))
        if confidences
        else None
    )

    return {
        "text": full_text,

        "confidence": (
            round(average_confidence, 4)
            if average_confidence is not None
            else None
        ),

        "engine": f"PaddleOCR 2.7.3 ({language})"
    }


# =========================================================
# 9. GOOGLE CLOUD VISION OCR
# =========================================================

def run_google_vision_ocr(image_bytes: bytes) -> dict:

    """
    Optional handwriting OCR using Google Cloud Vision.
    Requires valid Google Cloud credentials and API access.
    """

    client = vision.ImageAnnotatorClient()

    image = vision.Image(
        content=image_bytes
    )

    response = client.document_text_detection(
        image=image
    )

    if response.error.message:
        raise RuntimeError(response.error.message)

    annotation = response.full_text_annotation

    extracted_text = (
        annotation.text
        if annotation
        else ""
    )

    word_confidences = []

    if annotation:

        for page in annotation.pages:

            for block in page.blocks:

                for paragraph in block.paragraphs:

                    for word in paragraph.words:

                        if word.confidence > 0:

                            word_confidences.append(
                                word.confidence
                            )

    average_confidence = (
        float(np.mean(word_confidences))
        if word_confidences
        else None
    )

    return {
        "text": extracted_text,

        "confidence": (
            round(average_confidence, 4)
            if average_confidence is not None
            else None
        ),

        "engine": "Google Cloud Vision"
    }


# =========================================================
# 10. MAIN IMAGE OCR PROCESSOR
# =========================================================

def process_image_ocr(
    image_bytes: bytes,
    doc_type: str = "auto",
    source_language: str = "en"
) -> dict:

    if not image_bytes:
        raise ValueError("Uploaded image is empty.")

    # Optional Google Vision for handwriting

    if doc_type == "handwritten":

        try:

            return run_google_vision_ocr(image_bytes)

        except Exception as error:

            print(
                f"[Google Vision unavailable] {error}"
            )

            print(
                "[OCR fallback] Using local PaddleOCR."
            )

    # Preprocess image for local OCR

    image_array = preprocess_image(image_bytes)

    # Run PaddleOCR

    result = run_paddle_ocr(
        image_array,
        source_language=source_language
    )

    if doc_type == "handwritten":

        result["engine"] += " (handwriting fallback)"

    return result
