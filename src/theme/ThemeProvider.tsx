import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setThemeMode, type ThemeMode } from "./tokens";

/**
 * Light, dark, or whatever the phone is set to.
 *
 * The choice lives on the device (it is a display preference, not account
 * data) and is read before the first screen draws, so the app never opens in
 * one theme and flips to the other. "System" follows the phone, including
 * when it changes while the app is open.
 *
 * Changing theme remounts the screens under `key`: every style sheet is
 * cached per theme (see themed() in tokens.ts), so a fresh render is all it
 * takes for every surface, line and word to pick up the new palette.
 */
export type ThemeChoice = "system" | "light" | "dark";

const KEY = "lawfic.theme";

type Ctx = { choice: ThemeChoice; mode: ThemeMode; setChoice: (c: ThemeChoice) => void };
const ThemeContext = createContext<Ctx>({ choice: "dark", mode: "dark", setChoice: () => {} });

const resolve = (c: ThemeChoice): ThemeMode => (c === "system" ? (Appearance.getColorScheme() === "light" ? "light" : "dark") : c);

export function useThemeChoice() {
  return useContext(ThemeContext);
}

/** Reads the saved choice once; `ready` is false until it has. */
export function useThemeBoot() {
  const [choice, setChoiceState] = useState<ThemeChoice>("dark");
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .catch(() => null)
      .then((v) => {
        if (!alive) return;
        const c: ThemeChoice = v === "light" || v === "system" ? v : "dark";
        const m = resolve(c);
        setThemeMode(m);
        setChoiceState(c);
        setMode(m);
        setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  /* Follow the phone while "System" is chosen. */
  useEffect(() => {
    if (choice !== "system") return;
    const sub = Appearance.addChangeListener(() => {
      const m = resolve("system");
      setThemeMode(m);
      setMode(m);
    });
    return () => sub.remove();
  }, [choice]);

  const setChoice = useCallback((c: ThemeChoice) => {
    const m = resolve(c);
    setThemeMode(m);
    setChoiceState(c);
    setMode(m);
    AsyncStorage.setItem(KEY, c).catch(() => {});
  }, []);

  return { ready, value: { choice, mode, setChoice } as Ctx };
}

export function ThemeProvider({ value, children }: { value: Ctx; children: React.ReactNode }) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
