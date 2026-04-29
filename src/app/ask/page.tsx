import AskView from "@/components/ask/AskView";

export const metadata = { title: "Ask" };

/**
 * Ask tab. BYOK chat. The user pastes an Anthropic API key, the chat
 * surface unlocks. Calls api.anthropic.com directly from the browser
 * with `anthropic-dangerous-direct-browser-access`. No backend, no
 * logged-in account, no chat log on our side.
 */
export default function AskPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.32em]"
        style={{ color: "var(--accent)" }}
      >
        Ask
      </p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
        A second pair of eyes on your equity.
      </h1>
      <p
        className="mt-3 max-w-2xl text-base leading-7"
        style={{ color: "var(--text-secondary)" }}
      >
        Educational chat about ISOs, NSOs, RSUs, AMT, lock-ups, tender
        offers, and the rest of equity comp. Bring your own Anthropic API
        key. Your key, your conversation, and any plan document you
        upload stay in your browser and travel only to Anthropic.
      </p>
      <div className="mt-10">
        <AskView />
      </div>
    </main>
  );
}
