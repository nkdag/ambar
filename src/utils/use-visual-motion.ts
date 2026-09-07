"use client";

import { useSyncExternalStore } from "react";

const reducedQuery = "(prefers-reduced-motion: reduce)";
const pointerQuery = "(hover: hover) and (pointer: fine)";
function subscribe(query: string, listener: () => void) {
  const media = window.matchMedia?.(query);
  media?.addEventListener("change", listener);
  return () => media?.removeEventListener("change", listener);
}
const subscribeMotion = (listener: () => void) => subscribe(reducedQuery, listener);
const subscribePointer = (listener: () => void) => subscribe(pointerQuery, listener);
const reducedSnapshot = () => window.matchMedia?.(reducedQuery).matches ?? true;
const pointerSnapshot = () => window.matchMedia?.(pointerQuery).matches ?? false;
const reducedServer = () => true;
const pointerServer = () => false;

// SSR and first hydration are static. Preference changes take effect live.
export function useVisualMotion() {
  return !useSyncExternalStore(subscribeMotion, reducedSnapshot, reducedServer);
}
export function useFinePointer() {
  return useSyncExternalStore(subscribePointer, pointerSnapshot, pointerServer);
}
