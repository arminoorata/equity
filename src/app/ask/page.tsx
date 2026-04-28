import TabPlaceholder from "@/components/tab/TabPlaceholder";

export const metadata = { title: "Ask" };

export default function AskPage() {
  return (
    <TabPlaceholder eyebrow="Ask" title="Bring your own Anthropic key.">
      <p>
        This tab will host an AI Q&amp;A grounded in equity-specific
        education and (optionally) your own plan document. Your key stays
        in your browser. Your messages and any uploaded document go from
        your browser straight to Anthropic. No servers in between.
      </p>
      <p>
        That is the whole privacy story, because there is no backend to
        log anything even if we wanted to.
      </p>
      <p>Coming soon.</p>
    </TabPlaceholder>
  );
}
