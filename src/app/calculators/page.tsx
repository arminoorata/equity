import CalculatorsView from "@/components/calculators/CalculatorsView";

export const metadata = { title: "Calculators" };

/**
 * Calculators tab. Five sub-views: Options, RSUs, Compare strategies,
 * Offers (offer comparison), and "What it's worth" (dilution scenarios).
 */
export default function CalculatorsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.32em]"
        style={{ color: "var(--accent)" }}
      >
        Calculators
      </p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
        Run the numbers.
      </h1>
      <p
        className="mt-3 max-w-2xl text-base leading-7"
        style={{ color: "var(--text-secondary)" }}
      >
        Plug in your assumptions and see the shape of the math. Inputs
        pre-fill from your grants when one is set up. Outputs are
        illustrations, not predictions or tax advice.
      </p>
      <div className="mt-8">
        <CalculatorsView />
      </div>
    </main>
  );
}
