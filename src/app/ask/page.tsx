import AskView from "@/components/ask/AskView";

export const metadata = { title: "Ask" };

/**
 * Ask tab. BYOK chat. The user pastes a Google AI Studio API key, the
 * chat surface unlocks. Calls generativelanguage.googleapis.com
 * directly from the browser with the key as x-goog-api-key. No
 * backend, no logged-in account, no chat log on our side.
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
        offers, and the rest of equity comp. Bring your own Google AI
        Studio key (free tier, no credit card). Your key, your
        conversation, and any plan document you upload stay in your
        browser and travel only to Google.
      </p>
      <div className="mt-10">
        <AskView />
      </div>
    </main>
  );
}
