"use client";

import { useEffect, type ReactNode } from "react";
import { useAnimate } from "motion/react-mini";
import { cx } from "@/utils/cx";
import { useVisualMotion } from "@/utils/use-visual-motion";

export function VisualTransition({ children, transitionKey, className }: { children: ReactNode; transitionKey: string; className?: string }) {
  const [scope, animate] = useAnimate();
  const motionAllowed = useVisualMotion();
  useEffect(() => {
    if (!motionAllowed || !scope.current) return;
    const animation = animate(scope.current, { opacity: [0.94, 1], transform: ["translateY(5px)", "translateY(0px)"] }, { duration: 0.24, ease: [0.22, 1, 0.36, 1] });
    return () => animation.stop();
  }, [animate, motionAllowed, scope, transitionKey]);
  // Keep the same DOM node across view changes so focus and controls survive.
  return <div ref={scope} className={cx("visual-transition", className)}>{children}</div>;
}
