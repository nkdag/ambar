import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AmbarApp } from "./ambar-app";
import { writeVault } from "@/domain/vault";

beforeEach(() => localStorage.clear());

describe("BoardUI migration accessibility improvements", () => {
  it("exposes the library menu with import and Agent Access on compact layouts", async () => {
    render(<AmbarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Open library menu" }));
    const menu = await screen.findByRole("dialog", { name: "Library menu" });
    expect(within(menu).getByText("Collections")).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole("button", { name: "Import bookmarks" }));
    expect(await screen.findByRole("dialog", { name: "Chrome bookmark import preview" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Library menu" })).not.toBeInTheDocument();
  });

  it("offers quick save when a real personal vault is empty after reload", async () => {
    writeVault(localStorage, [], new Date("2026-09-06T12:00:00Z"));
    render(<AmbarApp />);
    expect(await screen.findByText("Nothing on this shelf yet")).toBeInTheDocument();
    expect(screen.queryByText(/switch the preview back/i)).not.toBeInTheDocument();
  });

  it("offers recovery when a selected bookmark file cannot be read", async () => {
    render(<AmbarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Import bookmarks" }));
    const input = screen.getByLabelText(/Select bookmark HTML/i);
    fireEvent.change(input, { target: { files: [{ size: 32, text: () => Promise.reject(new Error("Unreadable")) }] } });
    expect(await screen.findByText("This file could not be read. Choose another HTML file or use the safe demo export.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Select bookmark HTML/i)).toBeInTheDocument();
  });
});

// Preservation contracts for the replacement components, beyond the original suite.
describe("BoardUI controls preserve the core loop", () => {
  it("chooses a product, saves it, updates a target, and reloads its exact cents", async () => {
    const app = render(<AmbarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.change(screen.getByLabelText("Link"), { target: { value: "https://example.com/boardui-product" } });
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "Archive lamp" } });
    fireEvent.click(screen.getByRole("button", { name: "Kind" }));
    fireEvent.click(await screen.findByRole("option", { name: "Product" }));
    fireEvent.click(screen.getByRole("button", { name: "Save item" }));
    fireEvent.click(await screen.findByRole("button", { name: /Open Archive lamp/ }));
    fireEvent.click(screen.getByRole("tab", { name: "Price watch" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Target price in dollars" }), { target: { value: "12.50" } });
    fireEvent.click(screen.getByRole("switch", { name: /Price alert/ }));
    fireEvent.click(screen.getByRole("button", { name: "Update target" }));
    expect(await screen.findByText("Target updated")).toBeInTheDocument();
    app.unmount();
    render(<AmbarApp />);
    fireEvent.click(await screen.findByRole("button", { name: /Open Archive lamp/ }));
    fireEvent.click(screen.getByRole("tab", { name: "Price watch" }));
    expect(screen.getByRole("textbox", { name: "Target price in dollars" })).toHaveValue("12.50");
    expect(screen.getByRole("switch", { name: /Price alert/ })).toBeChecked();
  });

  it("keeps the import preview detached and leaves the example vault unsaved", async () => {
    render(<AmbarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Import bookmarks" }));
    fireEvent.click(screen.getByRole("button", { name: "Use safe demo export" }));
    expect(await screen.findByText(/safe bookmarks ready to review/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Done reviewing" }));
    expect(localStorage.getItem("ambar:vault")).toBeNull();
  });
});

describe("Search dismissal without a keyboard", () => {
  it("provides a named close button that dismisses search", () => {
    render(<AmbarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Search the archive" }));
    fireEvent.click(screen.getByRole("button", { name: "Close search" }));
    expect(screen.queryByRole("dialog", { name: "Search and filter archive" })).not.toBeInTheDocument();
  });
});

describe("Showcase state previews", () => {
  it.each([
    ["Loading preview", "Sorting the local index…"],
    ["Empty preview", "Nothing on this shelf yet"],
    ["Error preview", "Index unavailable"],
    ["Offline preview", "Showing the last four locally cached items."],
  ])("keeps %s available through the secondary disclosure", async (option, copy) => {
    render(<AmbarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Browse library" }));
    fireEvent.click(screen.getByText("Demo states"));
    fireEvent.click(screen.getByRole("button", { name: "Preview state" }));
    fireEvent.click(await screen.findByRole("option", { name: option }));
    expect(await screen.findByText(copy)).toBeInTheDocument();
  });
});
