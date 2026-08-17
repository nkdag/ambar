import {
  MAX_TARGET_PRICE_CENTS,
  safeWebUrl,
  type ArchiveItem,
  type ProductDetails,
} from "@/domain/archive";

export const AMBAR_VAULT_KEY = "ambar:vault";
export const AMBAR_VAULT_VERSION = 1 as const;
export const MAX_PRICE_HISTORY_POINTS = 366;

const SAFE_ITEM_ID = /^[A-Za-z0-9._:-]{1,128}$/;

interface VaultEnvelope {
  version: typeof AMBAR_VAULT_VERSION;
  updatedAt: string;
  items: ArchiveItem[];
}

export type VaultReadResult =
  | { status: "empty" }
  | { status: "ready"; items: ArchiveItem[]; updatedAt: string }
  | { status: "corrupt" }
  | { status: "unsupported" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalCentAmount(value: unknown, maximum = Number.MAX_SAFE_INTEGER) {
  return (
    value === undefined ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= 0 &&
      value <= maximum)
  );
}

function isProductDetails(value: unknown): value is ProductDetails {
  if (!isRecord(value)) return false;
  return (
    value.currency === "USD" &&
    typeof value.alertEnabled === "boolean" &&
    isOptionalCentAmount(value.currentPriceCents) &&
    isOptionalCentAmount(value.previousPriceCents) &&
    isOptionalCentAmount(value.targetPriceCents, MAX_TARGET_PRICE_CENTS) &&
    Array.isArray(value.priceHistoryCents) &&
    value.priceHistoryCents.length <= MAX_PRICE_HISTORY_POINTS &&
    value.priceHistoryCents.every((price) => isOptionalCentAmount(price) && price !== undefined)
  );
}

function isArchiveItem(value: unknown): value is ArchiveItem {
  if (!isRecord(value)) return false;
  if (
    typeof value.id !== "string" ||
    !SAFE_ITEM_ID.test(value.id) ||
    !["article", "product", "link"].includes(String(value.type)) ||
    typeof value.title !== "string" ||
    typeof value.url !== "string" ||
    safeWebUrl(value.url) === null ||
    typeof value.site !== "string" ||
    typeof value.collection !== "string" ||
    !Array.isArray(value.tags) ||
    !value.tags.every((tag) => typeof tag === "string") ||
    typeof value.note !== "string" ||
    typeof value.savedAt !== "string" ||
    Number.isNaN(Date.parse(value.savedAt)) ||
    !["ready", "processing", "error"].includes(String(value.status))
  ) {
    return false;
  }

  if (
    value.readProgress !== undefined &&
    (typeof value.readProgress !== "number" ||
      !Number.isFinite(value.readProgress) ||
      value.readProgress < 0 ||
      value.readProgress > 100)
  ) {
    return false;
  }

  if (
    value.accent !== undefined &&
    !["clay", "moss", "amber", "ink", "sand"].includes(String(value.accent))
  ) {
    return false;
  }

  if (value.type === "product") return isProductDetails(value.product);
  return value.product === undefined || isProductDetails(value.product);
}

function isArchiveItems(value: unknown): value is ArchiveItem[] {
  return (
    Array.isArray(value) &&
    value.every(isArchiveItem) &&
    new Set(value.map((item) => item.id)).size === value.length
  );
}

function isVaultEnvelope(value: unknown): value is VaultEnvelope {
  return (
    isRecord(value) &&
    value.version === AMBAR_VAULT_VERSION &&
    typeof value.updatedAt === "string" &&
    !Number.isNaN(Date.parse(value.updatedAt)) &&
    isArchiveItems(value.items)
  );
}

export function readVault(storage: Pick<Storage, "getItem">): VaultReadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(AMBAR_VAULT_KEY);
  } catch {
    return { status: "corrupt" };
  }
  if (raw === null) return { status: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: "corrupt" };
  }

  if (!isRecord(parsed) || parsed.version !== AMBAR_VAULT_VERSION) {
    return { status: "unsupported" };
  }
  if (!isVaultEnvelope(parsed)) return { status: "corrupt" };

  return {
    status: "ready",
    items: parsed.items,
    updatedAt: parsed.updatedAt,
  };
}

export function writeVault(
  storage: Pick<Storage, "setItem">,
  items: readonly ArchiveItem[],
  now = new Date(),
): { ok: true } | { ok: false } {
  const envelope: VaultEnvelope = {
    version: AMBAR_VAULT_VERSION,
    updatedAt: now.toISOString(),
    items: [...items],
  };

  try {
    storage.setItem(AMBAR_VAULT_KEY, JSON.stringify(envelope));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

type VaultMutationStorage = Pick<Storage, "getItem" | "setItem">;
type VaultLockManager = Pick<LockManager, "request">;

export type VaultMutationResult =
  | { ok: true; items: ArchiveItem[] }
  | { ok: false; reason: "busy" | "unsupported" | "corrupt" | "invalid" | "write-error" };

export async function mutateVault(
  storage: VaultMutationStorage,
  transform: (items: ArchiveItem[]) => ArchiveItem[],
  now = new Date(),
  allowRecovery = false,
  lockManager: VaultLockManager | null | undefined =
    typeof navigator === "undefined" ? undefined : navigator.locks,
): Promise<VaultMutationResult> {
  if (!lockManager) return { ok: false, reason: "unsupported" };

  try {
    return await lockManager.request(
      "ambar-local-vault-write",
      { mode: "exclusive", ifAvailable: true },
      (lock) => {
        if (!lock) return { ok: false, reason: "busy" } as const;

        const current = readVault(storage);
        if (
          (current.status === "corrupt" || current.status === "unsupported") &&
          !allowRecovery
        ) {
          return { ok: false, reason: "corrupt" } as const;
        }

        let next: ArchiveItem[];
        try {
          next = transform(current.status === "ready" ? [...current.items] : []);
        } catch {
          return { ok: false, reason: "invalid" } as const;
        }
        if (!isArchiveItems(next)) return { ok: false, reason: "invalid" } as const;

        const written = writeVault(storage, next, now);
        return written.ok
          ? { ok: true, items: next } as const
          : { ok: false, reason: "write-error" } as const;
      },
    );
  } catch {
    return { ok: false, reason: "write-error" };
  }
}
