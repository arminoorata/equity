import TabPlaceholder from "@/components/tab/TabPlaceholder";

export const metadata = { title: "Glossary" };

export default function GlossaryPage() {
  return (
    <TabPlaceholder eyebrow="Glossary" title="The terms, in plain English.">
      <p>
        About thirty-five terms you will run into when reading anything
        about equity. ISO, NSO, RSU, AMT, qualifying disposition, 83(b),
        QSBS, and the rest. No company-specific jargon.
      </p>
      <p>Coming soon.</p>
    </TabPlaceholder>
  );
}
