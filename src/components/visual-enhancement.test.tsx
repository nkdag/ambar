import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnimatedNumber } from "./base/animated-number/animated-number";
import { Spotlight } from "./base/spotlight/spotlight";
import { VisualTransition } from "./application/visual-transition";
import { OverviewHero } from "./application/overview-hero";

const animation = vi.hoisted(() => ({ animate: vi.fn(() => ({ stop: vi.fn() })) }));
vi.mock("motion/react-mini", async () => {
  const React = await import("react");
  return { useAnimate: () => [React.useRef(null), animation.animate] };
});

function media(reduced: boolean, fine = true) {
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() { return query.includes("reduced-motion") ? reduced : fine; },
    media: query,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }));
  return (next: boolean) => act(() => { reduced = next; listeners.forEach((listener) => listener()); });
}
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("Visual enhancement contracts", () => {
  it("renders deterministic final numeric content on the server", () => {
    const markup = renderToString(<AnimatedNumber value={1234} />);
    expect(markup).toContain("1,234");
    expect(markup).not.toContain("NaN");
  });
  it("updates numbers immediately with reduced motion, including preference changes", () => {
    const changeMotion = media(true);
    const { container, rerender } = render(<AnimatedNumber value={9} />);
    rerender(<AnimatedNumber value={12} />);
    expect(container.textContent).toBe("12");
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    changeMotion(false);
    rerender(<AnimatedNumber value={31} />);
    expect(container.querySelector(".sr-only")).toHaveTextContent("31");
    changeMotion(true);
    expect(container.textContent).toBe("31");
  });
  it("keeps the accessible number final while only the decorative copy tweens", () => {
    media(false);
    const { container, rerender } = render(<AnimatedNumber value={9} />);
    rerender(<AnimatedNumber value={12} />);
    expect(container.querySelector(".sr-only")).toHaveTextContent("12");
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });
  it("starts a numeric update from the previous visual value without flashing the destination", () => {
    media(false);
    const { container, rerender } = render(<AnimatedNumber value={9} />);
    rerender(<AnimatedNumber value={120} />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("9");
    expect(container.querySelector(".sr-only")).toHaveTextContent("120");
  });
  it("enables noninteractive pointer light only for a fine pointer with motion allowed", () => {
    media(false);
    const { container, unmount } = render(<section><Spotlight /><button>Action</button></section>);
    const light = container.querySelector('[data-spotlight]');
    expect(light).toHaveAttribute("aria-hidden", "true");
    expect(light).not.toHaveAttribute("tabindex");
    fireEvent.pointerMove(container.firstElementChild!, { clientX: 80, clientY: 60, pointerType: "mouse" });
    expect(screen.getByRole("button", { name: "Action" })).toBeEnabled();
    unmount();
    media(false, false);
    const touch = render(<section><Spotlight /></section>);
    expect(touch.container.querySelector('[data-spotlight]')).toBeNull();
    touch.unmount();
    media(true);
    expect(render(<Spotlight />).container).toBeEmptyDOMElement();
  });
  it("keeps hero decoration hidden from assistive tech and navigation reachable without canvas", () => {
    media(true);
    const onBrowse = vi.fn();
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { container } = render(<OverviewHero onBrowse={onBrowse} />);
    expect(screen.getByRole("heading", { name: "Your library, in view." })).toBeVisible();
    expect(container.querySelector('[data-hero-art]')).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("canvas, iframe, a[href]" )).toBeNull();
    expect(getContext).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Browse library" }));
    expect(onBrowse).toHaveBeenCalledOnce();
    getContext.mockRestore();
  });
  it("animates view changes without remounting or stealing focus; reduced motion skips animation", () => {
    media(false);
    const { rerender } = render(<VisualTransition transitionKey="one"><button>Keep focus</button></VisualTransition>);
    const button = screen.getByRole("button"); button.focus();
    rerender(<VisualTransition transitionKey="two"><button>Keep focus</button></VisualTransition>);
    expect(button).toHaveFocus();
    expect(animation.animate).toHaveBeenCalled();
    animation.animate.mockClear();
    media(true);
    rerender(<VisualTransition transitionKey="three"><button>Keep focus</button></VisualTransition>);
    expect(animation.animate).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
  });
});
