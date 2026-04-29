"use client";

import { useState } from "react";
import { usePortal } from "@/lib/state/PortalContext";

/**
 * Message input bar. Enter sends, Shift+Enter newlines. Sticky at the
 * bottom of the chat surface. Disabled while a request is in flight.
 */
export default function ChatInput({
  onSend,
  pending,
}: {
  onSend: (text: string) => void;
  pending: boolean;
}) {
  const { planDoc, setPlanDoc } = usePortal();
  const [draft, setDraft] = useState("");

  const submit = () => {
    const t = draft.trim();
    if (!t || pending) return;
    setDraft("");
    onSend(t);
  };

  return (
    <div className="space-y-2">
      {planDoc && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs"
          style={{
            borderColor: "var(--accent-soft)",
            background: "var(--surface-soft)",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            <span
              className="text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--accent)" }}
            >
              Attached
            </span>{" "}
            <span className="mono">{planDoc.name}</span>
          </span>
          <button
            type="button"
            onClick={() => setPlanDoc(null)}
            className="underline underline-offset-4"
            style={{ color: "var(--text-muted)" }}
          >
            Remove
          </button>
        </div>
      )}
      <div
        className="flex flex-wrap items-end gap-2 rounded-md border p-2"
        style={{
          borderColor: "var(--line)",
          background: "var(--surface)",
        }}
      >
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask about your equity. Enter to send, Shift+Enter for newline."
          disabled={pending}
          className="flex-1 resize-y bg-transparent px-2 py-1.5 text-[14.5px] leading-6 outline-none"
          style={{ color: "var(--text)", minHeight: "3rem" }}
          aria-label="Message"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim() || pending}
          className="rounded-full px-4 py-2 text-sm font-medium"
          style={{
            background:
              !draft.trim() || pending
                ? "var(--surface-alt)"
                : "var(--accent)",
            color:
              !draft.trim() || pending ? "var(--text-muted)" : "var(--bg)",
            opacity: !draft.trim() || pending ? 0.7 : 1,
          }}
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
