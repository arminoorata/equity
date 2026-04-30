"use client";

import { useState } from "react";
import { usePortal } from "@/lib/state/PortalContext";

/**
 * BYOK paste card. The user pastes a Google AI Studio API key,
 * optionally checks "remember on this device", and clicks Save. The
 * key goes into sessionStorage by default; localStorage when the
 * toggle is on.
 *
 * No format validation here, just non-empty. Bad keys fail at first
 * call with a 401/403 and the chat surface shows the error.
 */
export default function KeyEmptyState() {
  const { setApiKey, rememberKey, setRememberKey } = usePortal();
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  const save = () => {
    const t = draft.trim();
    if (!t) return;
    setApiKey(t);
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-md border p-6 md:p-7"
        style={{
          borderColor: "var(--line)",
          background: "var(--surface)",
        }}
      >
        <p
          className="text-[11px] font-medium uppercase tracking-[0.32em]"
          style={{ color: "var(--accent)" }}
        >
          Bring your own key
        </p>
        <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
          Paste your Google AI key.
        </h2>
        <p
          className="mt-3 text-base leading-7"
          style={{ color: "var(--text-secondary)" }}
        >
          The Ask tab calls Google&rsquo;s Gemini API directly from your
          browser using a key you mint at Google AI Studio. Free tier,
          no credit card. The key stays on your device. There is no
          backend, no logged account, and no chat log on my side.
        </p>

        <label
          className="mt-5 flex flex-col gap-1.5"
          aria-label="Google AI Studio API key"
        >
          <span
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            API key
          </span>
          <span
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg)",
            }}
          >
            <input
              type={show ? "text" : "password"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="AIza..."
              className="mono w-full bg-transparent text-[14px]"
              style={{ color: "var(--text)" }}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="text-xs underline underline-offset-4"
              style={{ color: "var(--text-muted)" }}
            >
              {show ? "Hide" : "Show"}
            </button>
          </span>
        </label>

        <label
          className="mt-4 flex items-center gap-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <input
            type="checkbox"
            checked={rememberKey}
            onChange={(e) => setRememberKey(e.target.checked)}
          />
          <span>Remember on this device</span>
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            (Off by default. On = the key goes into this browser&rsquo;s
            local storage.)
          </span>
        </label>

        <button
          type="button"
          onClick={save}
          disabled={draft.trim().length === 0}
          className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          style={{
            background:
              draft.trim().length === 0 ? "var(--surface-alt)" : "var(--accent)",
            color: draft.trim().length === 0 ? "var(--text-muted)" : "var(--bg)",
            opacity: draft.trim().length === 0 ? 0.7 : 1,
          }}
        >
          Save key
        </button>

        <details
          className="mt-6"
          open={howOpen}
          onToggle={(e) => setHowOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary
            className="cursor-pointer text-sm"
            style={{ color: "var(--accent)" }}
          >
            How do I get a key?
          </summary>
          <ol
            className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6"
            style={{ color: "var(--text-secondary)" }}
          >
            <li>
              Go to{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
                style={{ color: "var(--accent)" }}
              >
                aistudio.google.com/app/apikey
              </a>{" "}
              and sign in with a Google account.
            </li>
            <li>
              Click <span className="mono">Create API key</span>, pick a
              project (or let Google make one), and copy the value. It
              starts with <span className="mono">AIza</span>.
            </li>
            <li>
              Paste it into the field above. The free tier on the
              latest stable Gemini model doesn&rsquo;t ask for a credit
              card. You will hit daily and per-minute caps if you chat
              heavily; that&rsquo;s normal on free.
            </li>
          </ol>
        </details>
      </div>

      <ul
        className="space-y-2 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <li>
          <span style={{ color: "var(--text-secondary)" }}>Your key:</span>{" "}
          stays in this browser. I never see it.
        </li>
        <li>
          <span style={{ color: "var(--text-secondary)" }}>Your messages:</span>{" "}
          go straight from your browser to Google. I don&rsquo;t log them.
        </li>
        <li>
          <span style={{ color: "var(--text-secondary)" }}>Your plan document:</span>{" "}
          if you upload one, it stays in this tab&rsquo;s memory and travels
          with the request to Google. Closing the tab clears it.
        </li>
        <li>
          <span style={{ color: "var(--text-secondary)" }}>Free-tier data use:</span>{" "}
          Google may use free-tier prompts and responses to improve their
          models. Paid Gemini API tiers don&rsquo;t. If your prompts contain
          anything sensitive, upgrade your billing in AI Studio or skip
          the Ask tab.
        </li>
      </ul>

      <div
        className="rounded-md border-l-4 p-4 text-sm"
        style={{
          borderColor: "var(--amber)",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderLeftColor: "var(--amber)",
          borderLeftWidth: 4,
          color: "var(--text-secondary)",
        }}
        role="note"
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--amber)" }}
        >
          Third-party AI notice
        </p>
        <p className="mt-2 leading-7">
          Google Gemini is a third-party AI provider. Some companies
          prohibit sending plan documents, grant agreements, or
          compensation data to outside AI services, and free-tier Gemini
          may use prompts to improve their models. Check your
          company&rsquo;s policy before using the Ask tab with anything
          that could be confidential. When in doubt, leave the upload
          empty and ask only generic questions.
        </p>
      </div>
    </div>
  );
}
