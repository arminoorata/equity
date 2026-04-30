"use client";

import { useId, useRef, useState } from "react";
import { usePortal } from "@/lib/state/PortalContext";
import type { PlanDoc } from "@/lib/state/PortalContext";
import { GEMINI_MODEL } from "@/lib/gemini";
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
        PDF, .txt, or .md up to 8 MB. The document is read in your
        browser, attached to the next request, and never stored on a
        server.
      </p>
      <p
        className="mt-2 text-xs"
        style={{ color: "var(--amber)" }}
      >
        Google Gemini is a third-party AI provider. Some employers
        prohibit sending plan documents to outside AI services, and
        free-tier Gemini may use prompts to improve their models. Check
        your company&rsquo;s policy before uploading.
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
        style={{
          background: "var(--surface-alt)",
          color: "var(--text)",
        }}
      >
        Choose file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
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
          className="mt-1 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          Free tier. Daily and per-minute limits apply.
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
