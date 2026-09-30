import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

/**
 * Face ID, Touch ID and fingerprint on the wallet — the app's half of the
 * website's passkey lock.
 *
 * ON A PHONE THIS IS THE REAL THING
 *
 * expo-local-authentication asks the operating system to verify the person, and
 * the OS answers yes or no. The app never sees a face or a fingerprint; it sees
 * a boolean from the secure enclave. That is the same guarantee the website's
 * WebAuthn gives, arrived at through the platform API instead of the browser.
 *
 * IT RELOCKS WHEN YOU LEAVE
 *
 * Put the app in the background and come back, and the wallet is locked again.
 * That is the behaviour every banking app has and the one people actually
 * rely on — a lock that stays open until the app is killed protects nobody who
 * hands their phone to a friend to look at a photo.
 *
 * WHAT THIS PREVIEW DOES NOT DO
 *
 * It is a front end. "Enabled" lives in memory, so it resets when the app is
 * closed; persisting it belongs in expo-secure-store once there is an account
 * to attach it to. And nothing here gates a server — the balance on these
 * screens is a sample. When the app talks to lawfic.pro, the server-side gate
 * the website already has (isWalletLocked) is what does the protecting; this
 * decides what the phone shows.
 *
 * ON THE WEB there is no biometric API, so the lock reports itself unavailable
 * and says so, rather than pretending.
 */

export type BioKind = "face" | "fingerprint" | "iris" | null;

type LockState = {
  available: boolean;
  kind: BioKind;
  /** What to call it on a button: "Face ID", "Touch ID", "fingerprint". */
  label: string;
  enabled: boolean;
  unlocked: boolean;
  unlock: () => Promise<boolean>;
  enable: () => Promise<boolean>;
  disable: () => void;
  relock: () => void;
};

const LOCK_KEY = "lawfic:wallet-lock";

const Ctx = createContext<LockState | null>(null);

export function LockProvider({ children }: { children: React.ReactNode }) {
  const [available, setAvailable] = useState(false);
  const [kind, setKind] = useState<BioKind>(null);
  const [enabled, setEnabled] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const background = useRef(false);

  /* The setting survives a restart. A lock that quietly switches itself off
     every time the app is killed is not a lock. */
  useEffect(() => {
    AsyncStorage.getItem(LOCK_KEY)
      .then((v) => {
        if (v === "on") setEnabled(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    (async () => {
      try {
        const hw = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setAvailable(hw && enrolled);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const T = LocalAuthentication.AuthenticationType;
        setKind(
          types.includes(T.FACIAL_RECOGNITION)
            ? "face"
            : types.includes(T.FINGERPRINT)
              ? "fingerprint"
              : types.includes(T.IRIS)
                ? "iris"
                : null,
        );
      } catch {
        setAvailable(false);
      }
    })();
  }, []);

  /* Relock on the way back in from the background. */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "background") background.current = true;
      if (s === "active" && background.current) {
        background.current = false;
        setUnlocked(false);
      }
    });
    return () => sub.remove();
  }, []);

  const label =
    kind === "face" ? (Platform.OS === "ios" ? "Face ID" : "face unlock") : kind === "fingerprint" ? (Platform.OS === "ios" ? "Touch ID" : "fingerprint") : kind === "iris" ? "iris" : "biometrics";

  const prompt = useCallback(
    async (reason: string) => {
      if (!available) return false;
      try {
        const r = await LocalAuthentication.authenticateAsync({
          promptMessage: reason,
          cancelLabel: "Cancel",
          /* No device-passcode fallback. The point of the lock is the person,
             and a four-digit code somebody watched you type is not them. */
          disableDeviceFallback: true,
        });
        return r.success;
      } catch {
        return false;
      }
    },
    [available],
  );

  const unlock = useCallback(async () => {
    const ok = await prompt("Unlock your LAWFIC wallet");
    if (ok) setUnlocked(true);
    return ok;
  }, [prompt]);

  /* Turning it on requires passing it once. A lock you enabled without proving
     you could open it is a lock that can shut you out. */
  const enable = useCallback(async () => {
    const ok = await prompt("Confirm it is you");
    if (ok) {
      setEnabled(true);
      setUnlocked(true);
      AsyncStorage.setItem(LOCK_KEY, "on").catch(() => {});
    }
    return ok;
  }, [prompt]);

  const disable = useCallback(() => {
    setEnabled(false);
    setUnlocked(false);
    AsyncStorage.removeItem(LOCK_KEY).catch(() => {});
  }, []);

  const relock = useCallback(() => setUnlocked(false), []);

  const value = useMemo(
    () => ({ available, kind, label, enabled, unlocked, unlock, enable, disable, relock }),
    [available, kind, label, enabled, unlocked, unlock, enable, disable, relock],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLock(): LockState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLock must be used inside LockProvider");
  return v;
}

/** Is the money hidden right now? */
export function useWalletHidden(): boolean {
  const { enabled, unlocked } = useLock();
  return enabled && !unlocked;
}
