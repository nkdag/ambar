import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArchiveItems } from "@/components/archive-items";
import { archiveFixtures } from "@/data/fixtures";
import type { ArchiveItem } from "@/domain/archive";

describe("ArchiveItems responsive table view", () => {
  it("renders a mobile list fallback alongside the desktop table", () => {
    render(
      <ArchiveItems
        items={archiveFixtures.slice(0, 2)}
        view="table"
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByRole("table", { name: "Compact archive table" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Saved items" })).toBeInTheDocument();
  });

  it("includes product price and direction in an archive row accessible name", () => {
    render(
      <ArchiveItems
        items={[archiveFixtures[0]]}
        view="list"
        onOpen={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /current price \$132.*down 20 percent/i,
      }),
    ).toBeInTheDocument();
  });
});

describe("ArchiveItems long-content resilience", () => {
  const longSingleWordTitle =
    "SupercalifragilisticexpialidociousAnthropomorphicExtraordinarilyLongSingleWordTitle";

  it.each(["list", "card", "gallery"] as const)(
    "keeps the full title text in the DOM for the %s view so CSS truncation never drops characters from the accessible name",
    (view) => {
      const item: ArchiveItem = {
        ...archiveFixtures[0],
        id: `long-${view}`,
        title: longSingleWordTitle,
      };

      render(<ArchiveItems items={[item]} view={view} onOpen={vi.fn()} />);

      const opener = screen.getByRole("button", {
        name: new RegExp(longSingleWordTitle, "i"),
      });
      expect(opener).toBeInTheDocument();
      expect(opener.textContent ?? "").toContain(longSingleWordTitle);
    },
  );

  it("renders the full title text in the mobile table fallback so compact views do not lose content", () => {
    const item: ArchiveItem = {
      ...archiveFixtures[0],
      id: "long-table",
      title: longSingleWordTitle,
    };

    const { container } = render(
      <ArchiveItems items={[item]} view="table" onOpen={vi.fn()} />,
    );

    const fallback = container.querySelector(".mobile-table-fallback");
    expect(fallback).not.toBeNull();
    expect(fallback?.textContent ?? "").toContain(longSingleWordTitle);
  });
});

describe("ArchiveItems decision-useful metadata", () => {
  it("labels table rows with the same accessible name as other views", () => {
    render(<ArchiveItems items={[archiveFixtures[0]]} view="table" onOpen={vi.fn()} />);
    const table = screen.getByRole("table", { name: "Compact archive table" });
    expect(
      within(table).getByRole("button", {
        name: /current price \$132.*down 20 percent/i,
      }),
    ).toBeInTheDocument();
  });

  it("states the price direction as text inside the table", () => {
    render(<ArchiveItems items={[archiveFixtures[0]]} view="table" onOpen={vi.fn()} />);
    const table = screen.getByRole("table", { name: "Compact archive table" });
    expect(within(table).getByText("down")).toBeInTheDocument();
  });

  it("shows the prior price next to the current price in list view", () => {
    render(<ArchiveItems items={[archiveFixtures[0]]} view="list" onOpen={vi.fn()} />);
    expect(screen.getByText(/was \$165/i)).toBeInTheDocument();
  });

  it("surfaces the product target status on cards", () => {
    render(<ArchiveItems items={[archiveFixtures[0]]} view="card" onOpen={vi.fn()} />);
    expect(screen.getByText("Target reached")).toBeInTheDocument();
  });

  it("shows reading progress as visible text on cards", () => {
    render(<ArchiveItems items={[archiveFixtures[1]]} view="card" onOpen={vi.fn()} />);
    expect(screen.getByText("32% read")).toBeInTheDocument();
  });

  it("adds the saved date to the meta line", () => {
    render(<ArchiveItems items={[archiveFixtures[0]]} view="list" onOpen={vi.fn()} />);
    expect(screen.getByText(/Saved Aug \d{1,2}/)).toBeInTheDocument();
  });

  it("formats saved dates in UTC so prerendered and hydrated metadata agree", () => {
    const item: ArchiveItem = {
      ...archiveFixtures[0],
      id: "utc-date",
      savedAt: "2026-08-17T00:30:00.000Z",
    };

    render(<ArchiveItems items={[item]} view="list" onOpen={vi.fn()} />);
    expect(screen.getByText("Saved Aug 17")).toBeInTheDocument();
  });

  it("includes the prior price, target status, and saved date in the opener name", () => {
    render(<ArchiveItems items={[archiveFixtures[0]]} view="card" onOpen={vi.fn()} />);

    expect(
      screen.getByRole("button", {
        name: /was \$165.*target reached.*saved Aug 17/i,
      }),
    ).toBeInTheDocument();
  });

  it("does not claim a targetless product alert is paused", () => {
    const item: ArchiveItem = {
      ...archiveFixtures[0],
      id: "targetless-product",
      product: {
        currency: "USD",
        alertEnabled: false,
        priceHistoryCents: [],
      },
    };

    render(<ArchiveItems items={[item]} view="card" onOpen={vi.fn()} />);
    expect(screen.queryByText("Alert paused")).not.toBeInTheDocument();
  });

  it("includes the price delta in gallery captions", () => {
    render(<ArchiveItems items={[archiveFixtures[0]]} view="gallery" onOpen={vi.fn()} />);
    expect(screen.getAllByText(/20%/).length).toBeGreaterThan(0);
  });

  it("includes reading progress in gallery captions", () => {
    render(<ArchiveItems items={[archiveFixtures[1]]} view="gallery" onOpen={vi.fn()} />);
    expect(screen.getByText(/32% read/)).toBeInTheDocument();
  });
});
