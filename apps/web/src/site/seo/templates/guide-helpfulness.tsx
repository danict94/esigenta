"use client";

import { useState, type FormEvent } from "react";

import {
  readGuideHelpfulnessResponse,
  resolveGuideHelpfulnessSessionId,
  writeGuideHelpfulnessResponse,
} from "./guide-helpfulness-session-id";

type GuideHelpfulnessResponse = "yes" | "no";

export function GuideHelpfulness({ guideSlug }: { guideSlug: string }) {
  const [submittedResponse, setSubmittedResponse] = useState<GuideHelpfulnessResponse | null>(
    () => readGuideHelpfulnessResponse(guideSlug),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [isCommentSubmitted, setIsCommentSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(response: GuideHelpfulnessResponse) {
    if (submittedResponse || isSubmitting) return;

    const anonymousSessionId = resolveGuideHelpfulnessSessionId(guideSlug);
    if (!anonymousSessionId) {
      setError("Non siamo riusciti a registrare il voto. Riprova.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await fetch("/api/guides/helpfulness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideSlug, anonymousSessionId, response }),
      });

      if (!result.ok) throw new Error("guide_helpfulness_submission_failed");

      writeGuideHelpfulnessResponse(guideSlug, response);
      setSubmittedResponse(response);
    } catch {
      setError("Non siamo riusciti a registrare il voto. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!submittedResponse || isCommentSubmitting || isCommentSubmitted) return;

    const normalizedComment = comment.trim();
    if (!normalizedComment) return;

    const anonymousSessionId = resolveGuideHelpfulnessSessionId(guideSlug);
    if (!anonymousSessionId) {
      setError("Non siamo riusciti a registrare il commento. Riprova.");
      return;
    }

    setIsCommentSubmitting(true);
    setError(null);

    try {
      const result = await fetch("/api/guides/helpfulness", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideSlug, anonymousSessionId, comment: normalizedComment }),
      });

      if (!result.ok) throw new Error("guide_helpfulness_comment_submission_failed");

      setIsCommentSubmitted(true);
    } catch {
      setError("Non siamo riusciti a registrare il commento. Riprova.");
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="guide-helpfulness-title" className="eg-section-editorial">
      <div className="eg-container">
        <div className="max-w-190 py-4">
        <h2 id="guide-helpfulness-title" className="text-[15px] font-semibold text-eg-ink">
          Hai trovato utile questa guida?
        </h2>

        {submittedResponse ? (
          <div className="mt-3">
            <p role="status" className="text-[13.5px] text-eg-text-muted">
              Grazie per il tuo feedback.
            </p>

            {isCommentSubmitted ? (
              <p role="status" className="mt-3 text-[13.5px] text-eg-text-muted">
                Commento ricevuto. Grazie.
              </p>
            ) : (
              <form onSubmit={submitComment} className="mt-4 max-w-xl">
                <label htmlFor={`guide-helpfulness-comment-${guideSlug}`} className="text-sm font-medium text-eg-ink">
                  {submittedResponse === "yes"
                    ? "Cosa ti è stato più utile?"
                    : "Cosa mancava o non era chiaro?"}
                </label>
                <textarea
                  id={`guide-helpfulness-comment-${guideSlug}`}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  disabled={isCommentSubmitting}
                  className="mt-2 block w-full rounded-md border border-eg-border bg-white px-3 py-2 text-sm text-eg-ink disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isCommentSubmitting || comment.trim().length === 0}
                    className="eg-button-ghost min-h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Invia commento
                  </button>
                  <span className="text-xs text-eg-text-muted">Facoltativo</span>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void submit("yes")}
              className="min-h-9 rounded-eg-md border border-eg-border bg-eg-surface px-4 text-[12.5px] font-semibold text-eg-text-muted transition-colors hover:border-eg-brand-hover hover:bg-eg-brand-soft hover:text-eg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sì
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void submit("no")}
              className="min-h-9 rounded-eg-md border border-eg-border bg-eg-surface px-4 text-[12.5px] font-semibold text-eg-text-muted transition-colors hover:border-eg-brand-hover hover:bg-eg-brand-soft hover:text-eg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              No
            </button>
          </div>
        )}

        {error ? (
          <p role="alert" className="mt-3 text-[13.5px] text-eg-error">
            {error}
          </p>
        ) : null}
        </div>
      </div>
    </section>
  );
}
