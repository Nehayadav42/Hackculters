import { useState } from "react";
import { chatWithArchive } from "../../services/api.js";

export default function ArchiveAssistant({ monumentId }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setAnswer(null);
    setLoading(true);

    try {
      const response = await chatWithArchive({
        monumentId,
        question: question.trim(),
      });
      setAnswer(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The archive assistant is unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#c8d3db] bg-[#e8edf0] p-5 sm:p-7">
      <p className="text-[10px] font-semibold tracking-[0.2em] text-[#bf6548]">
        SOURCE-GROUNDED AI
      </p>
      <h3 className="mt-2 font-serif text-2xl text-[#1a2c3b]">
        Ask the archive
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66727d]">
        Answers use this record and its linked transcriptions. If the archive
        does not support a claim, the assistant should say so.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={`archive-question-${monumentId}`}>
          Ask a question about this heritage record
        </label>
        <input
          id={`archive-question-${monumentId}`}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={1000}
          required
          placeholder="Ask about its history, architecture, or source records"
          className="min-w-0 flex-1 rounded-lg border border-[#d2dce2] bg-[#f8f9fa] px-4 py-3 text-sm text-[#20384b] placeholder:text-[#66727d] focus:border-[#bf6548] focus:outline-none focus:ring-2 focus:ring-[#bf6548]/20"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-lg bg-[#1a2c3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#344d61] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking sources..." : "Ask"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[#d8b8a7] bg-[#fff8f4] p-4 text-sm text-[#8b5546]">
          {error}
        </p>
      )}

      {answer && (
        <div className="mt-5 rounded-xl border border-[#c8d3db] bg-[#f8f9fa] p-5">
          <p className="whitespace-pre-line text-sm leading-7 text-[#20384b]">
            {answer.answer}
          </p>
          {answer.sources?.length > 0 && (
            <div className="mt-5 border-t border-[#c8d3db] pt-4">
              <p className="text-[10px] font-semibold tracking-[0.15em] text-[#5e6b76]">
                RECORD SOURCES
              </p>
              <ul className="mt-2 space-y-2">
                {answer.sources.map((source) => (
                  <li
                    key={source.label}
                    className="text-xs leading-5 text-[#66727d]"
                  >
                    <span className="mr-2 font-semibold text-[#bf6548]">
                      [{source.label}]
                    </span>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-[#bba882] underline-offset-2 hover:text-[#1a2c3b]"
                      >
                        {source.title}
                      </a>
                    ) : (
                      source.title
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
