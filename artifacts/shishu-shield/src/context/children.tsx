import React, { createContext, useContext, useState, useEffect } from "react";

export interface ChildProfile {
  id: string;
  name: string;
  age: string;
  gender: "boy" | "girl" | "other";
  conditions: string[];
}

interface ChildrenContextValue {
  children: ChildProfile[];
  activeChildId: string | null;
  activeChild: ChildProfile | null;
  addChild: (child: Omit<ChildProfile, "id">) => void;
  updateChild: (id: string, updates: Partial<Omit<ChildProfile, "id">>) => void;
  removeChild: (id: string) => void;
  setActiveChild: (id: string) => void;
}

const ChildrenContext = createContext<ChildrenContextValue>({
  children: [],
  activeChildId: null,
  activeChild: null,
  addChild: () => {},
  updateChild: () => {},
  removeChild: () => {},
  setActiveChild: () => {},
});

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function ChildrenProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<ChildProfile[]>(() =>
    load("shishu-children", [])
  );
  const [activeChildId, setActiveChildIdState] = useState<string | null>(() =>
    load("shishu-active-child", null)
  );

  const activeChild = profiles.find((c) => c.id === activeChildId) ?? profiles[0] ?? null;

  const addChild = (child: Omit<ChildProfile, "id">) => {
    const newChild: ChildProfile = { ...child, id: crypto.randomUUID() };
    setProfiles((prev) => {
      const updated = [...prev, newChild];
      save("shishu-children", updated);
      return updated;
    });
    if (!activeChildId) {
      setActiveChildIdState(newChild.id);
      save("shishu-active-child", newChild.id);
    }
  };

  const updateChild = (id: string, updates: Partial<Omit<ChildProfile, "id">>) => {
    setProfiles((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      save("shishu-children", updated);
      return updated;
    });
  };

  const removeChild = (id: string) => {
    setProfiles((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      save("shishu-children", updated);
      if (activeChildId === id) {
        const next = updated[0]?.id ?? null;
        setActiveChildIdState(next);
        save("shishu-active-child", next);
      }
      return updated;
    });
  };

  const setActiveChild = (id: string) => {
    setActiveChildIdState(id);
    save("shishu-active-child", id);
  };

  return (
    <ChildrenContext.Provider
      value={{
        children: profiles,
        activeChildId: activeChild?.id ?? null,
        activeChild,
        addChild,
        updateChild,
        removeChild,
        setActiveChild,
      }}
    >
      {reactChildren}
    </ChildrenContext.Provider>
  );
}

export function useChildren() {
  return useContext(ChildrenContext);
}
