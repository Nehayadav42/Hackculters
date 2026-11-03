
import fitz
import docx
import io

from ocr_engine import process_image_ocr


def parse_document(
    file_bytes: bytes,
    filename: str,
    doc_type: str = "auto",
    source_language: str = "en"
) -> dict:

    if not file_bytes:
        raise ValueError("Uploaded document is empty.")

    ext = filename.lower().rsplit(".", 1)[-1]

    original_text = ""
    pages_data = []
    engines = []
    confidences = []

    # 1. TXT FILE
    if ext == "txt":
        text = file_bytes.decode("utf-8-sig", errors="replace")

        original_text = text.strip()

        pages_data.append({
            "page": 1,
            "text": original_text
        })

        engine_used = "Digital Text Extraction"
        confidence = None

    # 2. DOCX FILE
    elif ext == "docx":
        document = docx.Document(io.BytesIO(file_bytes))

        content = []

        for paragraph in document.paragraphs:
            if paragraph.text.strip():
                content.append(paragraph.text)

        # Extract table content too
        for table in document.tables:
            for row in table.rows:
                row_text = " | ".join(
                    cell.text.strip() for cell in row.cells
                )

                if row_text.strip():
                    content.append(row_text)

        original_text = "\n".join(content).strip()

        pages_data.append({
            "page": 1,
            "text": original_text
        })

        engine_used = "DOCX Digital Extraction"
        confidence = None

    # 3. PDF FILE
    elif ext == "pdf":
        pdf = fitz.open(
            stream=file_bytes,
            filetype="pdf"
        )

        try:
            for page_num in range(len(pdf)):

                page = pdf.load_page(page_num)

                text = page.get_text("text").strip()

                # Scanned page: use OCR
                if not text or len(text) < 20:

                    pix = page.get_pixmap(dpi=300)

                    img_bytes = pix.tobytes("png")

                    ocr_result = process_image_ocr(
                        img_bytes,
                        doc_type=doc_type,
                        source_language=source_language
                    )

                    text = ocr_result["text"]

                    engines.append(ocr_result["engine"])

                    if ocr_result["confidence"] is not None:
                        confidences.append(
                            ocr_result["confidence"]
                        )

                else:
                    engines.append("PDF Digital Extraction")

                pages_data.append({
                    "page": page_num + 1,
                    "text": text
                })

                original_text += text + "\n\n"

        finally:
            pdf.close()

        original_text = original_text.strip()

        engine_used = (
            ", ".join(dict.fromkeys(engines))
            if engines else "PDF Extraction"
        )

        confidence = (
            sum(confidences) / len(confidences)
            if confidences else None
        )

    # 4. IMAGE FILES
    elif ext in ["jpg", "jpeg", "png"]:

        ocr_result = process_image_ocr(
            file_bytes,
            doc_type=doc_type,
            source_language=source_language
        )

        original_text = ocr_result["text"]

        engine_used = ocr_result["engine"]
        confidence = ocr_result["confidence"]

        pages_data.append({
            "page": 1,
            "text": original_text
        })

    else:
        raise ValueError(
            f"Unsupported file format: .{ext}"
        )

    return {
        "text": original_text.strip(),
        "pages": pages_data,
        "engine": engine_used,
        "confidence": confidence
    }
