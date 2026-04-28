import TabPlaceholder from "@/components/tab/TabPlaceholder";

export const metadata = { title: "Vesting" };

export default function VestingPage() {
  return (
    <TabPlaceholder eyebrow="Vesting" title="See your schedule.">
      <p>
        Once you set up your grants, this tab shows your vesting timeline
        month by month, plus a Lifecycle view that maps your grant from
        cliff through to liquidity event.
      </p>
      <p>Coming soon. Set up your grants now and they will be ready when this lands.</p>
    </TabPlaceholder>
  );
}
