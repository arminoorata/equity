"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/state/PortalContext";

/**
 * Chat message list. User messages right-aligned in `--surface-alt`,
 * assistant left-aligned in `--surface` with a thin border. Auto-
 * scrolls to the latest message on update.
 */
export default function ChatThread({
  messages,
  pending,
}: {
  messages: ChatMessage[];
  pending: boolean;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  return (
    <ul className="flex flex-col gap-3" aria-live="polite">
      {messages.map((m) => (
        <li
          key={m.id}
          className="flex"
          style={{
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          <div
            className="max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-3 text-[14.5px] leading-7"
            style={{
              background:
                m.role === "user" ? "var(--surface-alt)" : "var(--surface)",
              border:
                m.role === "user"
                  ? "1px solid var(--accent-soft)"
                  : "1px solid var(--line)",
              color: "var(--text)",
            }}
          >
            {m.content}
          </div>
        </li>
      ))}
      {pending && (
        <li className="flex justify-start">
          <div
            className="rounded-lg border px-4 py-3 text-[13px] italic"
            style={{
              borderColor: "var(--line)",
              background: "var(--surface)",
              color: "var(--text-muted)",
            }}
          >
            Thinking…
          </div>
        </li>
      )}
      <div ref={endRef} />
    </ul>
  );
}
