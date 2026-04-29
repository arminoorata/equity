"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Portal state. One provider mounted in app/layout.tsx wraps every tab
 * route. Grants, profile, and reset live here so navigating between
 * routes does not blow them away.
 *
 * Persistence is opt-in. The user can save grants to localStorage by
 * flipping the "Remember on this device" toggle inside the grant
 * builder. By default nothing is written outside of memory. The Ask
 * tab manages its own API key separately.
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

export type CompanyType = "private" | "public";

export type Profile = {
  name?: string;
  experience?: "beginner" | "intermediate" | "advanced";
  companyType: CompanyType;
  grants: Grant[];
};

const STORAGE_KEY_GRANTS = "equity_grants_v1";
const STORAGE_KEY_REMEMBER = "equity_remember_grants";

const initialProfile: Profile = {
  companyType: "private",
  grants: [],
};

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `g_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function defaultGrant(): Grant {
  return {
    id: makeId(),
    type: "iso",
    shares: 10000,
    strike: 2,
    date: todayISO(),
    vestStartDate: todayISO(),
    cliffMonths: 12,
    vestYears: 4,
    vestMonths: 0,
    exerciseWindowDays: 90,
    earlyExerciseAllowed: false,
  };
}

export function defaultAddGrant(): Grant {
  return {
    id: makeId(),
    type: "nso",
    shares: 5000,
    strike: 2,
    date: todayISO(),
    vestStartDate: todayISO(),
    cliffMonths: 12,
    vestYears: 4,
    vestMonths: 0,
    exerciseWindowDays: 90,
    earlyExerciseAllowed: false,
  };
}

type PortalContextValue = {
  profile: Profile;
  setProfile: (next: Profile) => void;
  addGrant: (g?: Partial<Grant>) => void;
  updateGrant: (id: string, patch: Partial<Grant>) => void;
  removeGrant: (id: string) => void;
  setCompanyType: (t: CompanyType) => void;
  rememberGrants: boolean;
  setRememberGrants: (b: boolean) => void;
  builderOpen: boolean;
  openBuilder: () => void;
  closeBuilder: () => void;
  completedModules: Record<string, true>;
  markModuleComplete: (id: string) => void;
  unmarkModuleComplete: (id: string) => void;
  resetAll: () => void;
};

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [completedModules, setCompletedModules] = useState<
    Record<string, true>
  >({});
  const [rememberGrants, setRememberGrantsState] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount if the remember toggle is on.
  // The setState calls here are intentional and only fire once: they
  // bridge persisted browser state into React state after SSR. They are
  // gated by the `hydrated` flag below so the persistence effect does
  // not clobber stored values on first paint.
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const remember = window.localStorage.getItem(STORAGE_KEY_REMEMBER);
        if (remember === "true") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setRememberGrantsState(true);
          const raw = window.localStorage.getItem(STORAGE_KEY_GRANTS);
          if (raw) {
            const parsed = JSON.parse(raw) as Profile;
            if (parsed && Array.isArray(parsed.grants)) {
              setProfile(parsed);
            }
          }
        }
      } catch {
        // ignore parse / storage errors
      }
    }
    setHydrated(true);
  }, []);

  // Persist when remember is on. Gated on hydration so the first commit
  // does not erase saved grants before the load effect can populate
  // state.
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    try {
      if (rememberGrants) {
        window.localStorage.setItem(
          STORAGE_KEY_GRANTS,
          JSON.stringify(profile),
        );
        window.localStorage.setItem(STORAGE_KEY_REMEMBER, "true");
      } else {
        window.localStorage.removeItem(STORAGE_KEY_GRANTS);
        window.localStorage.removeItem(STORAGE_KEY_REMEMBER);
      }
    } catch {
      // ignore
    }
  }, [profile, rememberGrants, hydrated]);

  const setRememberGrants = useCallback((b: boolean) => {
    setRememberGrantsState(b);
  }, []);

  const addGrant = useCallback((patch?: Partial<Grant>) => {
    setProfile((prev) => ({
      ...prev,
      grants: [...prev.grants, { ...defaultAddGrant(), ...patch }],
    }));
  }, []);

  const updateGrant = useCallback((id: string, patch: Partial<Grant>) => {
    setProfile((prev) => ({
      ...prev,
      grants: prev.grants.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }, []);

  const removeGrant = useCallback((id: string) => {
    setProfile((prev) => ({
      ...prev,
      grants: prev.grants.filter((g) => g.id !== id),
    }));
  }, []);

  const setCompanyType = useCallback((t: CompanyType) => {
    setProfile((prev) => ({ ...prev, companyType: t }));
  }, []);

  const openBuilder = useCallback(() => setBuilderOpen(true), []);
  const closeBuilder = useCallback(() => setBuilderOpen(false), []);

  const markModuleComplete = useCallback((id: string) => {
    setCompletedModules((prev) =>
      prev[id] ? prev : { ...prev, [id]: true as const },
    );
  }, []);

  const unmarkModuleComplete = useCallback((id: string) => {
    setCompletedModules((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setProfile(initialProfile);
    setCompletedModules({});
    setRememberGrantsState(false);
    setBuilderOpen(false);
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem("anthropic_key");
      localStorage.removeItem("anthropic_key");
      localStorage.removeItem("remember_key");
      localStorage.removeItem(STORAGE_KEY_GRANTS);
      localStorage.removeItem(STORAGE_KEY_REMEMBER);
    } catch {
      // Ignore storage errors (private mode, etc.)
    }
  }, []);

  const value = useMemo<PortalContextValue>(
    () => ({
      profile,
      setProfile,
      addGrant,
      updateGrant,
      removeGrant,
      setCompanyType,
      rememberGrants,
      setRememberGrants,
      builderOpen,
      openBuilder,
      closeBuilder,
      completedModules,
      markModuleComplete,
      unmarkModuleComplete,
      resetAll,
    }),
    [
      profile,
      addGrant,
      updateGrant,
      removeGrant,
      setCompanyType,
      rememberGrants,
      setRememberGrants,
      builderOpen,
      openBuilder,
      closeBuilder,
      completedModules,
      markModuleComplete,
      unmarkModuleComplete,
      resetAll,
    ],
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
