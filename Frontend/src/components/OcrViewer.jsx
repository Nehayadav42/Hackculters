
import { useState } from "react";

export default function OcrViewer() {
  const [file, setFile] = useState(null);
  const [sourceLang, setSourceLang] = useState("hi");
  const [docType, setDocType] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [savedDocument, setSavedDocument] = useState(null);

  async function handleExtract(e) {
    e.preventDefault();

    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    setError("");
    setResult(null);
    setSavedDocument(null);
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("document", file);
      formData.append("source_language", sourceLang);
      formData.append("output_language", targetLang);
      formData.append("document_type", docType);

      const response = await fetch("/api/v1/ai/ocr", {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response received from server.");
      }

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "OCR processing failed.");
      }

      setResult(data.ai_metadata);
      setSavedDocument(data.data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const copyText = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Unable to copy text. Please check clipboard permissions.");
    }
  };

  // Common dropdown styling
  const selectStyle = {
    backgroundColor: "#101510",
    color: "#FFFFFF",
    border: "1px solid #8B754B",
    borderRadius: "9px",
    padding: "12px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    colorScheme: "dark",
  };

  // Common text area styling
  const textareaStyle = {
    backgroundColor: "#080B09",
    color: "#FFF0AD",
    border: "1px solid #A58A52",
    borderRadius: "9px",
    padding: "14px",
    fontSize: "14px",
    lineHeight: "1.7",
    width: "100%",
    height: "260px",
    resize: "vertical",
    outline: "none",
    fontFamily: "monospace",
    colorScheme: "dark",
    caretColor: "#FFF0AD",
  };

  // Common label styling
  const labelStyle = {
    display: "block",
    fontSize: "13px",
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: "9px",
  };

  const outputCards = [
    {
      title: "Original Extracted Text",
      value: result?.original_text,
      placeholder: "Extracted text will appear here...",
    },
    {
      title: `Translated Text (${targetLang})`,
      value: result?.translated_text,
      placeholder: "Translated text will appear here...",
    },
    {
      title: "Roman Transliteration",
      value: result?.romanized_text,
      placeholder: "Roman transliteration will appear here...",
    },
  ];

  return (
    <div className="w-full bg-[#121412] text-white p-6 rounded-xl border border-[#75613D]">

      {/* Heading */}
      <h2 className="text-2xl font-serif mb-6 text-[#F0C36A]">
        Digital Heritage Manuscript OCR Processor
      </h2>

      {/* Control Bar */}
      <form
        onSubmit={handleExtract}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-end bg-[#1C211C] p-5 rounded-xl mb-6 border border-[#625638]"
      >

        {/* File Upload */}
        <div>
          <label style={labelStyle}>
            Choose File
          </label>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.txt,.docx"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
            className="w-full text-sm"
            style={{
              color: "#FFFFFF",
              backgroundColor: "#101510",
              border: "1px solid #8B754B",
              borderRadius: "9px",
              padding: "8px",
            }}
          />

          <style>
            {`
              input[type="file"]::file-selector-button {
                background: #D8B36A;
                color: #171717;
                border: none;
                border-radius: 6px;
                padding: 9px 14px;
                margin-right: 10px;
                font-weight: 600;
                cursor: pointer;
              }

              input[type="file"]::file-selector-button:hover {
                background: #F0D18B;
              }

              select option {
                background: #101510;
                color: #FFFFFF;
              }

              textarea::placeholder {
                color: #BDBDBD;
                opacity: 1;
              }
            `}
          </style>
        </div>

        {/* Source Language */}
        <div>
          <label style={labelStyle}>
            Source Language
          </label>

          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            style={selectStyle}
          >
            <option value="hi">Hindi (Devanagari)</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Document Type */}
        <div>
          <label style={labelStyle}>
            Document Type
          </label>

          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            style={selectStyle}
          >
            <option value="auto">Auto-Detect / Printed</option>
            <option value="handwritten">Handwritten</option>
          </select>
        </div>

        {/* Target Language */}
        <div>
          <label style={labelStyle}>
            Translate To
          </label>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={selectStyle}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        {/* Extract Button */}
        <div className="md:col-span-2 xl:col-span-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#D8B36A] text-[#171717] font-bold px-8 py-3 rounded-lg text-sm transition hover:bg-[#F0D18B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing OCR..."
              : "Extract Text"}
          </button>
        </div>
      </form>

      {/* Selected File */}
      {file && (
        <p className="text-sm text-white mb-4">
          Selected File:{" "}
          <span className="text-[#FFE5A0] font-semibold">
            {file.name}
          </span>
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 rounded-lg p-3 mb-5 text-sm">
          {error}
        </div>
      )}

      {/* Output Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {outputCards.map((item, index) => (
          <div
            key={index}
            className="bg-[#1C211C] border border-[#625638] rounded-xl p-4 flex flex-col"
          >

            {/* Card Heading */}
            <div className="flex justify-between items-center gap-2 mb-3">

              <h3 className="text-sm font-bold text-[#F0C36A]">
                {item.title}
              </h3>

              {item.value && (
                <button
                  type="button"
                  onClick={() => copyText(item.value)}
                  className="text-xs text-white bg-[#454545] hover:bg-[#666666] px-3 py-1.5 rounded-md transition"
                >
                  Copy
                </button>
              )}
            </div>

            {/* Output Text Area */}
            <textarea
              readOnly
              value={item.value || ""}
              placeholder={item.placeholder}
              style={textareaStyle}
            />

          </div>
        ))}

      </div>

      {/* OCR Information */}
      {result && (
        <div className="mt-5 p-4 rounded-lg bg-[#1C211C] border border-[#625638] flex flex-wrap gap-5 text-sm">

          <span className="text-white">
            Engine:{" "}
            <span className="text-[#FFE5A0]">
              {result.ocr_engine || "N/A"}
            </span>
          </span>

          <span className="text-white">
            Confidence:{" "}
            <span className="text-[#FFE5A0]">
              {result.ocr_confidence != null
                ? `${(result.ocr_confidence * 100).toFixed(1)}%`
                : "N/A"}
            </span>
          </span>

        </div>
      )}

      {savedDocument && (
        <p className="mt-3 text-sm text-[#FFE5A0]" role="status">
          OCR result saved to the document archive.
        </p>
      )}

    </div>
  );
}
