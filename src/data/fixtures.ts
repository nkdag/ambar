import type { ArchiveItem } from "@/domain/archive";

export const archiveFixtures: ArchiveItem[] = [
  {
    id: "arc-001",
    type: "product",
    title: "Pour-over kettle, matte black",
    url: "https://field-supply.example/kitchen/pour-over-kettle",
    site: "Field Supply",
    collection: "Kitchen upgrades",
    tags: ["coffee", "considering"],
    note: "The narrow spout felt balanced in the shop. Wait for the price to settle below $140.",
    savedAt: "2026-08-17T14:20:00.000Z",
    status: "ready",
    accent: "ink",
    product: {
      currentPriceCents: 13200,
      previousPriceCents: 16500,
      targetPriceCents: 14000,
      currency: "USD",
      alertEnabled: true,
      priceHistoryCents: [
        16500, 16500, 15800, 15800, 14900, 15100, 14500, 14500, 13900,
        13900, 13600, 13200,
      ],
    },
  },
  {
    id: "arc-002",
    type: "article",
    title: "Why every workshop needs a parts library",
    url: "https://form-and-function.example/notes/parts-library",
    site: "Form & Function",
    collection: "Reading desk",
    tags: ["workshop", "systems"],
    note: "A useful model for storing components by possibility, not project.",
    savedAt: "2026-08-17T12:10:00.000Z",
    status: "ready",
    readProgress: 32,
    accent: "moss",
  },
  {
    id: "arc-003",
    type: "link",
    title: "Colorado repair café calendar",
    url: "https://community-calendar.example/repair-cafes",
    site: "Community Calendar",
    collection: "Denver weekends",
    tags: ["local", "repair"],
    note: "Next open bench is the first Saturday of September.",
    savedAt: "2026-08-16T22:40:00.000Z",
    status: "ready",
    accent: "clay",
  },
  {
    id: "arc-004",
    type: "product",
    title: "Foldable steel storage crate",
    url: "https://workroom-goods.example/storage/steel-crate",
    site: "Workroom Goods",
    collection: "Workshop shelf",
    tags: ["storage", "studio"],
    note: "Two fit beneath the long bench; charcoal finish hides wear.",
    savedAt: "2026-08-15T19:35:00.000Z",
    status: "ready",
    accent: "amber",
    product: {
      currentPriceCents: 2800,
      previousPriceCents: 3500,
      targetPriceCents: 2500,
      currency: "USD",
      alertEnabled: true,
      priceHistoryCents: [
        3500, 3500, 3400, 3400, 3200, 3200, 3200, 3000, 3000, 2800,
      ],
    },
  },
  {
    id: "arc-005",
    type: "article",
    title: "A field guide to noticing ordinary buildings",
    url: "https://the-gentle-reader.example/field-notes/ordinary-buildings",
    site: "The Gentle Reader",
    collection: "Slow reading",
    tags: ["architecture", "observation"],
    note: "Read again before the next neighborhood walk; save the window taxonomy.",
    savedAt: "2026-08-14T16:05:00.000Z",
    status: "ready",
    readProgress: 76,
    accent: "sand",
  },
  {
    id: "arc-006",
    type: "product",
    title: "Brass mechanical pencil, 0.5 mm",
    url: "https://paper-and-tool.example/writing/brass-pencil",
    site: "Paper & Tool",
    collection: "Desk tools",
    tags: ["stationery", "daily carry"],
    note: "Solid brass body, replaceable mechanism. Compare weight with the aluminum model.",
    savedAt: "2026-08-13T21:00:00.000Z",
    status: "ready",
    accent: "clay",
    product: {
      currentPriceCents: 4200,
      previousPriceCents: 4200,
      targetPriceCents: 3600,
      currency: "USD",
      alertEnabled: false,
      priceHistoryCents: [4200, 4200, 4200, 4400, 4400, 4200, 4200, 4200],
    },
  },
  {
    id: "arc-007",
    type: "article",
    title: "The useful life of a handwritten index",
    url: "https://commonplace-review.example/archive/handwritten-index",
    site: "Commonplace Review",
    collection: "Archive practice",
    tags: ["archives", "notes"],
    note: "Strong case for small, maintained indexes over exhaustive catalogues.",
    savedAt: "2026-08-12T17:15:00.000Z",
    status: "ready",
    readProgress: 100,
    accent: "amber",
  },
  {
    id: "arc-008",
    type: "link",
    title: "Oak peg rail dimensions",
    url: "https://maker-notes.example/plans/oak-peg-rail",
    site: "Maker Notes",
    collection: "Weekend builds",
    tags: ["woodwork", "plans"],
    note: "Scale the six-peg version down to 34 inches for the entry wall.",
    savedAt: "2026-08-10T20:25:00.000Z",
    status: "processing",
    accent: "moss",
  },
  {
    id: "arc-009",
    type: "product",
    title: "Linen-bound A5 project book",
    url: "https://paper-and-tool.example/notebooks/linen-project-book",
    site: "Paper & Tool",
    collection: "Desk tools",
    tags: ["notebook", "paper"],
    note: "Numbered pages and lay-flat binding; intended for the studio inventory.",
    savedAt: "2026-08-09T14:50:00.000Z",
    status: "ready",
    accent: "sand",
    product: {
      currentPriceCents: 2400,
      previousPriceCents: 2100,
      targetPriceCents: 2100,
      currency: "USD",
      alertEnabled: true,
      priceHistoryCents: [2100, 2100, 2100, 2200, 2200, 2400, 2400, 2400],
    },
  },
];

export const demoChromeExport = String.raw`<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  <DT><H3 ADD_DATE="1786896000">Weekend projects</H3>
  <DL><p>
    <DT><A HREF="https://maker-notes.example/plans/map-cabinet" ADD_DATE="1786896000">A compact map cabinet plan</A>
    <DT><A HREF="https://form-and-function.example/notes/tool-wall" ADD_DATE="1786809600">Building a tool wall that can change</A>
    <DT><A HREF="javascript:alert('unsafe')" ONCLICK="alert('unsafe')">Unsafe bookmark</A>
  </DL><p>
  <DT><H3>Long reads</H3>
  <DL><p>
    <DT><A HREF="https://commonplace-review.example/archive/repair-culture">The quiet return of repair culture</A>
  </DL><p>
</DL><p>`;

export const collectionNames = [
  "Reading desk",
  "Workshop shelf",
  "Desk tools",
  "Archive practice",
  "Weekend builds",
];
