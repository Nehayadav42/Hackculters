
import { useState } from "react";
import { summarizeDocument } from "../services/api.js";

export default function ManuscriptReader({ documents = [] }) {
  const [activeDocument, setActiveDocument] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [summarizing, setSummarizing] = useState(false);

 // 1. Update the filter so it doesn't hide documents that use 'original_text' or 'ocr_text'
 const validDocuments = documents.filter(
  (doc) => doc && (doc.title || doc.file_url || doc.ocr_text || doc.original_text)
);

if (!validDocuments.length) {
  return (
    <div className="rounded-2xl border border-[#d2dce2] bg-[#e8edf0] p-8 text-center">
      <p className="font-serif text-xl text-[#1a2c3b]">
        Manuscript collection
      </p>
      <p className="mt-2 text-sm text-[#66727d]">
        No digitized manuscripts are available for this monument yet.
      </p>
    </div>
  );
}

const document = validDocuments[activeDocument];

// 2. Add 'document.original_text' here so it actually reads the column shown in your DB
const rawText = document.ocr_text || document.original_text || document.extracted_text || "";
const correctedText = document.corrected_text || document.reviewed_text || "";
const translatedText =
  document.translated_text ||
  document.translation ||
  document.english_translation ||
  "";
  const processingStatus =
    document.status ||
    document.processing_status ||
    document.ocr_status ||
    "";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#c8d3db] bg-[#e8edf0]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c8d3db] p-5">
        <div>
          <p className="text-xs tracking-[0.2em] text-[#bf6548]">
            DIGITAL ARCHIVE
          </p>
          <h3 className="mt-2 font-serif text-xl text-[#1a2c3b]">
            Manuscript Reader
          </h3>
        </div>

        <span className="rounded-full bg-[#1a2c3b] px-3 py-1.5 text-xs text-white">
          {validDocuments.length} Document{validDocuments.length > 1 ? "s" : ""}
        </span>
      </div>

      {validDocuments.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-[#c8d3db] p-4">
          {validDocuments.map((item, index) => (
            <button
              key={item.id || index}
              type="button"
              onClick={() => {
                setActiveDocument(index);
                setShowTranslation(false);
                setSummary("");
                setSummaryError("");
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                activeDocument === index
                  ? "bg-[#1a2c3b] text-white"
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
            <h4 className="font-serif text-lg text-[#1a2c3b]">
              {document.title || "Untitled Manuscript"}
            </h4>
            <p className="mt-1 text-xs text-[#5e6b76]">
              {[document.category, document.language]
                .filter(Boolean)
                .join(" · ") || "Historical document"}
            </p>
            {processingStatus && (
              <p className="mt-1 text-xs text-[#5e6b76]">
                Processing status: {processingStatus}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {document.id && (
              <button
                type="button"
                disabled={summarizing || !rawText}
                onClick={async () => {
                  setSummaryError("");
                  setSummary("");
                  setSummarizing(true);
                  try {
                    const response = await summarizeDocument({
                      documentId: document.id,
                    });
                    setSummary(response.summary);
                  } catch (error) {
                    setSummaryError(
                      error instanceof Error
                        ? error.message
                        : "Unable to summarize this document."
                    );
                  } finally {
                    setSummarizing(false);
                  }
                }}
                className="rounded-full border border-[#cfc5b2] px-4 py-2 text-xs text-[#625f54] transition hover:border-[#bf6548] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {summarizing ? "Summarizing..." : "AI summary"}
              </button>
            )}
            <button
              type="button"
              disabled={!rawText && !correctedText}
              onClick={() => setShowTranslation(false)}
              className={`rounded-full px-4 py-2 text-xs ${
                !showTranslation
                  ? "bg-[#bf6548] text-white"
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
                  ? "bg-[#bf6548] text-white"
                  : "border border-[#cfc5b2] text-[#625f54]"
              }`}
            >
              Translation
            </button>
          </div>
        </div>

        {summaryError && (
          <p role="alert" className="mb-4 rounded-lg border border-[#d8b8a7] bg-[#fff8f4] p-3 text-sm text-[#8b5546]">
            {summaryError}
          </p>
        )}
        {summary && (
          <div className="mb-5 rounded-xl border border-[#c8d3db] bg-[#f8f9fa] p-5">
            <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-[#bf6548]">
              SOURCE-BASED SUMMARY
            </p>
            <p className="whitespace-pre-line text-sm leading-7 text-[#39382f]">
              {summary}
            </p>
          </div>
        )}

        <div className="min-h-[240px] rounded-xl border border-[#c8d3db] bg-[#f8f9fa] p-6 md:p-8">
          {showTranslation ? (
            <>
              <p className="mb-5 text-[10px] tracking-[0.2em] text-[#bf6548]">
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
              <p className="mb-5 text-[10px] tracking-[0.2em] text-[#bf6548]">
                {correctedText ? "REVIEWED TRANSCRIPTION" : "EXTRACTED TEXT"}
              </p>
              <p
                dir="auto"
                className="whitespace-pre-wrap font-serif text-lg leading-[2.2] text-[#39382f] md:text-xl"
              >
                {correctedText || rawText}
              </p>
              {correctedText && rawText && (
                <details className="mt-6 border-t border-[#c8d3db] pt-4">
                  <summary className="cursor-pointer text-xs font-medium text-[#bf6548]">
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
              <p className="mb-3 text-[10px] tracking-[0.2em] text-[#bf6548]">
                TRANSCRIPTION UNAVAILABLE
              </p>
              <p className="text-sm leading-6 text-[#66727d]">
                This record has no extracted or corrected text available. No
                sample transcription is shown.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#5e6b76]">
            {document.language && <p>Language: {document.language}</p>}
            {(document.source || document.source_url || document.provenance) && (
              <p className="mt-1">
                Source:{" "}
                {document.source || document.provenance || "External source"}
              </p>
            )}
          </div>

          {(document.file_url || document.file_path) && (
  <a
    href={document.file_url || document.file_path}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#1a2c3b] px-5 py-2.5 text-sm text-white transition hover:bg-[#344d61]"
            >
              Open Original Document ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
