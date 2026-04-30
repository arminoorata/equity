"use client";

import { useId, useRef, useState } from "react";
import { usePortal } from "@/lib/state/PortalContext";
import type { PlanDoc } from "@/lib/state/PortalContext";
import { GEMINI_MODEL, GEMINI_MODEL_NOTE } from "@/lib/gemini";
import FaqBank from "./FaqBank";

const SUGGESTED_DEFAULT = [
  "What happens to my options when I leave?",
  "Should I early exercise?",
  "What's the difference between ISOs and NSOs?",
  "How are RSUs taxed?",
  "What is a 409A valuation?",
  "What if my company gets acquired?",
  "What is AMT and should I worry about it?",
  "Can I sell shares before an IPO?",
];

const SUGGESTED_WITH_DOC = [
  "Summarize the key terms in this plan in plain English",
  "What's my exercise window after termination per this document?",
  "Does this plan allow early exercise?",
  "What type of options does this plan cover?",
  "Are there change-of-control provisions I should know about?",
  "What's the cliff and vesting schedule per this document?",
  "Anything in this document I'd be likely to miss on a first read?",
  "What questions should I ask my company's equity team based on this document?",
];

/**
 * Empty-state for the Ask tab when a key is saved but no messages
 * have been sent. Shows the plan-doc upload card, a grid of
 * suggested questions, and a small settings panel (model selector +
 * forget-key + show-key).
 */
export default function ChatEmptyState({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  const { planDoc } = usePortal();
  const suggestions = planDoc ? SUGGESTED_WITH_DOC : SUGGESTED_DEFAULT;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-6">
        <PlanDocUpload />
        <div>
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Try one of these
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {suggestions.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onPick(q)}
                  className="block w-full rounded-md border p-3 text-left text-sm transition-colors"
                  style={{
                    borderColor: "var(--line)",
                    background: "var(--surface)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <FaqBank onPick={onPick} />
      </div>

      <SettingsPanel />
    </div>
  );
}

function PlanDocUpload() {
  const { planDoc, setPlanDoc } = usePortal();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Document upload defaults to OFF. The user has to affirmatively
  // confirm their employer permits sending the document to a
  // third-party AI before the file picker activates. Per the
  // CFO/Legal review feedback, this prevents an "oops" upload from
  // someone whose company policy quietly prohibits it.
  const [policyConfirmed, setPolicyConfirmed] = useState(false);

  const onFile = async (f: File) => {
    setError(null);
    if (f.size > 8 * 1024 * 1024) {
      setError("That file is over 8 MB. Try something smaller.");
      return;
    }
    try {
      if (f.type === "application/pdf") {
        const buf = await f.arrayBuffer();
        const base64 = bufToBase64(buf);
        const doc: PlanDoc = {
          type: "pdf",
          name: f.name,
          mimeType: "application/pdf",
          data: base64,
        };
        setPlanDoc(doc);
      } else if (
        f.type === "text/plain" ||
        f.type === "text/markdown" ||
        f.name.endsWith(".md") ||
        f.name.endsWith(".txt")
      ) {
        const text = await f.text();
        const doc: PlanDoc = {
          type: "text",
          name: f.name,
          mimeType: f.type || "text/plain",
          data: text,
        };
        setPlanDoc(doc);
      } else {
        setError("Only PDF, .txt, and .md files are supported.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that file.");
    }
  };

  if (planDoc) {
    return (
      <div
        className="rounded-md border p-4"
        style={{
          borderColor: "var(--accent-soft)",
          background: "var(--surface)",
        }}
      >
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          Plan document attached
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p
            className="mono truncate text-sm"
            style={{ color: "var(--text)" }}
          >
            {planDoc.name}
          </p>
          <button
            type="button"
            onClick={() => setPlanDoc(null)}
            className="text-xs underline underline-offset-4"
            style={{ color: "var(--text-muted)" }}
            aria-label="Remove plan document"
          >
            Remove ×
          </button>
        </div>
        <p
          className="mt-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          The AI references this document. In-session only, never stored.
          Verify any document-specific claims against your original paperwork
          before acting on them.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-md border border-dashed p-4"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <p
        className="text-[11px] font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--text-muted)" }}
      >
        Optional: attach your plan document
      </p>
      <p
        className="mt-2 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Generic Q&amp;A is the default. The Ask tab works without an
        upload. Attach a plan document only if you want answers grounded
        in your actual paperwork. PDF, .txt, or .md up to 8 MB. The file
        is read in your browser, attached to the next request, and
        never stored on a server.
      </p>
      <div
        className="mt-3 rounded-md border-l-4 p-3 text-xs leading-6"
        style={{
          borderColor: "var(--amber)",
          borderLeftColor: "var(--amber)",
          borderLeftWidth: 4,
          background: "var(--surface-soft)",
          color: "var(--text-secondary)",
        }}
        role="note"
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--amber)" }}
        >
          Before you upload
        </p>
        <p className="mt-1">
          Google Gemini is a third-party AI provider. Many employers
          prohibit sending plan documents, grant agreements, or
          compensation data to outside AI services. Free-tier Gemini
          may also use prompts to improve their models. Don&rsquo;t
          upload unless your company&rsquo;s policy permits it.
        </p>
      </div>
      <label
        className="mt-3 flex items-start gap-2 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <input
          type="checkbox"
          checked={policyConfirmed}
          onChange={(e) => setPolicyConfirmed(e.target.checked)}
          className="mt-1"
        />
        <span>
          My company permits sending this document to Google Gemini for
          analysis.
        </span>
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={!policyConfirmed}
        aria-disabled={!policyConfirmed}
        className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
        style={{
          background: policyConfirmed
            ? "var(--surface-alt)"
            : "var(--surface-soft)",
          color: policyConfirmed ? "var(--text)" : "var(--text-muted)",
          cursor: policyConfirmed ? "pointer" : "not-allowed",
          opacity: policyConfirmed ? 1 : 0.6,
        }}
      >
        Choose file
      </button>
      {!policyConfirmed && (
        <p
          className="mt-2 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          Confirm the policy checkbox above to enable file selection.
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && policyConfirmed) onFile(f);
          // Reset so the same file can be re-selected if needed.
          e.target.value = "";
        }}
      />
      {error && (
        <p
          className="mt-3 text-xs"
          style={{ color: "var(--red)" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SettingsPanel() {
  const {
    rememberKey,
    setRememberKey,
    setApiKey,
    apiKey,
  } = usePortal();
  const [showKey, setShowKey] = useState(false);
  const id = useId();

  return (
    <div
      className="space-y-4 rounded-md border p-4"
      style={{ borderColor: "var(--line)", background: "var(--surface-soft)" }}
    >
      <div>
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          Model
        </p>
        <p
          className="mt-2 mono text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          {GEMINI_MODEL}
        </p>
        <p
          className="mt-1 text-[11px] leading-5"
          style={{ color: "var(--text-muted)" }}
        >
          {GEMINI_MODEL_NOTE} Free tier. Daily and per-minute limits
          apply.
        </p>
      </div>

      <label
        className="flex items-center gap-2 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <input
          type="checkbox"
          checked={rememberKey}
          onChange={(e) => setRememberKey(e.target.checked)}
        />
        <span>Remember key on this device</span>
      </label>

      <div>
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          API key
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span
            className="mono truncate rounded-md border px-2 py-1"
            style={{
              borderColor: "var(--line)",
              background: "var(--bg)",
              color: "var(--text-secondary)",
              maxWidth: "12rem",
            }}
            id={id}
          >
            {showKey
              ? apiKey
              : `${"•".repeat(Math.max(0, apiKey.length - 4))}${apiKey.slice(-4)}`}
          </span>
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="underline underline-offset-4"
            style={{ color: "var(--text-muted)" }}
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setApiKey("");
            // Reset the remember-on-this-device opt-in so the next
            // pasted key doesn't silently inherit the prior setting.
            setRememberKey(false);
          }}
          className="mt-2 text-xs underline underline-offset-4"
          style={{ color: "var(--red)" }}
        >
          Forget my key
        </button>
      </div>
    </div>
  );
}

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return typeof btoa !== "undefined"
    ? btoa(bin)
    : Buffer.from(bytes).toString("base64");
}
