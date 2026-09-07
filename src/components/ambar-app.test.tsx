import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AmbarApp } from "@/components/ambar-app";
import { archiveFixtures } from "@/data/fixtures";
import { readVault, writeVault } from "@/domain/vault";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AmbarApp overlay accessibility", () => {
  it("makes the application underlay inert while a modal is open", () => {
    const { container } = render(<AmbarApp />);

    fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);

    expect(screen.getByRole("dialog", { name: "Quick save" })).toBeInTheDocument();
    expect(container.querySelector(".app-underlay")).toHaveAttribute("inert");
    expect(container.querySelector(".app-underlay")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("requires Alt+S instead of an unmodified single-key shortcut", () => {
    render(<AmbarApp />);

    fireEvent.keyDown(window, { key: "s", code: "KeyS" });
    expect(screen.queryByRole("dialog", { name: "Quick save" })).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ß", code: "KeyS", altKey: true });
    expect(screen.getByRole("dialog", { name: "Quick save" })).toBeInTheDocument();
  });
});

describe("AmbarApp mobile header accessibility", () => {
  it("exposes an explicit aria-label on the header search trigger so it stays named when its visible label is hidden below 760px", () => {
    render(<AmbarApp />);

    const trigger = screen.getByRole("button", { name: /search the archive/i });
    expect(trigger).toHaveAttribute("aria-label", "Search the archive");
  });

  it("exposes an explicit aria-label on the header save button so it stays named when its visible label is hidden below 760px", () => {
    render(<AmbarApp />);

    const headerSave = screen.getByRole("button", { name: "Save" });
    expect(headerSave).toHaveAttribute("aria-label", "Save");
  });
});

describe("AmbarApp launch information", () => {
  it("links to privacy and terms from the application navigation", () => {
    render(<AmbarApp />);

    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
  });
});

describe("AmbarApp local vault", () => {
  it("loads a validated local vault after the deterministic first render", async () => {
    const storedItem = {
      ...archiveFixtures[0],
      id: "stored-item",
      title: "A genuinely persistent archive record",
    };
    writeVault(localStorage, [storedItem], new Date("2026-08-17T20:00:00.000Z"));

    render(<AmbarApp />);

    expect(
      await screen.findByRole("button", { name: /^Open A genuinely persistent archive record/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(archiveFixtures[1].title)).not.toBeInTheDocument();
  });

  it("keeps the fixture library as an unsaved example until the first personal save", async () => {
    render(<AmbarApp />);

    expect(await screen.findByText(/example vault · not saved/i)).toBeInTheDocument();
    expect(screen.getByTestId("responsive-vault-status")).toHaveTextContent(/example only · not saved · no cloud sync/i);
    expect(readVault(localStorage)).toEqual({ status: "empty" });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.change(screen.getByLabelText("Link"), {
      target: { value: "https://example.com/persistent-note" },
    });
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: "Persistent workshop note" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save item/i }));

    await waitFor(() => {
      const vault = readVault(localStorage);
      expect(vault.status).toBe("ready");
      if (vault.status === "ready") {
        expect(vault.items.map((item) => item.title)).toEqual(["Persistent workshop note"]);
        expect(vault.items[0].id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
      }
    });
  });

  it("disables quick save while an atomic vault mutation is pending", async () => {
    render(<AmbarApp />);
    await screen.findByText(/example vault · not saved/i);
    let release: (() => void) | undefined;
    const lockRequest = vi.spyOn(navigator.locks, "request").mockImplementation((
      (...args: unknown[]) => new Promise<unknown>((resolve) => {
        const callback = args.at(-1) as (lock: Lock | null) => unknown;
        release = () => resolve(callback({} as Lock));
      })
    ) as LockManager["request"]);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.change(screen.getByLabelText("Link"), {
      target: { value: "https://example.com/serialized-save" },
    });
    const submit = screen.getByRole("button", { name: /save item/i });
    fireEvent.click(submit);

    const saving = await screen.findByRole("button", { name: /saving/i });
    expect(saving).toBeDisabled();
    fireEvent.click(saving);
    expect(lockRequest).toHaveBeenCalledTimes(1);

    release?.();
    await waitFor(() => expect(readVault(localStorage).status).toBe("ready"));
  });

  it("retries a Web-Lock-blocked save by rebasing the pending mutation", async () => {
    render(<AmbarApp />);
    await screen.findByText(/example vault · not saved/i);
    const lockRequest = vi.spyOn(navigator.locks, "request").mockImplementation((
      (...args: unknown[]) => {
        const callback = args.at(-1) as (lock: Lock | null) => unknown;
        return Promise.resolve(callback(null));
      }
    ) as LockManager["request"]);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.change(screen.getByLabelText("Link"), {
      target: { value: "https://example.com/retry-note" },
    });
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: "Lease-safe retry note" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save item/i }));

    expect(await screen.findByText(/local save failed/i)).toBeInTheDocument();
    expect(readVault(localStorage)).toEqual({ status: "empty" });

    writeVault(localStorage, [archiveFixtures[0]], new Date("2026-08-17T20:05:00.000Z"));
    window.dispatchEvent(new StorageEvent("storage", { key: "ambar:vault" }));
    expect(screen.getByRole("button", { name: /retry local save/i })).toBeInTheDocument();

    lockRequest.mockImplementation((
      (...args: unknown[]) => {
        const callback = args.at(-1) as (lock: Lock | null) => unknown;
        return Promise.resolve(callback({} as Lock));
      }
    ) as LockManager["request"]);
    fireEvent.click(screen.getByRole("button", { name: /retry local save/i }));

    await waitFor(() => {
      const vault = readVault(localStorage);
      expect(vault.status).toBe("ready");
      if (vault.status === "ready") {
        expect(vault.items.map((item) => item.title)).toEqual([
          "Lease-safe retry note",
          archiveFixtures[0].title,
        ]);
      }
    });
  });

  it("preserves a pending save through a corrupt cross-tab storage event and explicit recovery", async () => {
    render(<AmbarApp />);
    await screen.findByText(/example vault · not saved/i);
    const lockRequest = vi.spyOn(navigator.locks, "request").mockImplementation((
      (...args: unknown[]) => {
        const callback = args.at(-1) as (lock: Lock | null) => unknown;
        return Promise.resolve(callback(null));
      }
    ) as LockManager["request"]);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.change(screen.getByLabelText("Link"), {
      target: { value: "https://example.com/pending-recovery" },
    });
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: "Pending recovery note" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save item/i }));
    expect(await screen.findByText(/local save failed/i)).toBeInTheDocument();

    localStorage.setItem("ambar:vault", "{broken-json");
    window.dispatchEvent(new StorageEvent("storage", { key: "ambar:vault" }));
    expect(await screen.findByRole("button", { name: /start a fresh local vault/i })).toBeInTheDocument();

    lockRequest.mockImplementation((
      (...args: unknown[]) => {
        const callback = args.at(-1) as (lock: Lock | null) => unknown;
        return Promise.resolve(callback({} as Lock));
      }
    ) as LockManager["request"]);
    fireEvent.click(screen.getByRole("button", { name: /start a fresh local vault/i }));

    await waitFor(() => {
      const vault = readVault(localStorage);
      expect(vault.status).toBe("ready");
      if (vault.status === "ready") {
        expect(vault.items.map((item) => item.title)).toEqual(["Pending recovery note"]);
      }
    });
  });

  it("recovers corrupt storage into an explicit empty personal vault", async () => {
    localStorage.setItem("ambar:vault", "{broken-json");
    render(<AmbarApp />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/local vault needs recovery/i);
    fireEvent.click(screen.getByRole("button", { name: /start a fresh local vault/i }));

    expect(await screen.findByText(/nothing on this shelf yet/i)).toBeInTheDocument();
    await waitFor(() => {
      const vault = readVault(localStorage);
      expect(vault.status).toBe("ready");
      if (vault.status === "ready") expect(vault.items).toEqual([]);
    });
  });

  it("does not add a second item for the same normalized URL", async () => {
    writeVault(localStorage, [archiveFixtures[0]], new Date("2026-08-17T20:00:00.000Z"));
    render(<AmbarApp />);
    await screen.findByRole("button", { name: /^Open Pour-over kettle/i });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.change(screen.getByLabelText("Link"), {
      target: { value: `${archiveFixtures[0].url}?utm_source=test#details` },
    });
    fireEvent.click(screen.getByRole("button", { name: /save item/i }));

    expect(await screen.findByText(/already in your vault/i)).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /quick save/i })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /details for pour-over kettle/i })).toBeInTheDocument();
    const vault = readVault(localStorage);
    expect(vault.status).toBe("ready");
    if (vault.status === "ready") expect(vault.items).toHaveLength(1);
  });
});

describe("SearchDialog keyboard navigation", () => {
  it("moves an active search result with ArrowDown/ArrowUp and opens it with Enter", async () => {
    render(<AmbarApp />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await screen.findByRole("dialog", { name: "Search and filter archive" });

    const combobox = screen.getByRole("combobox", { name: "Search archive" });
    const listbox = screen.getByRole("listbox", { name: /search results/i });
    const options = within(listbox).getAllByRole("option");
    expect(options.length).toBeGreaterThanOrEqual(3);

    const [first, second, third] = options;
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(combobox).toHaveAttribute("aria-activedescendant", first.id);

    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(combobox).toHaveAttribute("aria-activedescendant", second.id);

    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(third).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(combobox, { key: "ArrowUp" });
    expect(second).toHaveAttribute("aria-selected", "true");

    const activeTitle = within(second).getByText(/\S/, { selector: "strong" }).textContent ?? "";
    fireEvent.keyDown(combobox, { key: "Enter" });

    expect(screen.queryByRole("dialog", { name: "Search and filter archive" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: `Details for ${activeTitle}` })).toBeInTheDocument();
  });
});
