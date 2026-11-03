from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from preprocessing import preprocess_image
from ocr_engine import run_indic_ocr
import uvicorn

app = FastAPI(title="Heritage OCR Microservice", version="1.0.0")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "OCR-Microservice"}

@app.post("/process-image")
async def process_image_endpoint(
    file: UploadFile = File(...),
    language: str = Form("hindi")
):
    try:
        image_bytes = await file.read()
        processed_img = preprocess_image(image_bytes)
        result = run_indic_ocr(processed_img, target_language=language)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)