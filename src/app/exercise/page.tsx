import TabPlaceholder from "@/components/tab/TabPlaceholder";

export const metadata = { title: "Exercise Guide" };

export default function ExercisePage() {
  return (
    <TabPlaceholder
      eyebrow="Exercise Guide"
      title="A framework for thinking through exercise."
    >
      <p>
        Five questions about your situation, type of grant, spread, cash
        comfort, and risk tolerance. The answers feed conditional advice
        cards. The point is not to tell you what to do, it is to surface
        the questions worth asking.
      </p>
      <p>Coming soon.</p>
    </TabPlaceholder>
  );
}
