import { describe, expect, it } from "vitest";
import { archiveFixtures } from "@/data/fixtures";
import {
  AMBAR_VAULT_KEY,
  mutateVault,
  readVault,
  writeVault,
} from "@/domain/vault";

function memoryStorage(seed?: string): Storage {
  const values = new Map<string, string>();
  if (seed !== undefined) values.set(AMBAR_VAULT_KEY, seed);
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

function testLockManager(available = true): Pick<LockManager, "request"> {
  return {
    request: ((...args: unknown[]) => {
      const callback = args.at(-1) as (lock: Lock | null) => unknown;
      return Promise.resolve(callback(available ? {} as Lock : null));
    }) as LockManager["request"],
  };
}

describe("AMBAR local vault", () => {
  it("reports an empty vault without inventing stored records", () => {
    expect(readVault(memoryStorage())).toEqual({ status: "empty" });
  });

  it("round-trips a versioned archive without changing cent amounts", () => {
    const storage = memoryStorage();
    const result = writeVault(storage, archiveFixtures, new Date("2026-08-17T20:00:00.000Z"));

    expect(result).toEqual({ ok: true });
    expect(readVault(storage)).toEqual({
      status: "ready",
      items: archiveFixtures,
      updatedAt: "2026-08-17T20:00:00.000Z",
    });
  });

  it("classifies malformed JSON as corrupt instead of throwing", () => {
    expect(readVault(memoryStorage("{not-json"))).toEqual({ status: "corrupt" });
  });

  it("rejects unsupported vault versions without interpreting their records", () => {
    const storage = memoryStorage(JSON.stringify({ version: 99, items: archiveFixtures }));
    expect(readVault(storage)).toEqual({ status: "unsupported" });
  });

  it("rejects malformed archive records before they reach application state", () => {
    const storage = memoryStorage(
      JSON.stringify({
        version: 1,
        updatedAt: "2026-08-17T20:00:00.000Z",
        items: [{ ...archiveFixtures[0], url: "javascript:alert(1)" }],
      }),
    );

    expect(readVault(storage)).toEqual({ status: "corrupt" });
  });

  it("rejects empty, unsafe, or duplicate item IDs", () => {
    const envelope = (items: unknown[]) => memoryStorage(JSON.stringify({
      version: 1,
      updatedAt: "2026-08-17T20:00:00.000Z",
      items,
    }));

    expect(readVault(envelope([{ ...archiveFixtures[0], id: "" }]))).toEqual({ status: "corrupt" });
    expect(readVault(envelope([{ ...archiveFixtures[0], id: "unsafe id" }]))).toEqual({ status: "corrupt" });
    expect(readVault(envelope([
      archiveFixtures[0],
      { ...archiveFixtures[1], id: archiveFixtures[0].id },
    ]))).toEqual({ status: "corrupt" });
  });

  it("rejects product price histories too large to render safely", () => {
    const storage = memoryStorage(JSON.stringify({
      version: 1,
      updatedAt: "2026-08-17T20:00:00.000Z",
      items: [{
        ...archiveFixtures[0],
        product: {
          ...archiveFixtures[0].product,
          priceHistoryCents: Array.from({ length: 367 }, () => 100),
        },
      }],
    }));

    expect(readVault(storage)).toEqual({ status: "corrupt" });
  });

  it("serializes mutations with Web Locks and rebases on the latest vault", async () => {
    const storage = memoryStorage();
    writeVault(storage, [archiveFixtures[0]], new Date("2026-08-17T20:00:00.000Z"));

    const result = await mutateVault(
      storage,
      (current) => [...current, archiveFixtures[1]],
      new Date("2026-08-17T20:01:00.000Z"),
      false,
      testLockManager(),
    );

    expect(result).toEqual({ ok: true, items: [archiveFixtures[0], archiveFixtures[1]] });
  });

  it("refuses a mutation when the atomic Web Lock is unavailable", async () => {
    const storage = memoryStorage();
    writeVault(storage, [archiveFixtures[0]], new Date("2026-08-17T20:00:00.000Z"));

    await expect(mutateVault(
      storage,
      () => [archiveFixtures[1]],
      new Date("2026-08-17T20:01:00.000Z"),
      false,
      testLockManager(false),
    )).resolves.toEqual({ ok: false, reason: "busy" });

    const vault = readVault(storage);
    expect(vault.status).toBe("ready");
    if (vault.status === "ready") expect(vault.items).toEqual([archiveFixtures[0]]);
  });

  it("fails closed when Web Locks are unsupported", async () => {
    await expect(mutateVault(
      memoryStorage(),
      () => [archiveFixtures[0]],
      new Date(),
      false,
      null,
    )).resolves.toEqual({ ok: false, reason: "unsupported" });
  });

  it("converts Web Lock request failures into a retryable write result", async () => {
    const failingLocks = {
      request: (() => Promise.reject(new DOMException("Denied", "SecurityError"))) as LockManager["request"],
    };

    await expect(mutateVault(
      memoryStorage(),
      () => [archiveFixtures[0]],
      new Date(),
      false,
      failingLocks,
    )).resolves.toEqual({ ok: false, reason: "write-error" });
  });

  it("reports storage write failures while leaving the caller in control", () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };

    expect(writeVault(storage, archiveFixtures, new Date())).toEqual({ ok: false });
  });
});
