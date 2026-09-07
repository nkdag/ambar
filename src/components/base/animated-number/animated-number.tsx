"use client";

// Adapted from Motion Primitives AnimatedNumber (MIT). See VISUAL_SOURCE.json.
import { useEffect, useRef, useState } from "react";
import { useSpring, useTransform } from "motion/react";
import { cx } from "@/utils/cx";
import { useVisualMotion } from "@/utils/use-visual-motion";

const format = (value: number) => Math.round(value).toLocaleString("en-US");

function NumberTween({ value }: { value: number }) {
  const [initialValue] = useState(value);
  const element = useRef<HTMLSpanElement>(null);
  const spring = useSpring(value, { stiffness: 170, damping: 30, restDelta: 0.01 });
  const display = useTransform(spring, format);
  useEffect(() => {
    const unsubscribe = display.on("change", (text) => {
      if (element.current) element.current.textContent = text;
    });
    return unsubscribe;
  }, [display]);
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <><span className="sr-only">{format(value)}</span><span ref={element} aria-hidden="true">{format(initialValue)}</span></>;
}

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionAllowed = useVisualMotion();
  return <span className={cx("tabular-nums", className)} data-animated-number>{motionAllowed ? <NumberTween value={value} /> : format(value)}</span>;
}
