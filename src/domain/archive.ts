export type ItemType = "article" | "product" | "link";
export type ItemStatus = "ready" | "processing" | "error";
export type ArchiveSection = "inbox" | "products" | "reading";

export interface ProductDetails {
  currentPriceCents?: number;
  previousPriceCents?: number;
  currency: "USD";
  targetPriceCents?: number;
  alertEnabled: boolean;
  priceHistoryCents: number[];
}

export interface ArchiveItem {
  id: string;
  type: ItemType;
  title: string;
  url: string;
  site: string;
  collection: string;
  tags: string[];
  note: string;
  savedAt: string;
  status: ItemStatus;
  readProgress?: number;
  product?: ProductDetails;
  accent?: "clay" | "moss" | "amber" | "ink" | "sand";
}

export interface ArchiveFilter {
  query?: string;
  section?: ArchiveSection;
  tags?: string[];
}

export interface QuickSaveInput {
  url: string;
  title?: string;
  type: ItemType;
  note?: string;
}

export interface QuickSaveContext {
  id: string;
  now: Date;
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

export function safeWebUrl(value: string): URL | null {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function belongsToSection(item: ArchiveItem, section?: ArchiveSection) {
  if (!section || section === "inbox") return true;
  if (section === "products") return item.type === "product";
  return item.type === "article";
}

export function filterArchiveItems(
  items: readonly ArchiveItem[],
  filter: ArchiveFilter,
): ArchiveItem[] {
  const query = normalize(filter.query ?? "");
  const selectedTags = (filter.tags ?? []).map(normalize);

  return items.filter((item) => {
    if (!belongsToSection(item, filter.section)) return false;

    if (
      selectedTags.length > 0 &&
      !selectedTags.every((selected) =>
        item.tags.some((tag) => normalize(tag) === selected),
      )
    ) {
      return false;
    }

    if (!query) return true;

    const index = [
      item.title,
      item.site,
      item.collection,
      item.note,
      ...item.tags,
    ]
      .map(normalize)
      .join("\n");

    return query
      .split(/\s+/)
      .filter(Boolean)
      .every((term) => index.includes(term));
  });
}

export function createQuickSaveItem(
  input: QuickSaveInput,
  context: QuickSaveContext,
): ArchiveItem {
  const parsedUrl = safeWebUrl(input.url);
  if (!parsedUrl) throw new Error("Enter a valid http or https URL");

  const hostname = parsedUrl.hostname.replace(/^www\./, "");
  const fallbackTitle = hostname
    .split(".")[0]
    .replace(/[-_]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());

  const item: ArchiveItem = {
    id: context.id,
    type: input.type,
    title: input.title?.trim() || fallbackTitle,
    url: parsedUrl.toString(),
    site: hostname,
    collection: "Inbox",
    tags: input.type === "product" ? ["new product"] : ["new save"],
    note: input.note?.trim() ?? "",
    savedAt: context.now.toISOString(),
    status: "ready",
    accent: "amber",
  };

  if (input.type === "product") {
    item.product = {
      currency: "USD",
      alertEnabled: false,
      priceHistoryCents: [],
    };
  }

  return item;
}

export function formatTargetInput(cents?: number) {
  return cents === undefined ? "" : (cents / 100).toFixed(2);
}

export function parseTargetInput(value: string) {
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Enter a valid target price");
  }
  return Math.round(Number(normalized) * 100);
}

export function updateProductTarget(
  items: readonly ArchiveItem[],
  itemId: string,
  targetPriceCents: number | undefined,
  alertEnabled: boolean,
): ArchiveItem[] {
  if (
    targetPriceCents !== undefined &&
    (!Number.isInteger(targetPriceCents) || targetPriceCents < 0)
  ) {
    throw new Error("Target price must be a positive cent amount");
  }

  return items.map((item) => {
    if (item.id !== itemId || !item.product) return item;
    return {
      ...item,
      product: {
        ...item.product,
        targetPriceCents,
        alertEnabled,
      },
    };
  });
}

export function formatPrice(cents?: number, currency = "USD") {
  if (cents === undefined) return "Price pending";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function priceDeltaPercent(product: ProductDetails) {
  if (
    product.currentPriceCents === undefined ||
    product.previousPriceCents === undefined ||
    product.previousPriceCents === 0
  ) {
    return undefined;
  }
  return (
    ((product.currentPriceCents - product.previousPriceCents) /
      product.previousPriceCents) *
    100
  );
}
