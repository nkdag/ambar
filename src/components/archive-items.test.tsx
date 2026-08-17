import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArchiveItems } from "@/components/archive-items";
import { archiveFixtures } from "@/data/fixtures";

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
        name: /current price \$132, down 20 percent/i,
      }),
    ).toBeInTheDocument();
  });
});
