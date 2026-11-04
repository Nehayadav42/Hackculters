import { useState } from "react";

export default function OcrViewer({ monuments = [], monumentsLoading = false }) {
  const [file, setFile] = useState(null);
  const [monumentId, setMonumentId] = useState("");
  const [sourceLang, setSourceLang] = useState("hi");
  const [docType, setDocType] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleExtract(e) {
    e.preventDefault();

    if (!file || !monumentId) {
      setError("Choose a monument and a file before processing.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Choose a file smaller than 10 MB.");
      }

      // 1. Automatically grab the active Supabase session token from localStorage
      const supabaseKey = Object.keys(localStorage).find(
        (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
      );
      let token = "";
      if (supabaseKey) {
        const sessionData = JSON.parse(localStorage.getItem(supabaseKey));
        token = sessionData?.access_token || "";
      }

      // 2. Build the form data exactly as Express expects it
      const formData = new FormData();
      formData.append("file", file);
      formData.append("source_language", sourceLang);
      formData.append("output_language", targetLang);
      formData.append("document_type", docType);
      formData.append("site_id", monumentId);

      // 3. Fetch directly to your Node.js Express route with the dynamic token
      const res = await fetch("/api/v1/ai/ocr", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to process document.");
      }

      // 4. Set the result using the ai_metadata returned from your Express controller
      setResult(data.ai_metadata);
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
    backgroundColor: "#1a2835",
    color: "#f3f5f6",
    border: "1px solid #bf6548",
    borderRadius: "9px",
    padding: "12px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    colorScheme: "dark",
  };

  // Common text area styling
  const textareaStyle = {
    backgroundColor: "#141f2a",
    color: "#ffe2cc",
    border: "1px solid #bf6548",
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
    caretColor: "#ffe2cc",
  };

  // Common label styling
  const labelStyle = {
    display: "block",
    fontSize: "13px",
    color: "#f3f5f6",
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
    <div className="w-full bg-[#18232e] text-white p-6 rounded-xl border border-[#52697c]">

      {/* Heading */}
      <h2 className="text-2xl font-serif mb-6 text-[#f0b395]">
        Digital Heritage Manuscript OCR Processor
      </h2>

      {/* Control Bar */}
      <form
        onSubmit={handleExtract}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 items-end bg-[#223240] p-5 rounded-xl mb-6 border border-[#3f5261]"
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
              backgroundColor: "#1a2835",
              border: "1px solid #bf6548",
              borderRadius: "9px",
              padding: "8px",
            }}
          />

        </div>

        <div>
          <label htmlFor="ocr-monument" style={labelStyle}>
            Associated Monument
          </label>
          <select
            id="ocr-monument"
            value={monumentId}
            onChange={(event) => setMonumentId(event.target.value)}
            disabled={monumentsLoading || monuments.length === 0}
            required
            style={selectStyle}
          >
            <option value="">
              {monumentsLoading ? "Loading monuments..." : "Select a monument"}
            </option>
            {monuments.map((monument) => (
              <option key={monument.id} value={monument.id}>
                {monument.name}
              </option>
            ))}
          </select>
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
        <div className="md:col-span-2 xl:col-span-5 flex justify-end">
          <button
            type="submit"
            disabled={loading || monumentsLoading || monuments.length === 0}
            className="bg-[#bf6548] text-[#171717] font-bold px-8 py-3 rounded-lg text-sm transition hover:bg-[#d87d5c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing OCR..."
              : "Extract Text"}
          </button>
        </div>
      </form>

      {monuments.length === 0 && !monumentsLoading && (
        <p className="mb-5 text-sm text-[#f0b395]">
          OCR cannot be linked until a monument record is available in the archive.
        </p>
      )}

      {/* Selected File */}
      {file && (
        <p className="text-sm text-white mb-4">
          Selected File:{" "}
          <span className="text-[#f0b395] font-semibold">
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

      {result && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-[#bf6548]/35 bg-[#bf6548]/10 p-4 text-sm text-white/90"
        >
          <p>
            Translation:{" "}
            <strong className="text-[#f0b395]">
              {result.translation_status === "completed"
                ? "Complete"
                : result.translation_status === "not_required"
                  ? "Not needed"
                  : "Unavailable"}
            </strong>
            {result.translation_status === "failed" &&
              ` — ${result.translation_message || "The translation service did not return a result."}`}
          </p>
          {result.transliteration_status === "failed" &&
            result.transliteration_message && (
              <p className="mt-1">
                Transliteration unavailable: {result.transliteration_message}
              </p>
            )}
        </div>
      )}

      {/* Output Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {outputCards.map((item, index) => (
          <div
            key={index}
            className="bg-[#223240] border border-[#3f5261] rounded-xl p-4 flex flex-col"
          >

            {/* Card Heading */}
            <div className="flex justify-between items-center gap-2 mb-3">

              <h3 className="text-sm font-bold text-[#f0b395]">
                {item.title}
              </h3>

              {item.value && (
                <button
                  type="button"
                  onClick={() => copyText(item.value)}
                  className="text-xs text-white bg-[#3a4b59] hover:bg-[#666666] px-3 py-1.5 rounded-md transition"
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
        <div className="mt-5 p-4 rounded-lg bg-[#223240] border border-[#3f5261] flex flex-wrap gap-5 text-sm">

          <span className="text-white">
            Engine:{" "}
            <span className="text-[#f0b395]">
              {result.ocr_engine || "N/A"}
            </span>
          </span>

          <span className="text-white">
            Confidence:{" "}
            <span className="text-[#f0b395]">
              {result.ocr_confidence != null
                ? `${(result.ocr_confidence * 100).toFixed(1)}%`
                : "N/A"}
            </span>
          </span>
          <span className="text-white">
            Language:{" "}
            <span className="text-[#f0b395]">
              {result.detected_source_language || "Not detected"}
            </span>
          </span>

        </div>
      )}

    </div>
  );
}