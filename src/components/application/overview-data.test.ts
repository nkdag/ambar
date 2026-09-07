import { describe, expect, it } from "vitest";
import { archiveActivity, archiveOverview } from "./overview-data";
import { archiveFixtures } from "@/data/fixtures";

describe("Overview date projections", () => {
  it("buckets offset and non-ISO dates by UTC, and sorts instants rather than strings", () => {
    const older = { ...archiveFixtures[0], id: "older", savedAt: "2026-08-18T00:00:00Z" };
    const latest = { ...archiveFixtures[1], id: "latest", savedAt: "2026-08-17T23:30:00-06:00" };
    const middle = { ...archiveFixtures[2], id: "middle", savedAt: "Tue, 18 Aug 2026 01:00:00 GMT" };
    const items = [older, latest, middle];
    expect(archiveOverview(items).recent.map((item) => item.id)).toEqual(["latest", "middle", "older"]);
    expect(archiveActivity(items, 7).at(-1)).toMatchObject({ date: "2026-08-18", current: 3 });
  });
});
