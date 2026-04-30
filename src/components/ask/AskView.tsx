"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePortal } from "@/lib/state/PortalContext";
import { buildSystemPrompt, sendChat } from "@/lib/gemini";
import KeyEmptyState from "./KeyEmptyState";
import ChatEmptyState from "./ChatEmptyState";
import ChatThread from "./ChatThread";
import ChatInput from "./ChatInput";

/**
 * Ask tab body. Three visual states driven by what's in
 * PortalContext:
 *  - No API key: show the BYOK paste card.
 *  - Key, no messages: show the "what to ask" card with suggested
 *    questions, plan-doc upload, and settings.
 *  - Messages: show the chat thread + a fixed input bar.
 */
export default function AskView() {
  const {
    profile,
    apiKey,
    messages,
    appendMessage,
    clearMessages,
    planDoc,
  } = usePortal();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // requestIdRef gates the response handler so a stale in-flight
  // request can't append into a thread the user already cleared.
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight request on unmount so a navigated-away tab
  // doesn't keep firing.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const cancelInFlight = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    requestIdRef.current += 1;
    setPending(false);
  }, []);

  const handleClear = useCallback(() => {
    cancelInFlight();
    clearMessages();
    setError(null);
  }, [cancelInFlight, clearMessages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending || !apiKey) return;
      setError(null);
      const userMessage = {
        role: "user" as const,
        content: trimmed,
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      };
      appendMessage(userMessage);
      setPending(true);
      const systemPrompt = buildSystemPrompt(
        profile.grants,
        profile.companyType,
        planDoc,
      );
      const myId = ++requestIdRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      const result = await sendChat({
        apiKey,
        systemPrompt,
        messages: [...messages, userMessage],
        planDoc,
        signal: controller.signal,
      });
      // If the user cleared the thread (or unmounted) the request id
      // has advanced and we silently drop this response.
      if (requestIdRef.current !== myId) {
        return;
      }
      abortRef.current = null;
      if (result.ok) {
        appendMessage({
          role: "assistant",
          content: result.text,
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        });
      } else if (result.kind !== "network" || result.message !== "Request was cancelled.") {
        setError(result.message);
      }
      setPending(false);
    },
    [
      apiKey,
      appendMessage,
      messages,
      pending,
      planDoc,
      profile.companyType,
      profile.grants,
    ],
  );

  if (!apiKey) {
    return <KeyEmptyState />;
  }

  if (messages.length === 0) {
    return <ChatEmptyState onPick={send} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleClear}
          className="underline underline-offset-4"
          style={{ color: "var(--text-muted)" }}
        >
          ← All questions
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="underline underline-offset-4"
          style={{ color: "var(--text-muted)" }}
        >
          + New conversation
        </button>
      </div>
      <ChatThread messages={messages} pending={pending} />
      {error && (
        <p
          className="rounded-md border-l-4 px-3 py-2 text-sm"
          style={{
            borderColor: "var(--red)",
            background: "var(--red-bg)",
            color: "var(--text)",
          }}
          role="alert"
        >
          {error}
        </p>
      )}
      <ChatInput onSend={send} pending={pending} />
      <p
        className="text-xs italic leading-6"
        style={{ color: "var(--text-muted)" }}
      >
        Educational only. Not tax, legal, or financial advice. Talk to a
        qualified advisor before acting on anything specific.
      </p>
    </div>
  );
}
