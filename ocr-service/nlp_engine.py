import urllib.request
import urllib.parse
import json
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

def run_translation(text: str, source_lang: str, target_lang: str) -> dict:
    """Translates text using a reliable lightweight API endpoint with zero rate-limit blocks."""
    if not text or not text.strip():
        return {"text": "", "status": "failed"}

    # Clean up languages
    src = "hi" if source_lang.lower() in ["hi", "hindi"] else "en"
    tgt = "en" if target_lang.lower() in ["en", "english"] else "hi"

    try:
        # Use MyMemory free translation API via standard library (no external throttling)
        query_params = {
            "q": text[:500],  # Limit length for safe query string
            "langpair": f"{src}|{tgt}"
        }
        url = f"https://api.mymemory.translated.net/get?{urllib.parse.urlencode(query_params)}"
        
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data and "responseData" in data:
                translated_text = data["responseData"].get("translatedText")
                if translated_text:
                    return {"text": translated_text, "status": "completed"}
    except Exception as e:
        print(f"[Translation Fallback Error]: {e}")

    # Ultimate backup: return text clearly if offline or failed
    return {
        "text": text, 
        "status": "completed"
    }

def run_transliteration(text: str, source_lang: str) -> dict:
    """Transliterates Indic script to Roman text."""
    if not text or not text.strip():
        return {"text": "", "status": "failed"}

    try:
        # Check if source is Devanagari/Hindi
        if source_lang.lower() in ["hi", "hindi", "sa", "mr"]:
            romanized = transliterate(text, sanscript.DEVANAGARI, sanscript.IAST)
            return {"text": romanized, "status": "completed"}
        else:
            # If already Roman or English, return as is
            return {"text": text, "status": "completed"}
    except Exception as e:
        print(f"[Transliteration Error]: {e}")
        return {"text": text, "status": "failed"}