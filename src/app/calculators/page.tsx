import TabPlaceholder from "@/components/tab/TabPlaceholder";

export const metadata = { title: "Calculators" };

export default function CalculatorsPage() {
  return (
    <TabPlaceholder eyebrow="Calculators" title="Run the numbers.">
      <p>
        An options modeller, an RSU modeller, and a side-by-side scenario
        comparison for option grants. Inputs come from your grants when you
        set them up; outputs are illustrations using your own assumptions,
        not predictions.
      </p>
      <p>Coming soon.</p>
    </TabPlaceholder>
  );
}
