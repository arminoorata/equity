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

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  id: string;
};

export type PlanDoc = {
  type: "pdf" | "text";
  name: string;
  mimeType: string;
  data: string;
};

export type ChatModel = "claude-haiku-4-5" | "claude-sonnet-4-6";

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
  // Ask tab state
  apiKey: string;
  setApiKey: (k: string) => void;
  rememberKey: boolean;
  setRememberKey: (b: boolean) => void;
  chatModel: ChatModel;
  setChatModel: (m: ChatModel) => void;
  messages: ChatMessage[];
  setMessages: (m: ChatMessage[]) => void;
  appendMessage: (m: ChatMessage) => void;
  clearMessages: () => void;
  planDoc: PlanDoc | null;
  setPlanDoc: (d: PlanDoc | null) => void;
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
  const [apiKey, setApiKeyState] = useState("");
  const [rememberKey, setRememberKeyState] = useState(false);
  const [chatModel, setChatModelState] = useState<ChatModel>("claude-haiku-4-5");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [planDoc, setPlanDoc] = useState<PlanDoc | null>(null);

  // Hydrate from storage on mount. Loads grants when remember-grants
  // is on, the API key from sessionStorage by default and localStorage
  // when remember-key is on, and the saved model selection. setState
  // here is intentional and only fires once.
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rememberG = window.localStorage.getItem(STORAGE_KEY_REMEMBER);
        if (rememberG === "true") {
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

        const rememberK =
          window.localStorage.getItem("remember_key") === "true";
        if (rememberK) {
          setRememberKeyState(true);
          const k = window.localStorage.getItem("anthropic_key") ?? "";
          if (k) setApiKeyState(k);
        } else {
          const k = window.sessionStorage.getItem("anthropic_key") ?? "";
          if (k) setApiKeyState(k);
        }

        const savedModel = window.localStorage.getItem("chat_model");
        if (savedModel === "claude-haiku-4-5" || savedModel === "claude-sonnet-4-6") {
          setChatModelState(savedModel);
        }
      } catch {
        // ignore parse / storage errors
      }
    }
    setHydrated(true);
  }, []);

  // Persist grants when remember is on. Gated on hydration so the
  // first commit does not erase saved grants before the load effect
  // can populate state.
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

  // Persist API key. Default storage is sessionStorage so the key
  // is gone when the tab closes. Opting into rememberKey migrates
  // it to localStorage.
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    try {
      if (apiKey) {
        if (rememberKey) {
          window.localStorage.setItem("anthropic_key", apiKey);
          window.sessionStorage.removeItem("anthropic_key");
        } else {
          window.sessionStorage.setItem("anthropic_key", apiKey);
          window.localStorage.removeItem("anthropic_key");
        }
      } else {
        window.localStorage.removeItem("anthropic_key");
        window.sessionStorage.removeItem("anthropic_key");
      }
      if (rememberKey) {
        window.localStorage.setItem("remember_key", "true");
      } else {
        window.localStorage.removeItem("remember_key");
      }
    } catch {
      // ignore
    }
  }, [apiKey, rememberKey, hydrated]);

  // Persist chat-model selection. Cheap, no privacy implications.
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("chat_model", chatModel);
    } catch {
      // ignore
    }
  }, [chatModel, hydrated]);

  const setRememberGrants = useCallback((b: boolean) => {
    setRememberGrantsState(b);
  }, []);

  const setApiKey = useCallback((k: string) => {
    setApiKeyState(k);
  }, []);

  const setRememberKey = useCallback((b: boolean) => {
    setRememberKeyState(b);
  }, []);

  const setChatModel = useCallback((m: ChatModel) => {
    setChatModelState(m);
  }, []);

  const appendMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
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
    setApiKeyState("");
    setRememberKeyState(false);
    setMessages([]);
    setPlanDoc(null);
    setChatModelState("claude-haiku-4-5");
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem("anthropic_key");
      localStorage.removeItem("anthropic_key");
      localStorage.removeItem("remember_key");
      localStorage.removeItem("chat_model");
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
      apiKey,
      setApiKey,
      rememberKey,
      setRememberKey,
      chatModel,
      setChatModel,
      messages,
      setMessages,
      appendMessage,
      clearMessages,
      planDoc,
      setPlanDoc,
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
      apiKey,
      setApiKey,
      rememberKey,
      setRememberKey,
      chatModel,
      setChatModel,
      messages,
      appendMessage,
      clearMessages,
      planDoc,
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
