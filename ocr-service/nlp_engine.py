
import json
import html
import urllib.request
import urllib.parse

from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate


def normalize_language(language: str) -> str:
    language = (language or "").lower().strip()

    language_map = {
        "hi": "hi",
        "hindi": "hi",
        "en": "en",
        "english": "en",
    }

    return language_map.get(language, "")


def split_text(text: str, max_length: int = 450) -> list:
    """
    Split long text into manageable chunks without
    cutting words unnecessarily.
    """
    words = text.split()
    chunks = []
    current = ""

    for word in words:
        if len(current) + len(word) + 1 <= max_length:
            current = f"{current} {word}".strip()
        else:
            if current:
                chunks.append(current)
            current = word

    if current:
        chunks.append(current)

    return chunks



def translate_chunk(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text using MyMemory.
    First checks responseData, then searches matches
    for a valid translation.
    """

    query_params = {
        "q": text,
        "langpair": f"{source_lang}|{target_lang}"
    }

    url = (
        "https://api.mymemory.translated.net/get?"
        + urllib.parse.urlencode(query_params)
    )

    request = urllib.request.Request(
        url,
        headers={"User-Agent": "HeritageOCR/1.0"}
    )

    with urllib.request.urlopen(request, timeout=15) as response:
        data = json.loads(response.read().decode("utf-8"))

    if data.get("responseStatus") != 200:
        raise RuntimeError(
            data.get("responseDetails", "Translation API failed.")
        )

    # First: Check the primary translation response.
    translated = (
        data.get("responseData", {}).get("translatedText", "")
    )

    translated = html.unescape(translated).strip()

    if translated and translated != text.strip():
        return translated

    # Second: Search API matches for a usable translation.
    matches = data.get("matches", [])

    for match in matches:
        candidate = html.unescape(
            match.get("translation", "")
        ).strip()

        match_target = match.get("target", "").lower()

        if not candidate:
            continue

        if not match_target.startswith(target_lang.lower()):
            continue

        # Avoid returning the original text as a translation.
        if candidate.strip() == text.strip():
            continue

        return candidate

    raise RuntimeError("MyMemory did not return a usable translated result.")


def run_translation(
    text: str,
    source_lang: str,
    target_lang: str
) -> dict:

    if not text or not text.strip():
        return {
            "text": "",
            "status": "failed",
            "message": "No text available for translation."
        }

    src = normalize_language(source_lang)
    tgt = normalize_language(target_lang)

    if not src or not tgt:
        return {
            "text": "",
            "status": "failed",
            "message": "Unsupported source or target language."
        }

    # No translation is necessary when languages are identical.
    if src == tgt:
        return {
            "text": text,
            "status": "not_required",
            "message": "Source and target languages are identical."
        }

    try:
        chunks = split_text(text)
        translated_chunks = []

        for chunk in chunks:
            translated = translate_chunk(chunk, src, tgt)
            translated_chunks.append(translated)

        final_translation = " ".join(translated_chunks)

        return {
            "text": final_translation,
            "status": "completed",
            "message": "Translation completed successfully."
        }

    except Exception as error:
        print(f"[Translation Error]: {error}")

        return {
            "text": "",
            "status": "failed",
            "message": str(error)
        }


def run_transliteration(
    text: str,
    source_lang: str
) -> dict:

    if not text or not text.strip():
        return {
            "text": "",
            "status": "failed"
        }

    language = normalize_language(source_lang)

    try:
        if language == "hi":
            romanized = transliterate(
                text,
                sanscript.DEVANAGARI,
                sanscript.IAST
            )

            return {
                "text": romanized,
                "status": "completed"
            }

        elif language == "en":
            return {
                "text": text,
                "status": "not_required"
            }

        return {
            "text": "",
            "status": "failed",
            "message": "Unsupported transliteration language."
        }

    except Exception as error:
        print(f"[Transliteration Error]: {error}")

        return {
            "text": "",
            "status": "failed",
            "message": str(error)
        }
