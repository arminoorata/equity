/**
 * Learning paths for the "What do you have?" selector on the Learn
 * home. Each path picks an ordered subset of module ids that's most
 * relevant for the selected grant type. The "all" path is the
 * default order, used when the user picks "Not sure" or "Mix" or
 * hasn't picked anything.
 */

import { modules } from "./modules";

export type GrantType = "iso" | "nso" | "rsu" | "mix" | "unsure";

const allIds = modules.map((m) => m.id);

export const learningPaths: Record<GrantType, string[]> = {
  iso: ["basics", "isos", "tax", "leaving", "liquidity", "case-study", "nsos", "rsus"],
  nso: ["basics", "nsos", "tax", "leaving", "liquidity", "case-study", "isos", "rsus"],
  rsu: ["basics", "rsus", "tax", "liquidity", "leaving", "case-study", "isos", "nsos"],
  mix: ["basics", "isos", "nsos", "rsus", "tax", "leaving", "liquidity", "case-study"],
  unsure: allIds,
};

export const pathLeadIns: Record<GrantType, string> = {
  iso: "ISO path: AMT first, then the qualifying-disposition rules, then leaving.",
  nso: "NSO path: ordinary income at exercise, then withholding, then leaving.",
  rsu: "RSU path: withholding first, then single vs double trigger, then liquidity.",
  mix: "Mixed path: basics, then each grant type, then how it lands at tax time.",
  unsure:
    "Default path: basics first, then each grant type. The case study shows how the pieces fit together.",
};
