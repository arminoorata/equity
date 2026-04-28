/**
 * Widget slot. Module data references widgets by string id (e.g.
 * "amt-spread", "rsu-withholding"). This dispatcher looks up the id
 * in a registry and renders the matching component.
 *
 * Phase 3.5a leaves the registry empty so widget blocks render
 * nothing. Phase 3.5c will register the actual interactive widgets.
 * Unknown ids always render nothing. No "coming soon" placeholders.
 */

import type { ComponentType } from "react";

const registry: Record<string, ComponentType> = {
  // Populated in Phase 3.5c:
  // "vesting-timeline": VestingTimelineWidget,
  // "amt-spread":       AmtSpreadWidget,
  // "nso-exercise-tax": NsoExerciseTaxWidget,
  // "rsu-withholding":  RsuWithholdingWidget,
  // "iso-vs-nso-compare": IsoVsNsoCompareWidget,
  // "lockup-timeline":  LockupTimelineWidget,
};

export default function WidgetSlot({ widget }: { widget: string }) {
  const Widget = registry[widget];
  if (!Widget) return null;
  return <Widget />;
}
