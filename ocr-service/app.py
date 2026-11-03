from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from document_parser import parse_document
from ocr_engine import detect_language
from fastapi.middleware.cors import CORSMiddleware
from nlp_engine import run_translation, run_transliteration
import uvicorn

app = FastAPI(title="Multilingual OCR & NLP Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (POST, GET, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "OCR-NLP-Microservice"}

@app.post("/process-document")
async def process_document_endpoint(
    file: UploadFile = File(...),
    output_language: str = Form("en"),
    source_language: str = Form("hi"),
    document_type: str = Form("auto") 
):
    try:
        file_bytes = await file.read()
        filename = file.filename
        
       # 1. OCR / Text Extraction (Pass source_language here)
        doc_result = parse_document(file_bytes, filename, document_type, source_language=source_language)
        original_text = doc_result["text"]
        
        # 2. Language Detection
        detected_lang = source_language if source_language != "auto" else detect_language(original_text)
        
        # 3. Independent Translation (Original -> Translation)
        translation_result = run_translation(original_text, detected_lang, output_language)
        
        # 4. Independent Transliteration (Original -> Roman)
        transliteration_result = run_transliteration(original_text, detected_lang)
        
        return {
            "success": True,
            "filename": filename,
            "detected_source_language": detected_lang,
            "selected_source_language": source_language,
            "document_type": document_type,
            
            # The Three Independent Outputs
            "original_text": original_text,
            "translated_text": translation_result["text"],
            "romanized_text": transliteration_result["text"],
            
            # Processing Statuses for the React UI
            "translation_status": translation_result["status"],
            "transliteration_status": transliteration_result["status"],
            
            # Metadata
            "target_language": output_language,
            "ocr_engine": doc_result["engine"],
            "ocr_confidence": doc_result["confidence"],
            "page_wise_text": doc_result["pages"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)