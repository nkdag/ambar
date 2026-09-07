"use client";

// Adapted from Motion Primitives Spotlight (MIT). See VISUAL_SOURCE.json.
import { useEffect, useRef } from "react";
import { useSpring } from "motion/react";
import { cx } from "@/utils/cx";
import { useFinePointer, useVisualMotion } from "@/utils/use-visual-motion";

function PointerLight({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, { stiffness: 170, damping: 30 });
  const y = useSpring(0, { stiffness: 170, damping: 30 });
  useEffect(() => {
    const light = ref.current;
    const surface = light?.parentElement;
    if (!light || !surface) return;
    const unbindX = x.on("change", (value) => light.style.setProperty("--spot-x", `${value}px`));
    const unbindY = y.on("change", (value) => light.style.setProperty("--spot-y", `${value}px`));
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = surface.getBoundingClientRect();
      const nextX = event.clientX - rect.left, nextY = event.clientY - rect.top;
      if (light.dataset.active !== "true") { x.jump(nextX); y.jump(nextY); }
      else { x.set(nextX); y.set(nextY); }
      light.dataset.active = "true";
    };
    const leave = () => { light.dataset.active = "false"; x.stop(); y.stop(); };
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", leave);
    surface.addEventListener("pointercancel", leave);
    return () => {
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", leave);
      surface.removeEventListener("pointercancel", leave);
      unbindX(); unbindY(); x.stop(); y.stop();
    };
  }, [x, y]);
  return <span ref={ref} aria-hidden="true" data-spotlight className={cx("surface-spotlight", className)} />;
}
export function Spotlight({ className }: { className?: string }) {
  const motionAllowed = useVisualMotion();
  const finePointer = useFinePointer();
  return motionAllowed && finePointer ? <PointerLight className={className} /> : null;
}
