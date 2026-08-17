import { describe, expect, it } from "vitest";
import {
  createQuickSaveItem,
  filterArchiveItems,
  formatTargetInput,
  parseTargetInput,
  updateProductTarget,
  type ArchiveItem,
} from "./archive";

const items: ArchiveItem[] = [
  {
    id: "item-1",
    type: "article",
    title: "The craft of a good field note",
    url: "https://lithub.com/field-note",
    site: "Literary Hub",
    collection: "Reading desk",
    tags: ["craft", "notes"],
    note: "Return to the passage about observing ordinary details.",
    savedAt: "2026-08-14T15:00:00.000Z",
    status: "ready",
  },
  {
    id: "item-2",
    type: "product",
    title: "Bankers Box steel file case",
    url: "https://example.com/file-case",
    site: "Foundry Supply",
    collection: "Workshop shelf",
    tags: ["storage", "studio"],
    note: "Check dimensions against the lower cabinet.",
    savedAt: "2026-08-12T18:30:00.000Z",
    status: "ready",
    product: {
      currentPriceCents: 12900,
      previousPriceCents: 14900,
      currency: "USD",
      targetPriceCents: 11900,
      alertEnabled: true,
      priceHistoryCents: [14900, 14500, 14500, 13900, 13500, 12900],
    },
  },
];

describe("filterArchiveItems", () => {
  it.each([
    ["field note", "item-1"],
    ["Literary Hub", "item-1"],
    ["studio", "item-2"],
    ["Workshop shelf", "item-2"],
    ["lower cabinet", "item-2"],
  ])("matches %s across the archive index", (query, id) => {
    expect(filterArchiveItems(items, { query }).map((item) => item.id)).toEqual([
      id,
    ]);
  });

  it("combines section and tag filters without mutating the source", () => {
    const before = structuredClone(items);
    const result = filterArchiveItems(items, {
      section: "products",
      tags: ["storage"],
    });

    expect(result.map((item) => item.id)).toEqual(["item-2"]);
    expect(items).toEqual(before);
  });
});

describe("createQuickSaveItem", () => {
  it("creates a deterministic inbox item from a valid URL", () => {
    const item = createQuickSaveItem(
      {
        url: "https://www.muji.us/products/aluminum-round-pen-holder",
        title: "Aluminum round pen holder",
        type: "product",
        note: "For the drawing table.",
      },
      {
        id: "item-new",
        now: new Date("2026-08-17T16:00:00.000Z"),
      },
    );

    expect(item).toMatchObject({
      id: "item-new",
      title: "Aluminum round pen holder",
      site: "muji.us",
      collection: "Inbox",
      savedAt: "2026-08-17T16:00:00.000Z",
      status: "ready",
      type: "product",
    });
    expect(item.product?.priceHistoryCents).toEqual([]);
  });

  it("rejects non-web protocols", () => {
    expect(() =>
      createQuickSaveItem(
        { url: "javascript:alert(1)", type: "article" },
        { id: "unsafe", now: new Date("2026-08-17T16:00:00.000Z") },
      ),
    ).toThrow("Enter a valid http or https URL");
  });
});

describe("target price input", () => {
  it("round-trips cent values without losing fractional dollars", () => {
    expect(formatTargetInput(1250)).toBe("12.50");
    expect(parseTargetInput("12.50")).toBe(1250);
  });

  it("allows an empty target and rejects malformed or negative values", () => {
    expect(parseTargetInput("  ")).toBeUndefined();
    expect(() => parseTargetInput("12 dollars")).toThrow("Enter a valid target price");
    expect(() => parseTargetInput("-1")).toThrow("Enter a valid target price");
  });
});

describe("updateProductTarget", () => {
  it("immutably updates the target and alert state immediately", () => {
    const next = updateProductTarget(items, "item-2", 12500, false);

    expect(next).not.toBe(items);
    expect(next[1]).not.toBe(items[1]);
    expect(next[1].product).toMatchObject({
      targetPriceCents: 12500,
      alertEnabled: false,
    });
    expect(items[1].product?.targetPriceCents).toBe(11900);
  });

  it("leaves unrelated items referentially stable", () => {
    const next = updateProductTarget(items, "item-2", 12000, true);
    expect(next[0]).toBe(items[0]);
  });
});
