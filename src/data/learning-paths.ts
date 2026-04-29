/**
 * Learning paths for the "What do you have?" selector on the Learn
 * home. Each path picks an ordered subset of module ids that's most
 * relevant for the selected grant type. The "all" path is the
 * default order — used when the user picks "Not sure" or "Mix" or
 * hasn't picked anything.
 */

import { modules } from "./modules";

export type GrantType = "iso" | "nso" | "rsu" | "mix" | "unsure";

const allIds = modules.map((m) => m.id);

export const learningPaths: Record<GrantType, string[]> = {
  iso: ["basics", "isos", "tax", "liquidity", "nsos", "rsus"],
  nso: ["basics", "nsos", "tax", "liquidity", "isos", "rsus"],
  rsu: ["basics", "rsus", "tax", "liquidity", "isos", "nsos"],
  mix: ["basics", "isos", "nsos", "rsus", "tax", "liquidity"],
  unsure: allIds,
};

export const pathLeadIns: Record<GrantType, string> = {
  iso: "Start with the basics, then ISOs, then how it shows up at tax time.",
  nso: "Start with the basics, then NSOs, then how it shows up at tax time.",
  rsu: "Start with the basics, then RSUs, then how it shows up at tax time.",
  mix: "If you have a mix, work through them in this order. Tax scenarios pulls from all three.",
  unsure:
    "Start at the top. If you don't know what you have, the first module covers the basics.",
};
