
import pytesseract
import easyocr
import numpy as np

# Reader 1: Hindi, Marathi, Nepali and English
devanagari_reader = easyocr.Reader(
    ['hi', 'mr', 'ne', 'en'],
    gpu=False
)

# Reader 2: Bengali and English
bengali_reader = easyocr.Reader(
    ['bn', 'en'],
    gpu=False
)


def run_indic_ocr(processed_img: np.ndarray, target_language: str = "hindi"):

    """
    Extracts text from preprocessed images using EasyOCR.
    Uses Tesseract as a fallback when EasyOCR confidence is low.
    """

    # Normalize language input
    target_language = target_language.lower().strip()

    # Language mapping
    language_config = {
        "hindi": {
            "reader": devanagari_reader,
            "tesseract": "hin"
        },
        "hin": {
            "reader": devanagari_reader,
            "tesseract": "hin"
        },
        "marathi": {
            "reader": devanagari_reader,
            "tesseract": "mar"
        },
        "mar": {
            "reader": devanagari_reader,
            "tesseract": "mar"
        },
        "nepali": {
            "reader": devanagari_reader,
            "tesseract": "nep"
        },
        "ne": {
            "reader": devanagari_reader,
            "tesseract": "nep"
        },
        "bengali": {
            "reader": bengali_reader,
            "tesseract": "ben"
        },
        "ben": {
            "reader": bengali_reader,
            "tesseract": "ben"
        },
        "english": {
            "reader": devanagari_reader,
            "tesseract": "eng"
        },
        "eng": {
            "reader": devanagari_reader,
            "tesseract": "eng"
        }
    }

    config = language_config.get(
        target_language,
        language_config["hindi"]
    )

    selected_reader = config["reader"]
    selected_lang = config["tesseract"]

    # Primary OCR: EasyOCR
    results = selected_reader.readtext(processed_img)

    extracted_lines = []
    confidences = []

    for bbox, text, prob in results:
        extracted_lines.append(text)
        confidences.append(prob)

    full_text = "\n".join(extracted_lines)

    avg_confidence = (
        float(np.mean(confidences))
        if confidences else 0.0
    )

    # Fallback: Tesseract
    if avg_confidence < 0.45:
        try:
            tess_text = pytesseract.image_to_string(
                processed_img,
                lang=selected_lang,
                config='--oem 3 --psm 6'
            )

            if len(tess_text.strip()) > len(full_text.strip()):
                full_text = tess_text.strip()
                avg_confidence = 0.0

        except Exception as e:
            print(f"[Tesseract Fallback Warning]: {e}")

    return {
        "extracted_text": full_text,
        "confidence_score": round(avg_confidence, 4),
        "ocr_engine": "EasyOCR + PyTesseract",
        "language": selected_lang
    }
