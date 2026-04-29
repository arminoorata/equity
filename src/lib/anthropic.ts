import type {
  ChatMessage,
  ChatModel,
  Grant,
  PlanDoc,
} from "@/lib/state/PortalContext";

/**
 * Direct browser-to-Anthropic call helper. The Equity Toolkit has no
 * backend; the user's API key sits in their browser, requests go to
 * api.anthropic.com directly with `anthropic-dangerous-direct-browser-access`.
 *
 * The key, the chat history, and any uploaded plan document never
 * touch a server we operate.
 */

const SYSTEM_PROMPT_BASE = `You are an equity compensation educator for a free public web tool built by Armi Noorata. Your readers are people trying to understand their own stock options, RSUs, or other equity grants. Some are getting their first grant. Some have been vesting for years. Treat them like adults who can handle real information without being condescended to.

You provide EDUCATIONAL information only. You do not provide tax, legal, or financial advice. Always remind users to talk to a qualified tax advisor, financial planner, or attorney for advice specific to their situation. Individual circumstances vary by jurisdiction, income, filing status, the company's plan terms, and applicable law.

WHAT YOU KNOW:
- Standard mechanics of ISOs, NSOs, RSUs, vesting cliffs, exercise windows, 83(b) elections, AMT, qualifying vs disqualifying dispositions, double-trigger RSUs at private companies, lock-ups after IPO, tender offers, secondary sales.
- US-focused tax framing. Non-US users should be directed to local advisors.
- The user's grant details are appended to this prompt when present. Use them.
- The user may upload their actual stock plan document. Reference it directly when present, but say "based on the document you uploaded" so it's clear where the information comes from.

WHAT YOU DON'T KNOW:
- The user's company. You don't know its specific plan terms unless the user uploads them.
- The user's specific tax situation. You can show hypothetical math, never personal predictions.
- Whether their company allows early exercise, has extended exercise windows, has a tender program, etc. Unless the user tells you, or the uploaded document tells you.

RULES:
- Always include a one-line disclaimer that this is education, not advice, and to consult a qualified advisor.
- Default to plain English. Layer in detail only after the simple version.
- Use concrete hypothetical numbers when they help.
- Keep responses under 300 words unless the topic genuinely needs more.
- If the user asks for a personal recommendation ("should I exercise?"), reframe it as a framework: the questions to consider, the tradeoffs, who to consult.
- If the user names a specific company policy ("my PTEP is 90 days"), trust them.
- If the user asks about something outside equity comp, redirect briefly and stay in scope.
- Do not provide negotiation guidance. If asked what to ask for or how to negotiate equity terms, redirect to understanding what's already in the user's paperwork.

VOICE:
- Direct, warm, useful.
- No "let's dive in" or "here's the thing." No fake suspense.
- No em dashes. Use periods or parentheses.
- Active voice. Short sentences mixed with longer ones.
- Treat the reader like they're smart and busy.`;

function grantSummary(grants: Grant[], companyType: "private" | "public"): string {
  if (grants.length === 0) return "";
  const lines = grants.map((g, i) => {
    const strike = g.type === "rsu" ? "" : `, $${g.strike} strike`;
    return `Grant ${i + 1}: ${g.type.toUpperCase()}, ${g.shares} shares${strike}, ${g.cliffMonths}mo cliff, ${g.vestYears}yr ${g.vestMonths}mo vest, grant date ${g.date}, vest start ${g.vestStartDate}, exercise window ${g.exerciseWindowDays}d post-termination, early exercise ${g.earlyExerciseAllowed ? "allowed" : "not allowed"}.`;
  });
  return `\n\nThe user has set up the following grants:\n${lines.join(
    "\n",
  )}\nCompany status: ${companyType}.\nUse these details when answering. If the user asks about something the grants don't cover (e.g., 'what's my company's PTEP'), tell them to check their plan document or company policy.`;
}

function planDocAddendum(doc: PlanDoc | null): string {
  if (!doc) return "";
  return `\n\nThe user has uploaded their personal stock plan document titled "${doc.name}". Reference specific terms from the document when answering. Make clear that your interpretation is educational only.`;
}

export function buildSystemPrompt(
  grants: Grant[],
  companyType: "private" | "public",
  doc: PlanDoc | null,
): string {
  return SYSTEM_PROMPT_BASE + grantSummary(grants, companyType) + planDocAddendum(doc);
}

type RawAnthropicMessage =
  | { role: "user" | "assistant"; content: string }
  | {
      role: "user";
      content: Array<
        | {
            type: "document";
            source: {
              type: "base64";
              media_type: string;
              data: string;
            };
          }
        | { type: "text"; text: string }
      >;
    };

function buildMessages(
  messages: ChatMessage[],
  doc: PlanDoc | null,
): RawAnthropicMessage[] {
  if (!doc || messages.length === 0) {
    return messages.map((m) => ({ role: m.role, content: m.content }));
  }
  // Attach the document to the first user message only.
  const out: RawAnthropicMessage[] = [];
  let attached = false;
  for (const m of messages) {
    if (!attached && m.role === "user") {
      if (doc.type === "pdf") {
        out.push({
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: doc.mimeType || "application/pdf",
                data: doc.data,
              },
            },
            { type: "text", text: m.content },
          ],
        });
      } else {
        // Text/markdown: prepend the document text in front of the
        // user's message. Wrap so the model can see boundaries.
        const wrapped =
          `Plan document "${doc.name}" follows between the markers, then my question.\n\n` +
          `--- BEGIN DOCUMENT ---\n${doc.data}\n--- END DOCUMENT ---\n\n` +
          m.content;
        out.push({ role: "user", content: wrapped });
      }
      attached = true;
    } else {
      out.push({ role: m.role, content: m.content });
    }
  }
  return out;
}

export type SendChatResult =
  | { ok: true; text: string }
  | {
      ok: false;
      kind: "auth" | "rate" | "server" | "network" | "validation";
      message: string;
    };

export async function sendChat({
  apiKey,
  model,
  systemPrompt,
  messages,
  planDoc,
  signal,
}: {
  apiKey: string;
  model: ChatModel;
  systemPrompt: string;
  messages: ChatMessage[];
  planDoc: PlanDoc | null;
  signal?: AbortSignal;
}): Promise<SendChatResult> {
  const apiMessages = buildMessages(messages, planDoc);
  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages,
      }),
      signal,
    });
  } catch (err) {
    return {
      ok: false,
      kind: "network",
      message:
        err instanceof Error && err.name === "AbortError"
          ? "Request was cancelled."
          : "Couldn't reach Anthropic. Check your connection.",
    };
  }

  if (response.status === 401) {
    return {
      ok: false,
      kind: "auth",
      message: "That key didn't work. Replace it and try again?",
    };
  }
  if (response.status === 429) {
    return {
      ok: false,
      kind: "rate",
      message:
        "You've hit Anthropic's rate limit on your account. Try again in a minute.",
    };
  }
  if (response.status === 400) {
    let detail = "Anthropic rejected the request.";
    try {
      const data = (await response.json()) as { error?: { message?: string } };
      if (data?.error?.message) detail = data.error.message;
    } catch {
      // ignore parse errors
    }
    return {
      ok: false,
      kind: "validation",
      message: detail,
    };
  }
  if (response.status >= 500) {
    return {
      ok: false,
      kind: "server",
      message: "Anthropic seems to be having issues. Try again.",
    };
  }
  if (!response.ok) {
    return {
      ok: false,
      kind: "server",
      message: `Unexpected response (${response.status}).`,
    };
  }

  let text = "";
  try {
    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    text =
      data?.content
        ?.filter((c) => c.type === "text" && typeof c.text === "string")
        ?.map((c) => c.text as string)
        ?.join("\n\n") ?? "";
  } catch {
    return {
      ok: false,
      kind: "server",
      message: "Anthropic returned a response we couldn't parse.",
    };
  }

  if (!text) {
    return {
      ok: false,
      kind: "server",
      message: "Anthropic returned an empty response.",
    };
  }
  return { ok: true, text };
}
