import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AmbarApp } from "./ambar-app";
import { archiveFixtures } from "@/data/fixtures";
import { writeVault } from "@/domain/vault";

beforeEach(() => localStorage.clear());

describe("Control Room overview", () => {
  it("lands on Overview with fixture-derived stats and a persistent mobile destination", () => {
    render(<AmbarApp />);
    expect(screen.getByRole("heading", { name: "Your library, in view." })).toBeInTheDocument();
    const stats = screen.getByRole("region", { name: "Library at a glance" });
    expect(stats).toHaveTextContent("Saved items9");
    expect(stats).toHaveTextContent("Collections8");
    expect(stats).toHaveTextContent("Reading queue2");
    expect(stats).toHaveTextContent("Price watch3");
    expect(within(screen.getByRole("navigation", { name: "Mobile navigation" })).getByRole("button", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    expect(localStorage.getItem("ambar:vault")).toBeNull();
  });

  it("navigates to the library and back, and filters a real collection", () => {
    render(<AmbarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Browse library" }));
    expect(screen.getByRole("radio", { name: "List view" })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("navigation", { name: "Archive sections" })).getByRole("button", { name: "Overview" }));
    fireEvent.click(screen.getByRole("button", { name: "Browse collection Desk tools" }));
    expect(screen.getByRole("heading", { name: "Desk tools" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open Brass mechanical pencil/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Open Pour-over kettle/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear collection filter" }));
    expect(screen.getByRole("button", { name: /Open Pour-over kettle/ })).toBeInTheDocument();
  });

  it("switches actual price histories and exposes keyboard-readable observations", async () => {
    render(<AmbarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Price history product" }));
    fireEvent.click(await screen.findByRole("option", { name: "Foldable steel storage crate" }));
    expect(screen.getByRole("img", { name: /Foldable steel storage crate price history/ })).toHaveAccessibleName(/10 observations/);
    fireEvent.change(screen.getByRole("slider", { name: "Price observation" }), { target: { value: "0" } });
    expect(screen.getByRole("status", { name: "Selected price observation" })).toHaveTextContent("Observation 1 of 10: $35");
    fireEvent.click(screen.getByText("View price data"));
    expect(screen.getByRole("table", { name: "Price history observations" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open watched product" }));
    expect(screen.getByRole("dialog", { name: "Details for Foldable steel storage crate" })).toBeInTheDocument();
  });

  it("maps price-chart pointer selection within the plotted area rather than the full SVG", async () => {
    render(<AmbarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Price history product" }));
    fireEvent.click(await screen.findByRole("option", { name: "Foldable steel storage crate" }));

    const chart = screen.getByRole("img", { name: /Foldable steel storage crate price history/ });
    const svg = chart.querySelector("svg");
    expect(svg).not.toBeNull();
    vi.spyOn(svg!, "getBoundingClientRect").mockReturnValue({
      left: 100,
      right: 700,
      top: 0,
      bottom: 192,
      width: 600,
      height: 192,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerMove(svg!, { clientX: 152 });
    expect(screen.getByRole("status", { name: "Selected price observation" })).toHaveTextContent("Observation 1 of 10: $35");
  });

  it("changes activity range using dates from the archive and opens a reading item", () => {
    render(<AmbarApp />);
    const activity = screen.getByRole("region", { name: "Archive activity" });
    expect(activity).toHaveTextContent("9 saves");
    fireEvent.click(screen.getByRole("radio", { name: "7 days" }));
    expect(activity).toHaveTextContent("7 saves");
    fireEvent.click(screen.getByRole("button", { name: /Continue reading Why every workshop/ }));
    expect(screen.getByRole("dialog", { name: /Details for Why every workshop/ })).toBeInTheDocument();
  });

  it("uses a personal vault without leaking example statistics or histories", () => {
    writeVault(localStorage, [{ ...archiveFixtures[2], id: "only", collection: "Personal" }], new Date());
    render(<AmbarApp />);
    expect(screen.getByRole("region", { name: "Library at a glance" })).toHaveTextContent("Saved items1");
    expect(screen.getByText("No price history yet")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /kettle price history/ })).not.toBeInTheDocument();
    expect(screen.getByText("Your reading queue is clear")).toBeInTheDocument();
  });

  it("does not invent a percentage change from a zero price baseline", () => {
    writeVault(localStorage, [{ ...archiveFixtures[0], product: { ...archiveFixtures[0].product!, priceHistoryCents: [0, 100] } }], new Date());
    render(<AmbarApp />);
    expect(screen.getByText("From $0")).toBeInTheDocument();
  });
});
