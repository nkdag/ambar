import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AmbarApp } from "@/components/ambar-app";

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

    fireEvent.keyDown(window, { key: "s" });
    expect(screen.queryByRole("dialog", { name: "Quick save" })).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "s", altKey: true });
    expect(screen.getByRole("dialog", { name: "Quick save" })).toBeInTheDocument();
  });
});
