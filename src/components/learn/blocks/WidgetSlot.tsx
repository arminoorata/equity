/**
 * Widget slot. Module data references widgets by string id (e.g.
 * "amt-spread", "rsu-withholding"). This dispatcher looks up the id
 * in a registry and renders the matching component.
 *
 * Widgets are client components (each has its own "use client" at the
 * top). The dispatcher itself is a server component because it just
 * picks one of them by id.
 *
 * Unknown ids always render nothing. No "coming soon" placeholders.
 */

import type { ComponentType } from "react";
import VestingTimelineWidget from "@/components/learn/widgets/VestingTimelineWidget";
import AmtSpreadWidget from "@/components/learn/widgets/AmtSpreadWidget";
import NsoExerciseTaxWidget from "@/components/learn/widgets/NsoExerciseTaxWidget";
import RsuWithholdingWidget from "@/components/learn/widgets/RsuWithholdingWidget";
import IsoVsNsoCompareWidget from "@/components/learn/widgets/IsoVsNsoCompareWidget";
import LockupTimelineWidget from "@/components/learn/widgets/LockupTimelineWidget";

const registry: Record<string, ComponentType> = {
  "vesting-timeline": VestingTimelineWidget,
  "amt-spread": AmtSpreadWidget,
  "nso-exercise-tax": NsoExerciseTaxWidget,
  "rsu-withholding": RsuWithholdingWidget,
  "iso-vs-nso-compare": IsoVsNsoCompareWidget,
  "lockup-timeline": LockupTimelineWidget,
};

export default function WidgetSlot({ widget }: { widget: string }) {
  const Widget = registry[widget];
  if (!Widget) return null;
  return <Widget />;
}
