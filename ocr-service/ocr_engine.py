import os
import pytesseract
import easyocr
import cv2
import numpy as np

# Initialize EasyOCR reader for Indic scripts (Devanagari/Bengali/English)
reader = easyocr.Reader(['hi', 'mr', 'ne', 'bn', 'en'], gpu=False)

def run_indic_ocr(processed_img: np.ndarray, target_language: str = "hin"):
    """
    Processes preprocessed images using EasyOCR/Pytesseract for Indic scripts.
    Returns extracted text, confidence score, and language used.
    """
    # Map input language code to Tesseract/EasyOCR language codes
    lang_map = {
        "hindi": "hin",
        "sanskrit": "san",
        "marathi": "mar",
        "gujarati": "guj",
        "bengali": "ben",
        "english": "eng"
    }

    selected_lang = lang_map.get(target_language.lower(), "hin+san+eng")

    # Primary Pass: EasyOCR (High accuracy for Indic bounding boxes)
    results = reader.readtext(processed_img)
    
    extracted_lines = []
    confidences = []

    for (bbox, text, prob) in results:
        extracted_lines.append(text)
        confidences.append(prob)

    full_text = "\n".join(extracted_lines)
    avg_confidence = float(np.mean(confidences)) if confidences else 0.0

    # Fallback to Tesseract if EasyOCR confidence is low (< 0.45)
    if avg_confidence < 0.45:
        try:
            config = f'--oem 3 --psm 6'
            tess_text = pytesseract.image_to_string(processed_img, lang=selected_lang, config=config)
            if len(tess_text.strip()) > len(full_text.strip()):
                full_text = tess_text.strip()
                avg_confidence = 0.65  # Estimated baseline confidence for fallback
        except Exception as e:
            print(f"[Tesseract Fallback Warning]: {e}")

    return {
        "extracted_text": full_text,
        "confidence_score": round(avg_confidence, 4),
        "ocr_engine": "EasyOCR + PyTesseract (Indic)",
        "language": selected_lang
    }