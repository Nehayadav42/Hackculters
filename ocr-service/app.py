
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from dotenv import load_dotenv
from pathlib import Path
import uvicorn

from document_parser import parse_document
from ocr_engine import detect_language

# Load environment variables
load_dotenv(Path(__file__).parent / ".env")

app = FastAPI(title="Multilingual OCR Microservice")


@app.get("/health")
async def health_check():
    return {
        "success": True,
        "message": "OCR service is running"
    }


@app.post("/process-document")
async def process_document_endpoint(
    file: UploadFile = File(...),
    output_language: str = Form("en"),
    source_language: str = Form("auto"),
    document_type: str = Form("auto")
):
    try:
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is missing."
            )

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        # 1. Extract document text using the selected OCR language
        doc_result = parse_document(
            file_bytes=file_bytes,
            filename=file.filename,
            doc_type=document_type,
            source_language=source_language
        )

        original_text = doc_result.get("text", "")

        if not original_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No readable text was detected in the document."
            )

        # 2. Detect original language
        detected_lang = (
            source_language
            if source_language != "auto"
            else detect_language(original_text)
        )

        # 3. Translation placeholder
        translated_text = None
        translation_status = "not_configured"

        if output_language == "auto":
            translated_text = original_text
            translation_status = "not_required"

        # 4. Transliteration placeholder
        romanized_text = None
        transliteration_status = "not_configured"

        return {
            "success": True,
            "filename": file.filename,

            "detected_source_language": detected_lang,
            "selected_source_language": source_language,

            "document_type": document_type,

            "original_text": original_text,

            "translated_text": translated_text,
            "target_language": output_language,
            "translation_status": translation_status,

            "romanized_text": romanized_text,
            "transliteration_status": transliteration_status,

            "ocr_engine": doc_result.get("engine"),
            "ocr_confidence": doc_result.get("confidence"),
            "page_wise_text": doc_result.get("pages", [])
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"[Document Processing Error] {error}")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )
