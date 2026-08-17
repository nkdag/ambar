import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof navigator !== "undefined" && !navigator.locks) {
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: {
      request: async (...args: unknown[]) => {
        const callback = args.at(-1) as (lock: Lock) => unknown;
        return callback({} as Lock);
      },
    },
  });
}

afterEach(() => cleanup());
