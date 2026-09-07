import type { ArchiveItem } from "@/domain/archive";

/** Display projections only. Observations have no dates; saves use UTC dates. */
export function archiveOverview(items: readonly ArchiveItem[]) {
  const products = items.filter((item) => item.type === "product");
  const reading = items.filter((item) => item.type === "article");
  const collections = [...new Set(items.map((item) => item.collection))].map((name) => ({
    name,
    count: items.filter((item) => item.collection === name).length,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const watched = products.filter((item) => item.product?.alertEnabled);
  const reached = watched.filter(({ product }) => product?.currentPriceCents !== undefined && product.targetPriceCents !== undefined && product.currentPriceCents <= product.targetPriceCents);
  return {
    products, reading, collections, watched, reached,
    queue: reading.filter((item) => (item.readProgress ?? 0) < 100),
    complete: reading.filter((item) => item.readProgress === 100).length,
    recent: [...items].sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt)),
    priced: products.filter((item) => item.product?.priceHistoryCents.length),
  };
}

export function archiveActivity(items: readonly ArchiveItem[], days: number) {
  if (!items.length) return [];
  const last = new Date(Math.max(...items.map((item) => Date.parse(item.savedAt))));
  const end = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end - (days - 1 - index) * 86400000);
    const day = date.toISOString().slice(0, 10);
    return {
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      date: day,
      current: items.filter((item) => new Date(item.savedAt).toISOString().slice(0, 10) === day).length,
    };
  });
}
