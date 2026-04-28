"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Portal state — one provider mounted in app/layout.tsx wraps all six
 * tab routes. Grants, profile, and reset live here so navigating
 * between routes does not blow them away.
 *
 * Per the spec (01-ARCHITECTURE.md), nothing here is persisted to
 * sessionStorage or localStorage by default. The Ask tab will write
 * the user's API key into sessionStorage on its own (not via this
 * provider) so the privacy story stays clean.
 *
 * Phase 2 boots this with the shape only. Phase 3+ wires the grant
 * builder drawer and the calculators that consume it.
 */

export type GrantType = "iso" | "nso" | "rsu";

export type Grant = {
  id: string;
  type: GrantType;
  shares: number;
  strike: number;
  date: string;
  vestStartDate: string;
  cliffMonths: number;
  vestYears: number;
  vestMonths: number;
  exerciseWindowDays: number;
  earlyExerciseAllowed: boolean;
};

export type Profile = {
  name?: string;
  experience?: "beginner" | "intermediate" | "advanced";
  companyType: "private" | "public";
  grants: Grant[];
};

const initialProfile: Profile = {
  companyType: "private",
  grants: [],
};

type PortalContextValue = {
  profile: Profile;
  setProfile: (next: Profile) => void;
  resetAll: () => void;
};

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  // Reset clears in-memory state plus the BYOK key (sessionStorage and
  // localStorage). Theme preference is intentionally preserved.
  const resetAll = useCallback(() => {
    setProfile(initialProfile);
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem("anthropic_key");
      localStorage.removeItem("anthropic_key");
      localStorage.removeItem("remember_key");
    } catch {
      // Ignore storage errors (private mode, etc.)
    }
  }, []);

  const value = useMemo<PortalContextValue>(
    () => ({ profile, setProfile, resetAll }),
    [profile, resetAll],
  );

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) {
    throw new Error("usePortal must be used inside <PortalProvider>");
  }
  return ctx;
}
