import { portfolioStorageKey } from "./portfolio";
import { toast } from "./toastStore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { api, errorText, jsonRequest } from "./api";
import type {
  AppNotification,
  ChecklistItem,
  ItineraryDay,
  TravelDocument,
} from "./types";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  paxCount: number;
}
export interface SavedState {
  notifications: AppNotification[];
  documents: TravelDocument[];
  itinerary: ItineraryDay[];
  checklists: {
    items?: ChecklistItem[];
    expenses?: Expense[];
    packing?: { id: string; text: string; checked: boolean }[];
  };
}
export const emptyUserState = (): SavedState => ({
  notifications: [],
  documents: [],
  itinerary: [],
  checklists: {},
});
interface StateContext {
  state: SavedState;
  setState: Dispatch<SetStateAction<SavedState>>;
  signedIn: boolean;
  userId?: string;
}
export const UserStateContext = createContext<StateContext | null>(null);
export function useSavedState<K extends keyof SavedState>(
  key: K,
): [SavedState[K], Dispatch<SetStateAction<SavedState[K]>>] {
  const context = useContext(UserStateContext);
  if (!context) throw new Error("Missing user state provider");
  const setState = context.setState;
  const update = useCallback<Dispatch<SetStateAction<SavedState[K]>>>(
    (value) =>
      setState((previous) => ({
        ...previous,
        [key]:
          typeof value === "function"
            ? (value as (old: SavedState[K]) => SavedState[K])(previous[key])
            : value,
      })),
    [key, setState],
  );
  return [context.state[key], update];
}

/** Debounce changed fields; queue writes and never copy one account's state to another. */
export function useUserStatePersistence(
  userId: string | undefined,
  ready: boolean,
  state: SavedState,
  onError: (message: string) => void,
) {
  const baseline = useRef(state);
  const latest = useRef({ userId, ready, state });
  const sequence = useRef(Promise.resolve());
  const errorHandler = useRef(onError);
  useEffect(() => {
    errorHandler.current = onError;
  }, [onError]);
  const flush = useCallback(async () => {
    const snapshot = latest.current;
    if (!snapshot.ready) return;
    const previous = baseline.current;
    const changes: Partial<SavedState> = {};
    for (const key of [
      "notifications",
      "documents",
      "itinerary",
      "checklists",
    ] as const) {
      if (snapshot.state[key] !== previous[key])
        Object.assign(changes, { [key]: snapshot.state[key] });
    }
    if (!Object.keys(changes).length) return;
    if (!snapshot.userId) {
      try {
        localStorage.setItem(
          portfolioStorageKey,
          JSON.stringify(snapshot.state),
        );
        baseline.current = snapshot.state;
        if (changes.documents || changes.itinerary || changes.checklists)
          toast.success("Changes saved on this device.");
      } catch {
        throw new Error("Device storage is full. Your changes are not saved.");
      }
      return;
    }
    const write = sequence.current.then(async () => {
      if (latest.current.userId !== snapshot.userId) return;
      await api("/api/user-state", changes, "PUT", snapshot.userId);
      if (latest.current.userId === snapshot.userId) {
        baseline.current = snapshot.state;
        if (changes.documents || changes.itinerary || changes.checklists)
          toast.success("Your changes have synced to your account.");
      }
    });
    sequence.current = write.catch(() => {});
    await write;
  }, []);
  useEffect(() => {
    const previous = latest.current;
    latest.current = { userId, ready, state };
    if (previous.userId !== userId || !ready || !previous.ready) {
      baseline.current = state;
      return;
    }
    if (baseline.current === state) return;
    const timer = window.setTimeout(() => {
      void flush().catch((error) =>
        errorHandler.current("Changes have not synced: " + errorText(error)),
      );
    }, 650);
    return () => clearTimeout(timer);
  }, [userId, ready, state, flush]);
  useEffect(() => {
    const saveOnLeave = () => {
      const snapshot = latest.current;
      if (!snapshot.ready || baseline.current === snapshot.state) return;
      if (!snapshot.userId) {
        try {
          localStorage.setItem(
            portfolioStorageKey,
            JSON.stringify(snapshot.state),
          );
        } catch {
          /* The UI already reports storage failures. */
        }
      } else {
        const changes: Partial<SavedState> = {};
        for (const key of [
          "notifications",
          "documents",
          "itinerary",
          "checklists",
        ] as const) {
          if (snapshot.state[key] !== baseline.current[key])
            Object.assign(changes, { [key]: snapshot.state[key] });
        }
        // Keepalive requests are bounded by browsers. Normal autosave handles larger files.
        const body = JSON.stringify(changes);
        if (body.length < 60000)
          void fetch("/api/user-state", {
            ...jsonRequest(changes, "PUT", snapshot.userId),
            keepalive: true,
          }).catch(() => {});
      }
    };
    window.addEventListener("pagehide", saveOnLeave);
    return () => window.removeEventListener("pagehide", saveOnLeave);
  }, []);
  return flush;
}
export function useGuestState() {
  return useState<SavedState>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(portfolioStorageKey) || "{}",
      );
      return {
        notifications: Array.isArray(saved.notifications)
          ? saved.notifications
          : [],
        documents: Array.isArray(saved.documents) ? saved.documents : [],
        itinerary: Array.isArray(saved.itinerary) ? saved.itinerary : [],
        checklists:
          saved.checklists && typeof saved.checklists === "object"
            ? saved.checklists
            : {},
      };
    } catch {
      return emptyUserState();
    }
  });
}
