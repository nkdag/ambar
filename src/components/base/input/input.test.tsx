import { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Input } from "./input";

it("keeps the visible focus ring when a user returns to an invalid field", () => {
  const shell = createRef<HTMLDivElement>();
  render(<Input label="Target amount" isInvalid groupRef={shell} />);
  const field = screen.getByRole("textbox", { name: "Target amount" });
  expect(field).toHaveAttribute("aria-invalid", "true");
  act(() => field.focus());
  expect(shell.current).toHaveClass("ring-border-focus-ring");
});
