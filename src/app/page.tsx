import TabPlaceholder from "@/components/tab/TabPlaceholder";

export const metadata = {
  title: { absolute: "Equity Education Portal" },
  description:
    "A free public tool for understanding stock options, RSUs, and the rest of equity compensation.",
};

/**
 * Learn tab (`/`). Phase 2 ships the placeholder shape; Phase 3 lands
 * the six modules from spec/05-CONTENT.md plus the intro card and the
 * Set up grants CTA.
 */
export default function LearnPage() {
  return (
    <TabPlaceholder eyebrow="Learn" title="A free tool for understanding your equity.">
      <p>
        Stock options, RSUs, vesting, taxes, and the decisions that come with
        all of it. Six modules cover the basics. The Vesting and Calculators
        tabs work with grants you set up. The Ask tab brings your own
        Anthropic key for personalised Q&amp;A.
      </p>
      <p>
        Modules and full content are coming together over the next few weeks.
      </p>
    </TabPlaceholder>
  );
}
