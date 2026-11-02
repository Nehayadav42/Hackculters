
import { useState } from "react";

export default function ManuscriptReader({ documents = [] }) {
  const [activeDocument, setActiveDocument] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const validDocuments = documents.filter(
    (doc) => doc && (doc.title || doc.file_url || doc.extracted_text)
  );

  if (!validDocuments.length) {
    return (
      <div className="rounded-2xl border border-[#ded6c6] bg-[#eee9dc] p-8 text-center">
        <p className="font-serif text-xl text-[#183b32]">
          Manuscript collection
        </p>
        <p className="mt-2 text-sm text-[#5e625a]">
          No digitized manuscripts are available for this monument yet.
        </p>
      </div>
    );
  }

  const document = validDocuments[activeDocument];

  const rawText = document.extracted_text || document.ocr_text || "";
  const correctedText = document.corrected_text || document.reviewed_text || "";
  const translatedText =
    document.translation ||
    document.translated_text ||
    document.english_translation ||
    "";
  const processingStatus =
    document.processing_status || document.ocr_status || "";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8cfbd] bg-[#eee9dc]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d8cfbd] p-5">
        <div>
          <p className="text-xs tracking-[0.2em] text-[#a17b43]">
            DIGITAL ARCHIVE
          </p>
          <h3 className="mt-2 font-serif text-xl text-[#183b32]">
            Manuscript Reader
          </h3>
        </div>

        <span className="rounded-full bg-[#183b32] px-3 py-1.5 text-xs text-white">
          {validDocuments.length} Document{validDocuments.length > 1 ? "s" : ""}
        </span>
      </div>

      {validDocuments.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-[#d8cfbd] p-4">
          {validDocuments.map((item, index) => (
            <button
              key={item.id || index}
              type="button"
              onClick={() => {
                setActiveDocument(index);
                setShowTranslation(false);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                activeDocument === index
                  ? "bg-[#183b32] text-white"
                  : "bg-white/70 text-[#625f54] hover:bg-white"
              }`}
            >
              {item.title || `Document ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="p-5 md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-serif text-lg text-[#183b32]">
              {document.title || "Untitled Manuscript"}
            </h4>
            <p className="mt-1 text-xs text-[#625e51]">
              {[document.category, document.language]
                .filter(Boolean)
                .join(" · ") || "Historical document"}
            </p>
            {processingStatus && (
              <p className="mt-1 text-xs text-[#625e51]">
                Processing status: {processingStatus}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!rawText && !correctedText}
              onClick={() => setShowTranslation(false)}
              className={`rounded-full px-4 py-2 text-xs ${
                !showTranslation
                  ? "bg-[#a17b43] text-white"
                  : "border border-[#cfc5b2] text-[#625f54]"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Extracted text
            </button>

            <button
              type="button"
              disabled={!translatedText}
              onClick={() => setShowTranslation(true)}
              className={`rounded-full px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${
                showTranslation
                  ? "bg-[#a17b43] text-white"
                  : "border border-[#cfc5b2] text-[#625f54]"
              }`}
            >
              Translation
            </button>
          </div>
        </div>

        <div className="min-h-[240px] rounded-xl border border-[#d8cfbd] bg-[#f8f4e9] p-6 md:p-8">
          {showTranslation ? (
            <>
              <p className="mb-5 text-[10px] tracking-[0.2em] text-[#a17b43]">
                ENGLISH TRANSLATION
              </p>
              <p
                dir="auto"
                className="whitespace-pre-wrap font-serif text-lg leading-[2.2] text-[#39382f] md:text-xl"
              >
                {translatedText}
              </p>
            </>
          ) : rawText || correctedText ? (
            <>
              <p className="mb-5 text-[10px] tracking-[0.2em] text-[#a17b43]">
                {correctedText ? "REVIEWED TRANSCRIPTION" : "EXTRACTED TEXT"}
              </p>
              <p
                dir="auto"
                className="whitespace-pre-wrap font-serif text-lg leading-[2.2] text-[#39382f] md:text-xl"
              >
                {correctedText || rawText}
              </p>
              {correctedText && rawText && (
                <details className="mt-6 border-t border-[#d8cfbd] pt-4">
                  <summary className="cursor-pointer text-xs font-medium text-[#a17b43]">
                    Show raw OCR text
                  </summary>
                  <p
                    dir="auto"
                    className="mt-4 whitespace-pre-wrap font-serif text-base leading-8 text-[#625f54]"
                  >
                    {rawText}
                  </p>
                </details>
              )}
            </>
          ) : (
            <div>
              <p className="mb-3 text-[10px] tracking-[0.2em] text-[#a17b43]">
                TRANSCRIPTION UNAVAILABLE
              </p>
              <p className="text-sm leading-6 text-[#5e625a]">
                The current document API does not provide extracted or
                corrected text for this record. No sample transcription is
                shown.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#625e51]">
            {document.language && <p>Language: {document.language}</p>}
            {(document.source || document.source_url || document.provenance) && (
              <p className="mt-1">
                Source:{" "}
                {document.source || document.provenance || "External source"}
              </p>
            )}
          </div>

          {document.file_url && (
            <a
              href={document.file_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#183b32] px-5 py-2.5 text-sm text-white transition hover:bg-[#285548]"
            >
              Open Original Document ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
